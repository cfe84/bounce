const createInfoResponseCommand = (endpoint, container) => {
    const info = !!endpoint.info;
    if (info) {
        return (request, response) => new Promise((resolve) => {
            const processingTimeMs = (new Date()).getTime() - request.receivedDate.getTime();
            request.processingTimeMs = processingTimeMs;
            response.json(request);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createInfoResponseCommand;