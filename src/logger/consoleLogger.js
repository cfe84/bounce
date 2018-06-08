const truncate = (message) => {
    if (message && message.length > 5096) {
        return message.substr(0, 5096) + "[...] (Truncated)"
    } else
        return message;
}

const consoleLogger = {
    log:    (message) => console.log(truncate(message)),
    warn:   (message) => console.warn(truncate(message)),
    error:  (message) => console.error(truncate(message))
}

module.exports = consoleLogger;