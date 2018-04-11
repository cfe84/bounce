const express = require("express");
const app = express();

app.get("/MSI/token/", (req, res) => {
	console.log("received call");
	res.write("This is me");
	res.end();
});

app.listen(8080);
