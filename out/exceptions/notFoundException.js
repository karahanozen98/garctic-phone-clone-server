export class NotFoundException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}
//# sourceMappingURL=notFoundException.js.map