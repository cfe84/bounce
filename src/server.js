const express = require("express");
const commandLineUsage = require('command-line-usage');
const CommandLineParser = require("./commandLineParser");
const fs = require("fs");

const exampleUrl = "{underline /relative/url/:optional_parameter/}";

const subcommands = [
    { name: 'echo', description: "reply with request body", alias: "e", type: Boolean},
	{ name: 'response', typeLabel: "{underline response body}", description: "specify response to be sent", alias: "r", type: String},
	{ name: 'file', typeLabel: "{underline response file}", description: "use a file containing the response", alias: "f", type: String},
	{ name: 'header', typeLabel: "{underline 'header: head'}", description: "specify header to be replied. Can have multiple", alias: "H", type: String, multiple: true},
	{ name: 'status', typeLabel: "{underline http status}", description: "specify status for response. Defaults to 200", alias: "s", type: Number},
];

const mainCommands = [
    { name: 'get', typeLabel: exampleUrl, description: "create a GET endpoint", alias: "g", type: String, multiple: true, subcommands},
    { name: 'put', typeLabel: exampleUrl, description: "create a PUT endpoint", alias: "u", type: String, multiple: true, subcommands},
    { name: 'post', typeLabel: exampleUrl, description: "create a POST endpoint", alias: "p", type: String, multiple: true, subcommands},
	{ name: 'delete', typeLabel: exampleUrl, description: "create a DELETE endpoint", alias: "d", type: String, multiple: true, subcommands},
	{ name: 'port', typeLabel: "{underline port number}", description: "port to listen to. Defaults to environment variable PORT, then 8080", alias: "P", type: Number},
	{ name: 'help', description: "display this message", alias: "h", type: Boolean},
];

const commandLineParser = CommandLineParser(mainCommands);
const optionDefinitions = mainCommands.concat(subcommands);

const methods = [
	"get",
	"put",
	"post",
	"delete"
];

const displayUsage = () => {
	const usage = [
		{ 
			header: "Bounce", 
			content: "This is a server that will listen to HTTP calls and \
answer what you ask it to."},
		{
			header: "Example",
			content: "bounce --get /api/users/:id/something --post /api/users/ --port 8080 --echo &"
		},
		{
			header: "Options",
			optionList: optionDefinitions
		}
	]
	console.log(commandLineUsage(usage));
	return;
}

let args;
try {
	args = commandLineParser(process.argv.slice(2));
}
catch(error) {
	console.error(error.message);
	return displayUsage();
}
if (process.argv.length === 2 || !!args.help) {
	displayUsage();
}

const app = express();

const makeHeaders = (headerList) => {
	const headers = {};
	if (headerList) {
		headerList.forEach((header) => {
			const split = header.value.split(':');
			headers[split[0]] = split[1];
		});
	}
	return headers;
}
const PORT = (args.port ? args.port.value :  process.env.PORT) || 8080;
let endpointCount = 0;
methods.forEach((method) => {
	if (args[method]) {
		args[method].forEach((endpoint) => {
			endpointCount++;
			console.log(`Create endpoint #${endpointCount}: ${method.toUpperCase()} ${endpoint.value}`);
			const headers = makeHeaders(endpoint.header);
			const status = endpoint.status ? endpoint.status.value : 200;
			const echo = !!endpoint.echo;
			const response = endpoint.response ? endpoint.response.value : null;
			const fileName = endpoint.file ? endpoint.file.value : null;
			let file = null;
			if (fileName) {
				file = fs.readFileSync(fileName);
			}
			app[method](endpoint.value, (req, res) => {
				console.log(`\n\n#${endpointCount}: ${method.toUpperCase()} ${endpoint.value}`);
				console.log(`Received from ${req.connection.remoteAddress}`);
				console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
				console.log(`Query: ${JSON.stringify(req.query, null, 2)}`);
				console.log(`Params: ${JSON.stringify(req.params, null, 2)}`);
				res.statusCode = status;
				let data = "";
				res.set(headers);
				req.on("data", (chunk) => data += chunk);
				req.on("end", () => {
					if (echo) {
						res.write(data);
					}
					if (response) {
						res.write(response);
					}
					if (file) {
						res.write(file);
					}
					res.end();
					console.log(`Body: ${data}`);
					console.log(`\n\n------------------------------`);
				});
			});			
		})		
	}
});

if (endpointCount > 0) {
	app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}