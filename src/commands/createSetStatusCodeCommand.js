const createSetStatusCodeCommand = (endpoint, container) => {
    const status = endpoint.status ? endpoint.status.value : 200;
    return (request, response) => new Promise((resolve) => {
        response.statusCode = status;
        resolve();
    });
}

module.exports = createSetStatusCodeCommand;