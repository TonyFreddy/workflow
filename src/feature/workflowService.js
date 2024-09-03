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
        logger.log(id, log);
        workflow.logs.push(log); 

        // Mettre à jour les étapes en fonction des logs
        if (log.includes('Ending activity: Activity_1prf23f')) {
            payload.ticketCreated = true; 
        } else if (log.includes('Ending activity: Activity_1jh0wra')) {
            payload.appointmentScheduled = true; 
        } else if (log.includes('Ending activity: Activity_1ra2c2y')) {
            payload.emailSent = true;
        }

        try {
            await workflow.save(); // Save after each log entry
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