const createDataReceivedOutput = (endpoint, container) => {
    const output = !endpoint.silent;
    const logger = container.logger;
    return (request, response) => {
        if (output) {
            logger.log(`Body: ${request.data}`);
            logger.log(`\n\n------------------------------`);
        }
        return Promise.resolve();
    }
}

module.exports = createDataReceivedOutput;