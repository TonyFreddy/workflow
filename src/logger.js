class Logger {
    constructor() {
        this.logs = {};
    }

    log(id, message) {
        if (!this.logs[id]) {
            this.logs[id] = [];
        }
        this.logs[id].push(message);
       
    }

    getLogs(id) {
        return this.logs[id] || [];
    }
}

module.exports = new Logger();