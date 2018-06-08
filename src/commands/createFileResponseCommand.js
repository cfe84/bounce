const fs = require("fs");

const createFileResponseCommand = (endpoint) => {
    const fileName = endpoint.file ? endpoint.file.value : null;
    let file = null;
    if (fileName) {
        file = fs.readFileSync(fileName);
    }
    if (file) {
        return (request, response) => new Promise((resolve) => {
            response.write(file);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createFileResponseCommand;