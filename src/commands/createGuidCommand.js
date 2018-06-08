const createGuidCommand = (endpoint) => {
    const guid = !!endpoint.guid;
    if (guid) {
        return (request, response) => new Promise((resolve) => {
            response.write(request.serverGuid);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createGuidCommand;