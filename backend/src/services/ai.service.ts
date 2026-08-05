import { getGeminiModel } from '@config/gemini';
import { logger } from '@config/logger';
import { ApiError } from '@utils/ApiError';

/**
 * Centralized Gemini AI integration.
 * All prompts request strict JSON output (responseMimeType: application/json)
 * so downstream code can safely JSON.parse without regex scraping.
 */

function safeParseJson<T>(raw: string, context: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.error(`[ai.service] Failed to parse Gemini JSON for ${context}: ${raw?.slice(0, 300)}`);
    throw ApiError.internal(`AI response could not be parsed (${context})`);
  }
}

export interface QuotationExtractionResult {
  price: number | null;
  currency: string | null;
  warrantyMonths: number | null;
  deliveryDays: number | null;
  paymentTerms: string | null;
  penaltyClause: string | null;
  otherTerms: string | null;
  summary: string;
  confidence: number; // 0-1
}

export const aiService = {
  /**
   * Extracts structured quotation data (price, warranty, delivery, terms,
   * penalty, payment) directly from a vendor's uploaded PDF quotation using
   * Gemini's native document understanding (no separate PDF-parsing library
   * needed — the PDF bytes are sent inline to the model).
   */
  async extractQuotationFromPdf(pdfBuffer: Buffer): Promise<QuotationExtractionResult> {
    const model = getGeminiModel(true);

    const prompt = `You are a procurement analyst. Extract structured data from this vendor quotation PDF.
Return ONLY a JSON object with these exact keys:
{
  "price": number or null (total quoted price, numeric only, no currency symbols),
  "currency": string or null (e.g. "INR", "USD"),
  "warrantyMonths": number or null (warranty period converted to months),
  "deliveryDays": number or null (delivery/lead time converted to days),
  "paymentTerms": string or null (concise description, e.g. "50% advance, 50% on delivery"),
  "penaltyClause": string or null (late delivery / breach penalty terms if mentioned),
  "otherTerms": string or null (any other notable terms, max 200 chars),
  "summary": string (2-3 sentence plain-English summary of the quotation),
  "confidence": number between 0 and 1 (your confidence in this extraction)
}
If a field cannot be determined, use null. Do not include any text outside the JSON object.`;

    const result = await model.generateContent([
      { inlineData: { data: pdfBuffer.toString('base64'), mimeType: 'application/pdf' } },
      { text: prompt },
    ]);

    const text = result.response.text();
    return safeParseJson<QuotationExtractionResult>(text, 'quotation-extraction');
  },

  /**
   * Compares multiple already-extracted quotations for the same RFQ and
   * produces a ranked comparison + recommendation with pros/cons/savings.
   */
  async compareQuotations(input: {
    rfqTitle: string;
    budget?: number;
    quotations: Array<{
      quotationId: string;
      vendorName: string;
      price: number;
      warrantyMonths?: number | null;
      deliveryDays?: number | null;
      paymentTerms?: string | null;
      penaltyClause?: string | null;
    }>;
  }): Promise<{
    ranking: Array<{
      quotationId: string;
      vendorName: string;
      rank: number;
      pros: string[];
      cons: string[];
      estimatedSavingsVsHighest: number;
    }>;
    recommendedQuotationId: string;
    recommendationReason: string;
  }> {
    const model = getGeminiModel(true);

    const prompt = `You are a procurement decision-support AI. Compare these vendor quotations for RFQ "${input.rfqTitle}"${
      input.budget ? ` (budget: ${input.budget})` : ''
    } and return ONLY JSON:
{
  "ranking": [
    {
      "quotationId": string,
      "vendorName": string,
      "rank": number (1 = best overall value),
      "pros": string[] (2-4 short bullet points),
      "cons": string[] (1-3 short bullet points),
      "estimatedSavingsVsHighest": number (currency saved vs. the highest-priced quote, 0 if this is the highest)
    }
  ],
  "recommendedQuotationId": string (the single best quotationId),
  "recommendationReason": string (2-3 sentences explaining the recommendation, weighing price, delivery, warranty, and terms)
}
Quotations data:
${JSON.stringify(input.quotations, null, 2)}
Return ONLY the JSON object, no markdown fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return safeParseJson(text, 'quotation-comparison');
  },

  /**
   * Summarizes a contract PDF and flags risk clauses (auto-renewal,
   * one-sided termination, liability caps, missing SLAs, etc).
   */
  async summarizeContract(pdfBuffer: Buffer): Promise<{ summary: string; riskFlags: string[]; keyDates: string[] }> {
    const model = getGeminiModel(true);

    const prompt = `You are a contracts analyst. Read this vendor contract PDF and return ONLY JSON:
{
  "summary": string (4-6 sentence plain-English summary of obligations, scope, and value),
  "riskFlags": string[] (specific risky clauses e.g. "Auto-renewal without notice period", "Uncapped liability", "No SLA for support response time" — empty array if none found),
  "keyDates": string[] (important dates/deadlines mentioned in the contract, formatted as readable strings)
}
Return ONLY the JSON object, no markdown fences.`;

    const result = await model.generateContent([
      { inlineData: { data: pdfBuffer.toString('base64'), mimeType: 'application/pdf' } },
      { text: prompt },
    ]);

    const text = result.response.text();
    return safeParseJson(text, 'contract-summary');
  },

  /**
   * Semantic duplicate-vendor check: catches near-duplicates that simple
   * exact-match queries (same GST/company name) would miss, e.g.
   * "Sharma Traders Pvt Ltd" vs "Sharma Trading Private Limited".
   */
  async detectSemanticDuplicate(
    candidate: { companyName: string; email: string; gstNumber?: string },
    existingVendors: Array<{ id: string; companyName: string; email: string; gstNumber?: string }>
  ): Promise<{ isDuplicate: boolean; matchedVendorId: string | null; reason: string }> {
    if (existingVendors.length === 0) {
      return { isDuplicate: false, matchedVendorId: null, reason: 'No existing vendors to compare against.' };
    }

    const model = getGeminiModel(true);
    const prompt = `You are a fraud/duplicate-detection assistant for a vendor procurement system.
New vendor registration: ${JSON.stringify(candidate)}
Existing vendors: ${JSON.stringify(existingVendors)}
Determine if the new vendor is likely the same real-world company as one already in the existing list
(accounting for name variations, abbreviations, "Pvt Ltd" vs "Private Limited", typos, same GST, etc).
Return ONLY JSON:
{
  "isDuplicate": boolean,
  "matchedVendorId": string or null (the "id" field of the matched existing vendor, if any),
  "reason": string (brief explanation)
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return safeParseJson(text, 'duplicate-detection');
  },

  /**
   * Generates a short natural-language summary for a purchase order,
   * embedded into the PDF and the vendor notification email.
   */
  async generatePurchaseOrderSummary(input: {
    vendorName: string;
    items: Array<{ name: string; quantity: number }>;
    grandTotal: number;
    deliveryDate?: string;
  }): Promise<string> {
    const model = getGeminiModel(false);
    const prompt = `Write a concise, professional 2-3 sentence summary for a purchase order.
Vendor: ${input.vendorName}
Items: ${input.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
Grand total: ${input.grandTotal}
${input.deliveryDate ? `Expected delivery: ${input.deliveryDate}` : ''}
Do not use markdown formatting. Plain text only.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  },
};
