const commandDefinitions = require("./commandDefinitions");
const commandLineUsage = require('command-line-usage');
const CommandLineParser = require("./commandLineParser");
const shellwords = require("shellwords");

const parseCommandLine = () => {
    const commandLineParser = CommandLineParser(commandDefinitions.mainCommands);

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
                optionList: commandDefinitions.optionDefinitions
            }
        ]
        console.log(commandLineUsage(usage));
    }
    
    const getCommandLineFromEnv = () => {
        const commandLine = process.env.BOUNCE_COMMAND;
        if (commandLine) {
            return shellwords.split(commandLine);
        }
        return null;
    }

    let args;
    let argv = process.argv;
    const commandFromEnv = getCommandLineFromEnv();
    try {
        if (commandFromEnv) {
            args = commandLineParser(commandFromEnv);        
        } else {
            args = commandLineParser(process.argv.slice(2));
        }
    }
    catch(error) {
        console.error(error.message);
        displayUsage();
        return null;
    }
    if ((process.argv.length === 2 && !commandFromEnv) || !!args.help) {
        displayUsage();
    }
    return args;
}

module.exports = parseCommandLine;