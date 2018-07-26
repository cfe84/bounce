const createEnvironmentDumpCommand = (endpoint, container) => {
    const env = !!endpoint.env;
    if (env) {
        return (request, response) => new Promise((resolve) => {
            response.json(process.env);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createEnvironmentDumpCommand;