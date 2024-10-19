export class AuthorizationException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}
