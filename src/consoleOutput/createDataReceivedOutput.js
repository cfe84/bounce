const createDataReceivedOutput = (endpoint) => {
    
    return (request, response) => {
        console.log(`Body: ${request.data}`);
        console.log(`\n\n------------------------------`);
    }
}

module.exports = createDataReceivedOutput;