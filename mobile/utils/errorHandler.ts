/**
 * Error handling utilities
 */

/**
 * Create a custom API error
 */
export class CustomApiError extends Error {
  public readonly data?: any;

  constructor(message: string, data?: any) {
    super(message);
    this.name = 'CustomApiError';
    this.data = data;
    Object.setPrototypeOf(this, CustomApiError.prototype);
  }
}
