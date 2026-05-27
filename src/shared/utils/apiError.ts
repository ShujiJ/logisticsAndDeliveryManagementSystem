class ApiError extends Error {
  statusCode: number;
//you MUST call: super() before using this because parent object must initialize first.
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
