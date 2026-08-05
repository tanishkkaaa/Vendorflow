export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;
  public meta?: Record<string, unknown>;

  constructor(message: string, data?: T, meta?: Record<string, unknown>, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
