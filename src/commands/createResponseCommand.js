const createResponseCommand = (endpoint) => {
    const responseToSend = endpoint.response ? endpoint.response.value : null;
    if (responseToSend) {
        return (request, response) => new Promise((resolve) => {
            response.write(responseToSend);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createResponseCommand;