const { Engine } = require('bpmn-engine'); 
const fs = require('fs');
const path = require('path');

class WorkflowEngine {
    constructor() {
        this.source = fs.readFileSync(path.join(__dirname, '../workflows/workflow.bpmn'), 'utf8');
    }

    createEngine(payload) {
        return new Engine({
            name: 'Workflow Engine',
            source: this.source,
            variables: {
                ...payload,
                email: payload.email
            }
        });
    }

    executeWorkflow(engine, payload, logCallback) {
        return engine.execute({
            variables: payload,
            listeners: {
                'activity.start': (activity) => {
                    logCallback(`Starting activity: ${activity.id}`);
                },
                'activity.end': (activity) => {
                    logCallback(`Ending activity: ${activity.id}`);
                },
                'end': (execution) => {
                    logCallback('Workflow execution finished.');
                },
                'start': () => {
                    logCallback('Workflow started.');
                },
                'gateway.pass': (gateway) => {
                    logCallback(`Passing gateway: ${gateway.id}`);
                }
            }
        });
    }
}

module.exports = new WorkflowEngine();