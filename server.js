const express = require("express");
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const exampleUrl = "{underline /relative/url/:optional_parameter/}"
const optionDefinitions = [
    { name: 'get', typeLabel: exampleUrl, description: "create a GET endpoint", alias: "g", type: String, multiple: true},
    { name: 'put', typeLabel: exampleUrl, description: "create a PUT endpoint", alias: "u", type: String, multiple: true},
    { name: 'post', typeLabel: exampleUrl, description: "create a POST endpoint", alias: "p", type: String, multiple: true},
	{ name: 'delete', typeLabel: exampleUrl, description: "create a DELETE endpoint", alias: "d", type: String, multiple: true},
	{ name: 'echo', description: "reply with request body", alias: "e", type: Boolean},
	{ name: 'response', typeLabel: "{underline response body}", description: "specify response to be sent", alias: "b", type: String},
	{ name: 'status', typeLabel: "{underline http status}", description: "specify status for response. Defaults to 200", alias: "s", type: Number},
	{ name: 'port', typeLabel: "{underline port number}", description: "port to listen to. Defaults to environment variable PORT, then 8080", alias: "P", type: Number},
	{ name: 'help', description: "display this message", alias: "h", type: Boolean},
];

const methods = [
	"get",
	"put",
	"post",
	"delete"
];

const args = commandLineArgs(optionDefinitions, process.argv);
if (process.argv.length === 2 || args.help) {
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

const app = express();

const echo = args.echo;
const response = args.response;
const PORT = args.port || process.env.PORT || 8080;
const status = args.status || 200;

methods.forEach((method) => {
	if (args[method]) {
		args[method].forEach((endpoint) => {
			console.log(`Create endpoint ${method.toUpperCase()} ${endpoint}`);
			app[method](endpoint, (req, res) => {
				console.log(`\n\n${method.toUpperCase()} ${endpoint}`);
				console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
				console.log(`Query: ${JSON.stringify(req.query, null, 2)}`);
				console.log(`Params: ${JSON.stringify(req.params, null, 2)}`);
				res.statusCode = status;
				let data = "";
				req.on("data", (chunk) => data += chunk);
				req.on("end", () => { 
					if (echo) {
						res.write(data);
					}
					if (response) {
						res.write(response);
					}
					res.end();
					console.log(`Body: ${data}`);
					console.log(`\n\n------------------------------`);
				});
			});			
		})		
	}
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
