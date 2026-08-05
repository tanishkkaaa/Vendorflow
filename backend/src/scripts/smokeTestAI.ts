/* eslint-disable no-console */
/**
 * Smoke test for the Gemini AI integration (src/services/ai.service.ts).
 *
 * Runs every AI function against synthetic sample data (a generated
 * quotation PDF and contract PDF, plus hand-written comparison/duplicate
 * data) and prints pass/fail per function. Does NOT require MongoDB,
 * Redis, or Cloudinary — only GEMINI_API_KEY needs to be set in .env.
 *
 * Usage:
 *   npm run smoke:ai
 */
import 'dotenv/config';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { aiService } from '../services/ai.service';
import { env } from '../config/env';

function generateSamplePdf(lines: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    doc.pipe(stream);
    doc.fontSize(12);
    lines.forEach((line) => doc.text(line).moveDown(0.3));
    doc.end();
  });
}

const SAMPLE_QUOTATION_LINES = [
  'QUOTATION',
  'From: BrightTech Distributors Pvt Ltd',
  'To: Acme Manufacturing Pvt Ltd',
  '',
  'Item: 50x Dell Latitude 5440 Laptops (i5, 16GB RAM, 512GB SSD)',
  'Total Price: INR 42,50,000',
  'Warranty: 3 years onsite',
  'Delivery Timeline: 21 business days from PO date',
  'Payment Terms: 40% advance, 60% on delivery, net 15 days',
  'Penalty Clause: 0.5% of order value per week for delayed delivery, capped at 5%',
  'Other Terms: Free installation and setup included. Extended warranty available at extra cost.',
];

const SAMPLE_CONTRACT_LINES = [
  'SERVICE AGREEMENT',
  'Between Acme Manufacturing Pvt Ltd and BrightTech Distributors Pvt Ltd',
  '',
  'This agreement covers the supply and maintenance of IT hardware for a period of 12 months.',
  'Contract Value: INR 50,00,000 per annum',
  'Start Date: 1 January 2026',
  'End Date: 31 December 2026',
  '',
  'Clause 4: This agreement shall automatically renew for successive 12-month terms unless',
  'either party provides written notice of non-renewal at least 90 days before expiry.',
  '',
  'Clause 7: Vendor liability under this agreement is uncapped for damages arising from',
  'gross negligence or willful misconduct.',
  '',
  'Clause 9: Vendor shall respond to critical support tickets within 4 business hours.',
];

async function main() {
  console.log('--- VendorFlow AI: Gemini smoke test ---');
  console.log(`Model: ${env.gemini.model}`);
  console.log(`API key present: ${env.gemini.apiKey ? 'yes' : 'NO — set GEMINI_API_KEY in .env'}\n`);

  if (!env.gemini.apiKey) {
    console.error('Aborting: GEMINI_API_KEY is not set.');
    process.exit(1);
  }

  const results: { name: string; ok: boolean; detail?: string }[] = [];

  // 1. Quotation PDF extraction
  try {
    console.log('[1/5] extractQuotationFromPdf...');
    const pdf = await generateSamplePdf(SAMPLE_QUOTATION_LINES);
    const extracted = await aiService.extractQuotationFromPdf(pdf);
    console.log(JSON.stringify(extracted, null, 2));
    const ok = typeof extracted.price === 'number' && typeof extracted.summary === 'string';
    results.push({ name: 'extractQuotationFromPdf', ok, detail: ok ? undefined : 'Missing expected fields' });
  } catch (err) {
    results.push({ name: 'extractQuotationFromPdf', ok: false, detail: (err as Error).message });
  }
  console.log('');

  // 2. Quote comparison
  try {
    console.log('[2/5] compareQuotations...');
    const comparison = await aiService.compareQuotations({
      rfqTitle: 'Procurement of 50 Laptops',
      budget: 4500000,
      quotations: [
        {
          quotationId: 'q1',
          vendorName: 'BrightTech Distributors',
          price: 4250000,
          warrantyMonths: 36,
          deliveryDays: 21,
          paymentTerms: '40% advance, 60% on delivery',
          penaltyClause: '0.5% per week, capped at 5%',
        },
        {
          quotationId: 'q2',
          vendorName: 'Nova Systems',
          price: 4400000,
          warrantyMonths: 24,
          deliveryDays: 14,
          paymentTerms: '100% advance',
          penaltyClause: 'None',
        },
      ],
    });
    console.log(JSON.stringify(comparison, null, 2));
    const ok = Array.isArray(comparison.ranking) && comparison.ranking.length === 2 && !!comparison.recommendedQuotationId;
    results.push({ name: 'compareQuotations', ok, detail: ok ? undefined : 'Unexpected shape' });
  } catch (err) {
    results.push({ name: 'compareQuotations', ok: false, detail: (err as Error).message });
  }
  console.log('');

  // 3. Contract summarization + risk detection
  try {
    console.log('[3/5] summarizeContract...');
    const pdf = await generateSamplePdf(SAMPLE_CONTRACT_LINES);
    const result = await aiService.summarizeContract(pdf);
    console.log(JSON.stringify(result, null, 2));
    const ok = typeof result.summary === 'string' && Array.isArray(result.riskFlags);
    results.push({ name: 'summarizeContract', ok, detail: ok ? undefined : 'Unexpected shape' });
  } catch (err) {
    results.push({ name: 'summarizeContract', ok: false, detail: (err as Error).message });
  }
  console.log('');

  // 4. Duplicate vendor detection
  try {
    console.log('[4/5] detectSemanticDuplicate...');
    const result = await aiService.detectSemanticDuplicate(
      { companyName: 'Sharma Trading Private Limited', email: 'contact@sharmatrading.in' },
      [
        { id: 'v1', companyName: 'Sharma Traders Pvt Ltd', email: 'info@sharmatraders.in' },
        { id: 'v2', companyName: 'Global Steel Works', email: 'sales@globalsteel.com' },
      ]
    );
    console.log(JSON.stringify(result, null, 2));
    const ok = typeof result.isDuplicate === 'boolean';
    results.push({ name: 'detectSemanticDuplicate', ok, detail: ok ? undefined : 'Unexpected shape' });
  } catch (err) {
    results.push({ name: 'detectSemanticDuplicate', ok: false, detail: (err as Error).message });
  }
  console.log('');

  // 5. Purchase order summary
  try {
    console.log('[5/5] generatePurchaseOrderSummary...');
    const summary = await aiService.generatePurchaseOrderSummary({
      vendorName: 'BrightTech Distributors',
      items: [{ name: 'Dell Latitude 5440 Laptop', quantity: 50 }],
      grandTotal: 5015000,
      deliveryDate: 'Sep 15, 2026',
    });
    console.log(summary);
    results.push({ name: 'generatePurchaseOrderSummary', ok: summary.length > 0 });
  } catch (err) {
    results.push({ name: 'generatePurchaseOrderSummary', ok: false, detail: (err as Error).message });
  }

  console.log('\n--- Summary ---');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
    if (!r.ok) allPassed = false;
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
