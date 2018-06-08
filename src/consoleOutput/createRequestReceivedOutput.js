const createRequestReceivedOutput = (endpoint) => {
    const url = endpoint.value;

    return (request, response) => {
        console.log(`\n\n#${request.requestCount} - ${new Date()}: ${request.method.toUpperCase()} ${url} (Endpoint #${endpoint.endpointCount})`);
        console.log(`Received from ${request.remoteAddress}`);
        console.log(`Headers: ${JSON.stringify(request.headers, null, 2)}`);
        console.log(`Query: ${JSON.stringify(request.query, null, 2)}`);
        console.log(`Params: ${JSON.stringify(request.params, null, 2)}`);
        if (request.cert && request.cert.subject) {
            console.log(`Client certificate: ${request.cert.subject.CN}`);
        }
    }
}

module.exports = createRequestReceivedOutput;