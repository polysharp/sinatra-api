export class HttpError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Bad Request", details?: any) {
    super(message, 400, details);
  }
}

export class Unauthorized extends HttpError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, 401, details);
  }
}

export class Forbidden extends HttpError {
  constructor(message = "Forbidden", details?: any) {
    super(message, 403, details);
  }
}

export class NotFound extends HttpError {
  constructor(message = "Not Found", details?: any) {
    super(message, 404, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
