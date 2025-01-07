/* ExpressError class that extends the Error class. */
class ExpressError extends Error {
    constructor(message, statusCode) {
        super(); // Calls the parent(Error) constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;