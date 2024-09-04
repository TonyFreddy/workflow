const Workflow = require('./workflowModel');
const logger = require('../logger');
const workflowEngine = require('./workflowEngine');
const { sendEmail } = require('../mailler');

async function startWorkflow(id, payload, email) {
    payload.ticketCreated = false;
    payload.appointmentScheduled = false; 
    payload.emailSent = false;
    payload.email = email; 

    const engine = workflowEngine.createEngine(payload);
    const workflow = new Workflow({ _id: id, payload, logs: ['Workflow started.'] });
    await workflow.save();
    logger.log(id, `Workflow saved: ${JSON.stringify(workflow)}`);

    const logCallback = async (log) => {
        console.log('Log callback triggered:', log); 
        logger.log(id, log);
        workflow.logs.push(log); 
    
        console.log(`LOG BEFORE UPDATE: ${JSON.stringify(workflow.payload)}`); 
    
      
        if (log.includes('Ending activity: Activity_1prf23f')) {
            workflow.payload.ticketCreated = true; 
            console.log(`ticketCreated set to true`); 
        } else if (log.includes('Ending activity: Activity_1jh0wra')) {
            workflow.payload.appointmentScheduled = true;
            console.log(`appointmentScheduled set to true`);
        } else if (log.includes('Ending activity: Activity_1ra2c2y')) {
            workflow.payload.emailSent = true;
            console.log(`emailSent set to true`); 
        }
        
    
        try {
            await workflow.save(); 
        } catch (error) {
            logger.log(id, `Error saving workflow: ${error.message}`);
        }
    };

    await workflowEngine.executeWorkflow(engine, payload, logCallback);

    return {
        id,
        message: 'Workflow started',
        email: payload.email, 
        steps: {
            ticketCreated: payload.ticketCreated,
            appointmentScheduled: payload.appointmentScheduled,
            emailSent: payload.emailSent
        }
    };
}

module.exports = { startWorkflow };



