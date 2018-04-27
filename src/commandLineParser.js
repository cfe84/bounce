const parser = (commands) => {
    const findCommand = (commandList, commandText) => {
        return commandList.find((command) => command.name === commandText);
    }

    const findAlias = (commandList, commandText) => {
        return commandList.find((command) => command.alias === commandText);
    }

    const processCommand = (res, commandLine, command) => {
        let value;
        if (command.type === Boolean) {
            value = true
        } else {
            if (commandLine.length === 0) {
                throw Error(`Expecting value for command ${command.name}`);
            }
            value = commandLine.shift();
        }
        const parsedCommand = {
            value
        };
        const nextCommandIsSubcommand = () => {
            const nextCommand = commandLine[0];
            const nextCommandIsAlias = !!isAlias(nextCommand) && !!findAlias(command.subcommands, nextCommand.substring(1));
            const nextCommandIsCommand = !!isCommand(nextCommand) && !!findCommand(command.subcommands, nextCommand.substring(2));
            return nextCommandIsAlias || nextCommandIsCommand;
        }
        while(commandLine.length > 0 && 
            command.subcommands &&
            nextCommandIsSubcommand()) {
            parseCommand(command.subcommands, parsedCommand, commandLine);
        }
        if (command.multiple) {
            if (res[command.name]) {
                res[command.name].push(parsedCommand);
            }
            else {
                res[command.name] = [parsedCommand];
            }
        } else {
            if (res[command.name]) {
                throw Error(`${command.name} expected only once`);
            }
            else {
                res[command.name] = parsedCommand;
            }
        }
    }

    const isAlias = (commandTxt) => commandTxt.length === 2 && commandTxt[0] === "-";
    const isCommand = (commandTxt) => commandTxt.length > 2 && commandTxt.substring(0, 2) === "--";

    const parseCommand = (commandList, res, commandLine) => {
        if (commandLine.length === 0) {
            return;
        }
        let commandTxt = commandLine.shift();
        const commandIsAlias = isAlias(commandTxt);
        const commandIsCommand = isCommand(commandTxt);

        if (!commandIsCommand && !commandIsAlias) {
            throw Error(`Incorrect parameter: ${commandTxt}`);
        }
        if (commandIsCommand) {
            commandTxt = commandTxt.substring(2);
        }
        if (commandIsAlias) {
            commandTxt = commandTxt.substring(1);
        }
        const command = commandIsAlias ? findAlias(commandList, commandTxt) : findCommand(commandList, commandTxt);
        if (!command) {
            throw Error(`Unknown command: ${commandTxt}`);
        }
        processCommand(res, commandLine, command);
    }

    const parseCommandLine = (commandLine) => {
        const commandLineCopy = commandLine.slice();
        const res = {};
        while(commandLineCopy.length > 0) {
            parseCommand(commands, res, commandLineCopy);    
        }
        return res;
    }
    return parseCommandLine;
}

module.exports = parser;