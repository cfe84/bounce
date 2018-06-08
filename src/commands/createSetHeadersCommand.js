const createSetHeadersCommand = (endpoint) => {
    const makeHeaders = (headerList) => {
        const headers = {};
        if (headerList) {
            headerList.forEach((header) => {
                const split = header.value.split(':');
                headers[split[0]] = split[1];
            });
        }
        return headers;
    }

    return (request, response) => new Promise((resolve) => {
        const headers = makeHeaders(endpoint.header);
        response.set(headers);
        resolve();
    });
}

module.exports = createSetHeadersCommand;