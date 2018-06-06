const hogCpu = (timeoutInSeconds) => {
    const start = (new Date()).getTime();
    const finish = start + timeoutInSeconds * 1000;
    while((new Date).getTime() < finish) {
        const sqrt = Math.sqrt(14212384928510395429571);
    }
}

module.exports = hogCpu;