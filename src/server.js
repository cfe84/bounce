const express = require("express");
const parseCommandLine = require("./parseCommandLine");
const https = require("https");
const uuid = require('uuid/v1');

const quietLogger = require("./logger/quietLogger");
const consoleLogger = require("./logger/consoleLogger");

const createCpuHogCommand = require("./commands/createCpuHogCommand");
const createEchoCommand = require("./commands/createEchoCommand");
const createEnvDumpCommand = require("./commands/createEnvironmentDumpCommand");
const createResponseCommand = require("./commands/createResponseCommand");
const createInfoResponseCommand = require("./commands/createInfoResponseCommand");
const createFileResponseCommand = require("./commands/createFileResponseCommand");
const createSetStatusCodeCommand = require("./commands/createSetStatusCodeCommand");
const createSetHeadersCommand = require("./commands/createSetHeadersCommand");
const createGuidCommand = require("./commands/createGuidCommand");
const createProxyCommand = require("./commands/createProxyCommand");
const createFolderResponseCommand = require("./commands/createFolderResponseCommand");

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

const logger = args.quiet ? quietLogger : consoleLogger;
const container = {
	logger
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
			endpoint.method = method;
			endpointCount++;
			endpoint.endpointCount = endpointCount;
			logger.log(`Create endpoint #${endpointCount}: ${method.toUpperCase()} ${url}`);

			const cpuHogCommand = createCpuHogCommand(endpoint, container);
			const setStatusCodeCommand = createSetStatusCodeCommand(endpoint, container);
			const setHeadersCommand = createSetHeadersCommand(endpoint, container);
			const echoCommand = createEchoCommand(endpoint, container);
			const responseCommand = createResponseCommand(endpoint, container);
			const infoResponseCommand = createInfoResponseCommand(endpoint, container);
			const fileResponseCommand = createFileResponseCommand(endpoint, container);
			const folderResponseCommand = createFolderResponseCommand(endpoint, container);
			const guidCommand = createGuidCommand(endpoint, container);
			const proxyCommand = createProxyCommand(endpoint, container);
			const envDumpCommand = createEnvDumpCommand(endpoint, container);
			
			const requestReceivedOutput = createRequestReceivedOutput(endpoint, container);
			const dataReceivedOutput = createDataReceivedOutput(endpoint, container);

			app[method](url, (req, res) => {
				requestCount++;
				const request = {
					requestCount,
					endpoint,
					receivedDate: new Date(),
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
					dataReceivedOutput(request, res)
						.then(() => cpuHogCommand(request, res))
						.then(() => setStatusCodeCommand(request, res))
						.then(() => setHeadersCommand(request, res))
						.then(() => echoCommand(request, res))
						.then(() => envDumpCommand(request, res))
						.then(() => responseCommand(request, res))
						.then(() => fileResponseCommand(request, res))
						.then(() => folderResponseCommand(request, res))
						.then(() => guidCommand(request, res))
						.then(() => proxyCommand(request, res))
						.then(() => infoResponseCommand(request, res))
						.then(() => res.end());
				});
			});
		})		
	}
});

app.all("*", (req, res) => {
	logger.warn(`#${requestCount++} ${req.method.toUpperCase()} ${req.path}: NOT FOUND`);
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
		}, app).listen(PORT, () => logger.log(`Listening on port ${PORT} with https`));
	} else {
		app.listen(PORT, () => logger.log(`Listening on port ${PORT} with http`));
	}
}
