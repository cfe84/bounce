const hogCpu = (timeoutInMilliseconds) => {
    const start = (new Date()).getTime();
    const finish = start + timeoutInMilliseconds;
    while((new Date).getTime() < finish) {
        const sqrt = Math.sqrt(14212384928510395429571);
    }
}

module.exports = hogCpu;