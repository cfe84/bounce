const hogCpu = require("./cpuHogger");

const createCpuHogCommand = (endpoint) => {
    const cpuHogTime = endpoint.cpu ? endpoint.cpu.value : null;
    if (cpuHogTime) {
        return (request, response) => new Promise((resolve) => {
            hogCpu(cpuHogTime);
            resolve();
        });
    }
    return () => Promise.resolve();
}

module.exports = createCpuHogCommand;