const hogCpu = require("./cpuHogger");

const createCpuHogCommand = (endpoint, container) => {
    const cpuHogTime = endpoint.cpu ? endpoint.cpu.value : null;
    if (cpuHogTime) {
        parsed = /^([0-9]+)[ ]*(h|m|s|ms)?$/.exec(cpuHogTime);
        if (parsed === null) {
            throw Error(`Cpu hog time not in a correct format: ${cpuHogTime}`);
        }
        const duration = parsed[1];
        const unit = parsed[2];
        const multiplier = 
            unit === "h" ? 3600000
            : unit === "m" ? 60000
            : unit === "s" ? 1000
            : unit === "ms" ? 1
            : 60;
        const durationMs = duration * multiplier;
        return (request, response) => new Promise((resolve) => {
            hogCpu(durationMs);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createCpuHogCommand;