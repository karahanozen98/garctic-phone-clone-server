export class AuthorizationException extends Error {
  statusCode: number;

  constructor(message: string = "You are not authorized") {
    super(message);
    this.statusCode = 401;
  }
}
