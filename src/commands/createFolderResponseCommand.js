const fs = require("fs");
const path = require("path");

const createFileResponseCommand = (endpoint, container) => {
    const folderName = endpoint.folder ? endpoint.folder.value : null;
    if (endpoint.value !== "*") {
        console.warn(`Warning: ${endpoint.method.toUpperCase()} ${endpoint.value} is configured as static server. A folder reply should be configured only with a catch all (*) endpoint.`)
    }
    if (folderName) {
        return (request, response) => new Promise((resolve) => {
            let fileName = request.url;
            while (fileName[0] === "/") {
                fileName = fileName.substring(1);
            }
            if (!fileName) {
                fileName = "index.html";
            }
            const filePath = path.resolve(folderName, fileName);
            if (fs.existsSync(filePath)) {
                const file = fs.readFileSync(filePath);
                response.write(file);
            } else {
                response.statusCode = 404;
                response.write(`Bounce Error: File not found: ${filePath}`);
            }
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createFileResponseCommand;