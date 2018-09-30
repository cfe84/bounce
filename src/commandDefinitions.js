const exampleUrl = "{underline /relative/url/:optional_parameter/}";

const subcommands = [
    { name: 'echo', description: "reply with request body", alias: "e", type: Boolean},
    { name: 'env', description: "dump environment variables", alias: "E", type: Boolean},
    { name: 'info', description: "reply with information about the call (headers, query, ...). Incompatible with other responses.", alias: "i", type: Boolean},
    { name: 'guid', description: "when the node application is starting, a GUID is generated. This replies with this GUID. Particularly useful to test load balancing and server stickiness", alias: "G", type: Boolean},
	{ name: 'response', typeLabel: "{underline response body}", description: "specify response to be sent. Supports templating from url (e.g. if url is /users/:id/ and response is 'User \\{id\\} not known', when calling /users/123/, response will be User 123 not known)", alias: "r", type: String},
	{ name: 'file', typeLabel: "{underline response file}", description: "use a file containing the response", alias: "f", type: String},
	{ name: 'header', typeLabel: "{underline 'header: head'}", description: "specify header to be replied. Can have multiple", alias: "H", type: String, multiple: true},
	{ name: 'status', typeLabel: "{underline http status}", description: "specify status for response. Defaults to 200", alias: "s", type: Number},
    { name: 'cpu', typeLabel: "{underline time in seconds}", description: "will try to use 100% of one CPU for {underline seconds}. Also supports units, add h, m, s or ms to specify a duration, and c, Kc, Mc, Gc and Tc to specify a number of cycles. Default is seconds."},
	{ name: 'proxy-to', typeLabel: "{underline https://www.google.com}", description: "Proxy request to another server. Response headers and status code are returned. The 'host' header will be replaced to match the destination server.", alias: "x", type: String},
    { name: 'proxy-path', description: "Proxy request path to the proxied server as well. This is especially useful if you catch all request to the proxy. (e.g. --get '*' --proxy-to https://www.google.com --proxy-path). Path is appended to any path defined it the proxy-to sub-command, so don't use trailing slashes in the proxy path", type: Boolean},
    { name: 'proxy-certfile', typeLabel: "{underline filepath}", description: "Client certificate to authenticate requests to proxy", type: String},
    { name: 'proxy-keyfile', typeLabel: "{underline filepath}", description: "Secret client key to authenticate requests", type: String},
    { name: 'proxy-cert', typeLabel: "{underline certificate content}", description: "Client certificate to authenticate requests to proxy", type: String},
    { name: 'proxy-key', typeLabel: "{underline keyfile content}", description: "Secret client key to authenticate requests", type: String},
];

const mainCommands = [
    { name: 'get', typeLabel: exampleUrl, description: "create a GET endpoint", alias: "g", type: String, multiple: true, subcommands},
    { name: 'put', typeLabel: exampleUrl, description: "create a PUT endpoint", alias: "u", type: String, multiple: true, subcommands},
    { name: 'post', typeLabel: exampleUrl, description: "create a POST endpoint", alias: "p", type: String, multiple: true, subcommands},
    { name: 'delete', typeLabel: exampleUrl, description: "create a DELETE endpoint", alias: "d", type: String, multiple: true, subcommands},
    { name: 'all', typeLabel: exampleUrl, description: "create an endpoint matchin all methods", alias: "a", type: String, multiple: true, subcommands},
	{ name: 'port', typeLabel: "{underline port number}", description: "port to listen to. Defaults to environment variable PORT, then 8080", alias: "P", type: Number},
	{ name: 'help', description: "display this message", alias: "h", type: Boolean},
	{ name: 'quiet', description: "do not output to console", alias: "q", type: Boolean},
    { name: 'https', description: "setup the server as https", alias: "S", type: Boolean},
    { name: 'https-certfile', typeLabel: "{underline filepath}", description: "Client certificate for https endpoint", type: String},
    { name: 'https-keyfile', typeLabel: "{underline filepath}", description: "Secret client key for https endpoint", type: String},
    { name: 'https-cert', typeLabel: "{underline certificate content}", description: "Client certificate for https endpoint", type: String},
    { name: 'https-key', typeLabel: "{underline key contnet}", description: "Secret client key for https endpoint", type: String},    
];

const optionDefinitions = mainCommands.concat(subcommands);

module.exports = {
    subcommands,
    mainCommands,
    optionDefinitions
}