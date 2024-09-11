const { Engine } = require('bpmn-engine');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

class WorkflowEngine {
    constructor() {
        this.source = this.loadBpmnFile('../workflows/workflow.bpmn');
    }

    loadBpmnFile(filePath) {
        try {
            const fileContent = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
            this.validateBpmn(fileContent);
            return fileContent;
        } catch (error) {
            console.error('Error loading BPMN file:', error.message);
            throw new Error('The BPMN file is invalid or not found.');
        }
    }
    
    validateBpmn(xml) {
        xml2js.parseString(xml, (err, result) => {
            if (err || !result['bpmn:definitions']) {
                throw new Error('The BPMN file is malformed.');
            }
        });
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
                    },
                    'activity.leave': (elementApi) => {
                        logCallback(`Leaving activity: ${elementApi.id}`);
                    },
                    'wait': (elementApi) => {
                        logCallback(`Waiting on activity: ${elementApi.id}`);
                    },
                    'error': (error, elementApi) => {
                        logCallback(`Error in activity ${elementApi.id}: ${error.message}`);
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
