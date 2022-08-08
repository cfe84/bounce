const fs = require("fs");
const mime = require("mime-types");

const createFileResponseCommand = (endpoint, container) => {
    const fileName = endpoint.file ? endpoint.file.value : null;
    if (fileName) {
        return (request, response) => new Promise((resolve) => {
            const mimeType = mime.lookup(fileName);
            response.setHeader("content-type", mimeType);
            const file = fs.readFileSync(fileName);
            response.write(file);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createFileResponseCommand;