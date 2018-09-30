const hogCpu = require("./cpuHogger");

const createCpuHogCommand = (endpoint, container) => {
    const cpuHogTime = endpoint.cpu ? endpoint.cpu.value : null;
    if (cpuHogTime) {
        parsed = /^([0-9]+)[ ]*(h|m|s|ms|c|Mc|Kc|Gc|Tc)?$/.exec(cpuHogTime);
        if (parsed === null) {
            throw Error(`Cpu hog time not in a correct format: ${cpuHogTime}`);
        }
        const duration = parsed[1];
        const unit = parsed[2];
        let durationMs, cycles;
        if (unit && 
            unit.substr(unit.length - 1, 1) === "c") {
            const multiplier =
                unit === "c" ? 1
                : unit === "Kc" ? 1000
                : unit === "Mc" ? 1000000
                : unit === "Gc" ? 1000000000
                : unit === "Tc" ? 1000000000000
                : 1;
            cycles = duration * multiplier;
        } else {
            const multiplier = 
            unit === "h" ? 3600000
            : unit === "m" ? 60000
            : unit === "s" ? 1000
            : unit === "ms" ? 1
            : 60;
            durationMs = duration * multiplier;
        }
        const hogParams = {
            timeoutInMilliseconds: durationMs,
            timeoutInCycles: cycles
        };
        return (request, response) => new Promise((resolve) => {
            hogCpu(hogParams);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createCpuHogCommand;