const proxy = require("./proxy");

const createProxyCommand = (endpoint) => {
    const proxyTo = endpoint["proxy-to"] ? endpoint["proxy-to"].value : null;
    const proxyPath = !!endpoint["proxy-path"];
    const proxyKeyfile = endpoint["proxy-keyfile"] ? endpoint["proxy-keyfile"].value : null;
    const proxyCertfile = endpoint["proxy-certfile"] ? endpoint["proxy-certfile"].value : null;
    const proxyKey = getValueIfDefined(endpoint, "proxy-key");
    const proxyCert = getValueIfDefined(endpoint, "proxy-cert");
    if (proxyTo) {
        return (request, response) => proxy(
            {
                proxyTo, 
                proxyPath, 
                certFile: proxyCertfile, 
                keyFile: proxyKeyfile,
                cert: proxyCert,
                key: proxyKey
            }, 
            request,
            response)
            .catch((error) => {
                response.write(`Bounce error - proxy failed: ${error}`);
            })
    }
    return () => Promise.resolve();
}

module.exports = createProxyCommand;