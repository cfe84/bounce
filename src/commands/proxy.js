const url = require("url");
const fs = require("fs");
const proxy = (params, req, res) => {
    let proxyUrl = params.proxyTo;
    let proxyPath = params.proxyPath;
    let certFile = params.certFile;
    let keyFile = params.keyFile;
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
    console.log(`Proxying to ${req.method} ${protocol}://${proxyTo.hostname}:${port}${path}`);

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
            console.log(`Response Status Code: ${resp.statusCode}`);
            console.log(`    Response Headers: ${JSON.stringify(req.headers, null, 2)}`);
            res.statusCode = resp.statusCode;
            res.set(resp.headers);
            resp.on("data", (chunk) => {
                data += chunk
                res.write(chunk);
            });
            resp.on("end", () => {
                if (data.length < 5096) {
                    console.log(`   Response Body: ${data}`);
                } else {
                    console.log(`   Response Body: ${data.substr(0, 5096)}[...] (Truncated)`);
                }
                resolve();
            });
        });
        if (req.data) {
            passThru.write(req.data);
        }
        passThru.on("error", (err) => {
            console.error(`Error while proxying: ${err}`);
            reject(err);
        });
        passThru.end();
    });
}

module.exports = proxy;