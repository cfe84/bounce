const hogCpu = ({timeoutInMilliseconds, timeoutInCycles}) => {
    
    let isFinished;
    if (timeoutInMilliseconds) {
        const start = (new Date()).getTime();
        const finish = start + timeoutInMilliseconds;
        isFinished = () => (new Date).getTime() > finish; 
    } else {
        let count = 0;
        isFinished = () => ++ count > timeoutInCycles;
    }
    while(!isFinished()) {
        const sqrt = Math.sqrt(14212384928510395429571);
    }
}

module.exports = hogCpu;