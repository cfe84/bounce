const express = require("express");
const parseCommandLine = require("./parseCommandLine");
const https = require("https");
const uuid = require('uuid/v1');

const createCpuHogCommand = require("./commands/createCpuHogCommand");
const createEchoCommand = require("./commands/createEchoCommand");
const createResponseCommand = require("./commands/createResponseCommand");
const createFileResponseCommand = require("./commands/createFileResponseCommand");
const createSetStatusCodeCommand = require("./commands/createSetStatusCodeCommand");
const createSetHeadersCommand = require("./commands/createSetHeadersCommand");
const createGuidCommand = require("./commands/createGuidCommand");
const createProxyCommand = require("./commands/createProxyCommand");

const createRequestReceivedOutput = require("./consoleOutput/createRequestReceivedOutput");
const createDataReceivedOutput = require("./consoleOutput/createDataReceivedOutput");

const methods = [
	"get",
	"put",
	"post",
	"delete",
	"all"
];

const args = parseCommandLine();
if (!args) {
	return;
}

const app = express();

getValueIfDefined = (endpoint, key) => endpoint[key] ? endpoint[key].value : null

const HTTPS = !!args.https;
const PORT = (args.port ? args.port.value :  process.env.PORT) || 8080;
const GUID = uuid();
let endpointCount = 0;
let requestCount = 0;
methods.forEach((method) => {
	if (args[method]) {
		args[method].forEach((endpoint) => {
			const url = endpoint.value;
			endpointCount++;
			endpoint.endpointCount = endpointCount;
			console.log(`Create endpoint #${endpointCount}: ${method.toUpperCase()} ${url}`);

			const cpuHogCommand = createCpuHogCommand(endpoint);
			const setStatusCodeCommand = createSetStatusCodeCommand(endpoint);
			const setHeadersCommand = createSetHeadersCommand(endpoint);
			const echoCommand = createEchoCommand(endpoint);
			const responseCommand = createResponseCommand(endpoint);
			const fileResponseCommand = createFileResponseCommand(endpoint);
			const guidCommand = createGuidCommand(endpoint);
			const proxyCommand = createProxyCommand(endpoint);
			
			const requestReceivedOutput = createRequestReceivedOutput(endpoint);
			const dataReceivedOutput = createDataReceivedOutput(endpoint);

			app[method](url, (req, res) => {
				requestCount++;
				const request = {
					requestCount,
					method: req.method,
					remoteAddress: req.connection.remoteAddress,
					headers: req.headers,
					query: req.query,
					url: req.url,
					params: req.params,
					cert: req.secure && req.socket.getPeerCertificate(),
					serverGuid: GUID
				};

				requestReceivedOutput(request, res);

				let data = "";

				req.on("data", (chunk) => data += chunk);
				req.on("end", () => {
					request.data = data;
					dataReceivedOutput(request, res);
					cpuHogCommand(request, res)
					.then(() => setStatusCodeCommand(request, res))
					.then(() => setHeadersCommand(request, res))
					.then(() => echoCommand(request, res))
					.then(() => responseCommand(request, res))
					.then(() => fileResponseCommand(request, res))
					.then(() => guidCommand(request, res))
					.then(() => proxyCommand(request, res))
					.then(() => {
						res.end();
					})
					
				});
			});
		})		
	}
});

app.all("*", (req, res) => {
	console.warn(`#${requestCount++} ${req.method.toUpperCase()} ${req.path}: NOT FOUND`);
	res.statusCode = 404;
	res.end("Not found (Endpoint not matched in Bounce)");
});

if (endpointCount > 0) {
	if (HTTPS) {
		const httpsCertificateFile = getValueIfDefined(args, "https-certfile");
		const keyCertificateFile = getValueIfDefined(args, "https-keyfile");
		const httpsCertificate = getValueIfDefined(args, "https-cert") || fs.readFileSync(httpsCertificateFile);
		const keyCertificate =  getValueIfDefined(args, "https-key") ||fs.readFileSync(keyCertificateFile);
		https.createServer({
			key: keyCertificate,
			cert: httpsCertificate
		}, app).listen(PORT, () => console.log(`Listening on port ${PORT} with https`));
	} else {
		app.listen(PORT, () => console.log(`Listening on port ${PORT} with http`));
	}
}
