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
        return new Promise((resolve, reject) => {
            engine.execute({
                variables: payload,
                listeners: {
                    'activity.enter': (elementApi) => {
                        logCallback(`Entering activity: ${elementApi.id}`);
                    },
                    'activity.start': (elementApi) => {
                        logCallback(`Starting activity: ${elementApi.id}`);
                    },
                    'activity.end': (elementApi) => {
                        logCallback(`Ending activity: ${elementApi.id}`);
                        console.log('Activity finished successfully:', elementApi.id);
                    },
                    'activity.leave': (elementApi) => {
                        logCallback(`Leaving activity: ${elementApi.id}`);
                    },
                    'wait': (elementApi) => {
                        logCallback(`Waiting on activity: ${elementApi.id}`);
                    },
                    'error': (error, elementApi) => {
                        logCallback(`Error in activity ${elementApi.id}: ${error.message}`);
                        console.error('Error during workflow execution:', error);
                        reject(error);
                    },
                    'end': () => {
                        logCallback('Workflow completed');
                        resolve();
                    }
                }                
            });
        });
    }
}

module.exports = new WorkflowEngine();
