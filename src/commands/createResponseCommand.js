const createResponse = (responseTemplate, parameters) => {
    let responseToSend = responseTemplate;
    for (var property in parameters) {
        if (parameters.hasOwnProperty(property)) {
            const value = parameters[property];
            responseToSend = responseToSend.replace(new RegExp(`{${property}}`, 'g'), value);
        }
    }
    return responseToSend;
}

const createResponseCommand = (endpoint, container) => {
    const responseTemplate = endpoint.response ? endpoint.response.value : null;
    if (responseTemplate) {
        return (request, response) => new Promise((resolve) => {
            const responseToSend = createResponse(responseTemplate, request.params);
            response.write(responseToSend);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createResponseCommand;