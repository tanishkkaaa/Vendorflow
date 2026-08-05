import { Model, Document, FilterQuery, UpdateQuery, Types, QueryOptions } from 'mongoose';

/**
 * Generic repository implementing the Repository Pattern.
 * All feature-specific repositories extend this to inherit standard CRUD,
 * keeping data-access logic isolated from business logic in services.
 */
export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string | Types.ObjectId, populate?: string | string[]): Promise<T | null> {
    const query = this.model.findById(id);
    if (populate) query.populate(populate as string);
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, populate?: string | string[]): Promise<T | null> {
    const query = this.model.findOne(filter);
    if (populate) query.populate(populate as string);
    return query.exec();
  }

  async find(
    filter: FilterQuery<T>,
    options?: { skip?: number; limit?: number; sort?: Record<string, 1 | -1>; populate?: string | string[] }
  ): Promise<T[]> {
    const query = this.model.find(filter);
    if (options?.sort) query.sort(options.sort);
    if (options?.skip) query.skip(options.skip);
    if (options?.limit) query.limit(options.limit);
    if (options?.populate) query.populate(options.populate as string);
    return query.exec();
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async updateById(id: string | Types.ObjectId, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { new: true }).exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter);
    return !!doc;
  }
}
