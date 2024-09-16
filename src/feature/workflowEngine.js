const { Engine } = require('bpmn-engine');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const sendEmail = require('../mailler.js')

// Mock WorkflowEngine class for a Node.js environment
// class WorkflowEngine {
//     constructor() {
//         this.source = this.loadBpmnFile('../workflows/RC_XP_Workflow.bpmn');
//     }
//     loadBpmnFile(filePath) {
//         try {
//             const fileContent = fs.readFileSync('../workflows/RC_XP_Workflow.bpmn', 'utf8');
//             this.validateBpmn(fileContent);
//             return fileContent;
//         } catch (error) {
//             console.error('Error loading BPMN file:', error.message);
//         }
//     }    
//     validateBpmn(xml) {
//         xml2js.parseString(xml, (err, result) => {
//         if (err || !result['bpmn:definitions']) {
//             throw new Error('The BPMN file is malformed.');
//         }
//     });
//     }
    // Method to start the workflow session
    // startSession() {
    //     console.log('Starting workflow session:');
    //     this.sessionActive = true;
    //     this.nextTask();  // Begin workflow with the first task
    // }

    // // Simulate moving to the next task in the workflow
    // nextTask(taskId) {
    //     if (!this.sessionActive) {
    //         console.log("Workflow session is not active.");
    //         return;
    //     }

    //     const task = taskId;
    //     if (task) {
    //         this.currentTask = `Task ID ${task}`;
    //         console.log(`Current Task: ${this.currentTask}`);
    //         this.completeTask();
    //     } else {
    //         console.log("No task to proceed with.");
    //     }
    // }

    // // Simulate completing the current task and moving to the next
    // completeTask() {
    //     console.log(`Completing task: ${this.currentTask}`);
    //     // In a real workflow, there could be logic here to move to the next task or workflow step
    //     console.log("Workflow session completed.");
    //     this.sessionActive = false;
    // }
//}

async function createWorkflowSession(payload) {

    const source = '../workflows/workflow.bpmn';
    const bpmnSource = 0;
    try {
        bpmnSource = fs.readFileSync(source, 'utf-8'); // Lit le fichier BPMN
        xml2js.parseString(bpmnSource, (err, result) => {
        if (err || !result['bpmn:definitions'])
            throw new Error('The BPMN file is malformed.');
        });
    } catch (error) {
        console.error('Error loading BPMN file:', error.message);
        //throw new Error('The BPMN file is invalid or not found.');
    }

    const engine =  new Engine ({
        name: 'Workflow Engine',
        source: bpmnSource,
        variables: {
            ...payload,
            email: payload.email
        }
    });

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const services = {
        sendEMail: (email, message) => {
            console.log(`Sending email to: ${email}`);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html:text 
            };        
            try {
                /* await */ transporter.sendMail(mailOptions);
                return true;
            } catch (error) {
                console.error('Error sending email:', error);
                return false;
            }
        }   
    }
async function createWorkflowSession(payload) {

        const source = '../workflows/workflow.bpmn';
        const bpmnSource = 0;
        try {
            bpmnSource = fs.readFileSync(source, 'utf-8'); // Lit le fichier BPMN
            xml2js.parseString(bpmnSource, (err, result) => {
            if (err || !result['bpmn:definitions'])
                throw new Error('The BPMN file is malformed.');
            });
        } catch (error) {
            console.error('Error loading BPMN file:', error.message);
            //throw new Error('The BPMN file is invalid or not found.');
        }
    
        const engine =  new Engine ({
            name: 'Workflow Engine',
            source: bpmnSource,
            variables: {
                ...payload,
                email: payload.email
            }
        });
    
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    
        const services = {
            sendEMail: (email, message) => {
                console.log(`Sending email to: ${email}`);
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to,
                    subject,
                    html:text 
                };        
                try {
                    /* await */ transporter.sendMail(mailOptions);
                    return true;
                } catch (error) {
                    console.error('Error sending email:', error);
                    return false;
                }
            }   
        }
        engine.on('end', (execution) => {
            console.log('Workflow finished successfully');
            console.log('Execution output:', execution);
        });
        
        engine.on('error', (err) => {
            console.error('Workflow execution encountered an error:', err);
        });
        try {
            // Démarrer l'exécution du workflow
            const result = await engine.execute({
            variables: engine.variables, // Variables fournies
            services: services, // Services externes appelés par le workflow
            });
        
            console.log('Workflow executed successfully:', result);
            return result;
        } catch (error) {
            console.error('Error during workflow execution:', error);
            throw error;  // Relancer l'erreur si nécessaire
        }
    }
    

    engine.on('end', (execution) => {
        console.log('Workflow finished successfully');
        console.log('Execution output:', execution);
    });
    
    engine.on('error', (err) => {
        console.error('Workflow execution encountered an error:', err);
    });
    try {
        // Démarrer l'exécution du workflow
        const result = await engine.execute({
        variables: engine.variables, // Variables fournies
        services: services, // Services externes appelés par le workflow
        });
    
        console.log('Workflow executed successfully:', result);
        return result;
    } catch (error) {
        console.error('Error during workflow execution:', error);
        throw error;  // Relancer l'erreur si nécessaire
    }
}

// Gestion des événements de progression du workflow


// Create a method to initialize the workflow engine

// Example payload for the workflow
// const workflowPayload = {
//     email: 'user@example.com',
//     taskId: 101
// };

// // Creating and starting a workflow session
// const engine = createEngine(workflowPayload);
// engine.startSession();

// class engine {

//     executeWorkflow(engine, payload, logCallback) {
//         return new Promise((resolve, reject) => {
//             engine.execute({
//                 variables: payload,
//                 listeners: {
//                     'activity.enter': (elementApi) => {
//                         logCallback(`Entering activity: ${elementApi.id}`);
//                     },
//                     'activity.start': (elementApi) => {
//                         logCallback(`Starting activity: ${elementApi.id}`);
//                     },
//                     'activity.end': (elementApi) => {
//                         logCallback(`Ending activity: ${elementApi.id}`);
//                     },
//                     'activity.leave': (elementApi) => {
//                         logCallback(`Leaving activity: ${elementApi.id}`);
//                     },
//                     'wait': (elementApi) => {
//                         logCallback(`Waiting on activity: ${elementApi.id}`);
//                     },
//                     'error': (error, elementApi) => {
//                         logCallback(`Error in activity ${elementApi.id}: ${error.message}`);
//                         reject(error);
//                     },
//                     'end': () => {
//                         logCallback('Workflow completed');
//                         resolve();
//                     }
//                 }                
//             });
//         });
//     }
// }

module.exports = {createWorkflowSession};
