const createRequestReceivedOutput = (endpoint, container) => {
    const url = endpoint.value;
    const output = !endpoint.silent;
    const logger = container.logger;

    return (request, response) => {
        if (output) {
            logger.log(`\n\n#${request.requestCount} - ${new Date()}: ${request.method.toUpperCase()} ${url} (Endpoint #${endpoint.endpointCount})`);
            logger.log(`Received from ${request.remoteAddress}`);
            logger.log(`Headers: ${JSON.stringify(request.headers, null, 2)}`);
            logger.log(`Query: ${JSON.stringify(request.query, null, 2)}`);
            logger.log(`Params: ${JSON.stringify(request.params, null, 2)}`);
            if (request.cert && request.cert.subject) {
                logger.log(`Client certificate: ${request.cert.subject.CN}`);
            }
        }        
    }
}

module.exports = createRequestReceivedOutput;