const url = require("url");
const fs = require("fs");
const proxy = (params, req, res) => {
    let proxyUrl = params.proxyTo;
    let proxyPath = params.proxyPath;
    let certFile = params.certFile;
    let keyFile = params.keyFile;
    const logger = params.container.logger;
    const cert = params.cert || (certFile ? fs.readFileSync(certFile) : null);
    const key = params.key || (keyFile ? fs.readFileSync(keyFile) : null);

    let proxyTo = url.parse(proxyUrl);
    if (!proxyTo.protocol) {
        proxyUrl = `http://${proxyUrl}`;
        proxyTo = url.parse(proxyUrl);
    }
    const protocol = proxyTo.protocol.slice(0, -1);
    const http = require(protocol);
    const port = proxyTo.port || (protocol === "http" ? 80 : 443);
    const path = proxyPath 
        ? proxyTo.path !== "/" ?
            `${proxyTo.path}${req.url}`
            : req.url
        : proxyTo.path;
    logger.log(`Proxying to ${req.method} ${protocol}://${proxyTo.hostname}:${port}${path}`);

    req.headers.host = `${proxyTo.hostname}:${port}`

    return new Promise((resolve, reject) => {
        const passThru = http.request({
            port: port,
            hostname: proxyTo.hostname,
            path,
            method: req.method,
            headers: req.headers,
            key,
            cert
        }, (resp) => {
            let data = "";
            logger.log(`Response Status Code: ${resp.statusCode}`);
            logger.log(`    Response Headers: ${JSON.stringify(req.headers, null, 2)}`);
            res.statusCode = resp.statusCode;
            res.set(resp.headers);
            resp.on("data", (chunk) => {
                data += chunk
                res.write(chunk);
            });
            resp.on("end", () => {
                logger.log(`   Response Body: ${data}`);
                resolve();
            });
        });
        if (req.data) {
            passThru.write(req.data);
        }
        passThru.on("error", (err) => {
            logger.error(`Error while proxying: ${err}`);
            reject(err);
        });
        passThru.end();
    });
}

module.exports = proxy;