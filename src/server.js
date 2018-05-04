const express = require("express");
const fs = require("fs");
const proxy = require("./proxy");
const parseCommandLine = require("./parseCommandLine");

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

getValueIfDefined = (endpoint, key) => endpoint[key] ? endpoint[key].value : null

const PORT = (args.port ? args.port.value :  process.env.PORT) || 8080;
let endpointCount = 0;
let requestCount = 0;
methods.forEach((method) => {
	if (args[method]) {
		args[method].forEach((endpoint) => {
			endpointCount++;
			const url = endpoint.value;
			console.log(`Create endpoint #${endpointCount}: ${method.toUpperCase()} ${url}`);
			const headers = makeHeaders(endpoint.header);
			const status = endpoint.status ? endpoint.status.value : 200;
			const echo = !!endpoint.echo;
			const response = endpoint.response ? endpoint.response.value : null;
			const fileName = endpoint.file ? endpoint.file.value : null;
			let file = null;
			if (fileName) {
				file = fs.readFileSync(fileName);
			}
			const proxyTo = endpoint["proxy-to"] ? endpoint["proxy-to"].value : null;
			const proxyPath = !!endpoint["proxy-path"];
			const proxyKeyfile = endpoint["proxy-keyfile"] ? endpoint["proxy-keyfile"].value : null;
			const proxyCertfile = endpoint["proxy-certfile"] ? endpoint["proxy-certfile"].value : null;
			const proxyKey = getValueIfDefined(endpoint, "proxy-key");
			const proxyCert = getValueIfDefined(endpoint, "proxy-cert");;
			
			app[method](url, (req, res) => {
				requestCount++;
				console.log(`\n\n#${requestCount} - ${new Date()}: ${req.method.toUpperCase()} ${url} (Endpoint #${endpointCount})`);
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
					if (proxyTo) {
						proxy(
							{
								proxyTo, 
								proxyPath, 
								certFile: proxyCertfile, 
								keyFile: proxyKeyfile,
								cert: proxyCert,
								key: proxyKey
							}, 
							req,
							data,
							res);
					}
					if (!proxyTo) {
						res.end();
					}
					console.log(`Body: ${data}`);
					console.log(`\n\n------------------------------`);
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
	app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}