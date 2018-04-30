const should = require("should");
const Parser = require("../src/commandLineParser");

const subcommands = [
	{ name: 'response', alias: "r", type: String},
	{ name: 'header', alias: "H", type: String, multiple: true},
];

const mainCommands = [
    { name: 'get', alias: "g", type: String, multiple: true, subcommands},
	{ name: 'port', alias: "P", type: Number},
	{ name: 'pizza', description: "Not having an alias shouldn't be an issue.", type: Number},
	{ name: 'help', alias: "h", type: Boolean},
];

const createParser = () => Parser(mainCommands);


describe("Command line parser", () => {
    const commandLineParser = createParser();

    it("should parse get", () => {
        const res = commandLineParser(["-g", "/something"]);
        should(res.get).not.be.undefined();
        should(res.get).have.length(1);
        should(res.get[0].value).be.equal("/something");
    });
    it("should parse two gets", () => {
        const res = commandLineParser(["-g", "/something", "--get", "/something else"]);
        should(res.get).not.be.undefined();
        should(res.get).have.length(2);
        should(res.get[0].value).be.equal("/something");
        should(res.get[1].value).be.equal("/something else");
    });
    it("should parse help" , () => {
        const res = commandLineParser(["-g", "/something", "--help"]);
        should(res.help).not.be.undefined();
        should(res.help.value).be.true();
    });
    it("should parse subcommands" , () => {
        const res = commandLineParser(["-g", "/something", "--response", "bla", "--get", "YOUHOU"]);
        should(res.get).not.be.undefined();
        should(res.get).have.length(2);
        should(res.get[0].value).be.equal("/something");
        should(res.get[0].response).not.be.undefined();
        should(res.get[0].response.value).be.equal("bla");
        should(res.get[1].value).be.equal("YOUHOU");
        should(res.get[1].response).be.undefined();
    });
    it("should handle multiple subcommands", () => {
        const res = commandLineParser(["-g", "/something", "--header", "yo", "--response", "bla", "--header", "hey", "--get", "YOUHOU"]);
        should(res).deepEqual({
            get: [{
                value: "/something",
                header: [ { value: "yo" }, { value: "hey" }],
                response: { value: "bla" }
            }, {
                value: "YOUHOU"
            }]
        })
    });
    it("should throw when unknown command", () => {
        should(() => commandLineParser(["-z"])).throw("Unknown command: z");
        should(() => commandLineParser(["-g", "/something", "-z"])).throw("Unknown command: z");
    });
    it("should throw when incomplete command", () => {
        should(() => commandLineParser(["-g"])).throw("Expecting value for command get");
    });
    it("should throw when incorrect parameter", () => {
        should(() => commandLineParser(["get"])).throw("Incorrect parameter: get");
        should(() => commandLineParser(["-g", "/adfsf", "get"])).throw("Incorrect parameter: get");
    });
    it("should throw when multiple single parameters provided", () => {
        should(() => commandLineParser(["--port", "80", "--port", "81"])).throw("port expected only once");
        should(() => commandLineParser(["--get", "/", "-r", "80", "-r", "81"])).throw("response expected only once");
    });
    it("should not alter the input string", () => {
        const input = ["--get", "/"];
        commandLineParser(input);
        should(input).have.length(2);
    })
});