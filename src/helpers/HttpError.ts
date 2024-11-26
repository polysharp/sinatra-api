export class HttpError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Bad Request", details?: unknown) {
    super(message, 400, details);
  }
}

export class Unauthorized extends HttpError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, details);
  }
}

export class Forbidden extends HttpError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, details);
  }
}

export class NotFound extends HttpError {
  constructor(message = "Not Found", details?: unknown) {
    super(message, 404, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
