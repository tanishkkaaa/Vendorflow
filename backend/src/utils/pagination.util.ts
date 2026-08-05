import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sort: { [sortBy]: sortOrder } };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
