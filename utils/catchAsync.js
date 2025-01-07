// Export a function that takes an asynchronous function (func) as an argument
module.exports = func => {
    // Return a new function that takes req, res, and next as arguments
    return (req, res, next) => {
        // Call the asynchronous function with req, res, and next
        // If the function throws an error, pass it to the next middleware
        func(req, res, next).catch(next);
    }
}