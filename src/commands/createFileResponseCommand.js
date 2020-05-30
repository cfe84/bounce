const fs = require("fs");

const createFileResponseCommand = (endpoint, container) => {
    const fileName = endpoint.file ? endpoint.file.value : null;
    if (fileName) {
        return (request, response) => new Promise((resolve) => {
            const file = fs.readFileSync(fileName);
            response.write(file);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createFileResponseCommand;