const createInfoResponseCommand = (endpoint, container) => {
    const info = !!endpoint.info;
    if (info) {
        return (request, response) => new Promise((resolve) => {
            response.json(request);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createInfoResponseCommand;