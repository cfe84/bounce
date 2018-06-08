const createEchoCommand = (endpoint) => {
    const echo = !!endpoint.echo;
    if (echo) {
        return (request, response) => new Promise((resolve) => {
            response.write(request.data);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createEchoCommand;