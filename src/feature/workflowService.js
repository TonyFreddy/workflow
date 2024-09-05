const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const axios = require('axios'); 
const Workflow = require('./workflowModel');
const logger = require('../logger');
const workflowEngine = require('./workflowEngine');

dotenv.config();

class WorkflowService {
    constructor() { 
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async createTicket(problemDescription) {
        console.log('Début de createTicket:', problemDescription);
        try {
            const response = await axios.post(process.env.TICKET_API_URL, {
                description: problemDescription
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.TICKET_API_KEY}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            console.log('Fin de createTicket avec erreur');
            throw new Error('Failed to create ticket');
        }
    }

    async scheduleAppointment(email, problemDescription) {
        console.log('Début de scheduleAppointment:', email, problemDescription);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { scheduled: true, date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) };
        } catch (error) {
            console.error('Erreur lors de la planification du rendez-vous:', error);
            console.log('Fin de scheduleAppointment avec erreur');
            throw new Error('Failed to schedule appointment');
        }
    }

    async sendEmail(to, subject, text) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: subject,
                html: text
            });
            return info;
        } catch (error) {
            throw new Error('Failed to send email');
        }
    }  

    async processWorkflowStep(step, variables) {
        switch (step) {
            case 'createTicket':
                variables.ticketCreated = await this.createTicket(variables.problemDescription);
                break;
            case 'scheduleAppointment':
                variables.appointmentScheduled = await this.scheduleAppointment(variables.email, variables.problemDescription);
                break;
            case 'sendEmail':
                const emailSubject = 'Follow-up on your issue';
                const emailText = `Dear customer,\n\nWe have received your report regarding: ${variables.problemDescription}.\n\nWe are working on a solution and will keep you informed.\n\nBest regards,\nSupport team`;
                variables.emailSent = await this.sendEmail(variables.email, emailSubject, emailText);
                break;
            default:
                console.log('Unknown step:', step);
        }
        return variables;
    }

    async startWorkflow(id, payload, email) {
        payload.ticketCreated = false;
        payload.appointmentScheduled = false; 
        payload.emailSent = false;
        payload.email = email; 

        const engine = workflowEngine.createEngine(payload);
        const workflow = new Workflow({ _id: id, payload, logs: ['Workflow started.'] });

        try {
            await workflow.save();
        } catch (error) {
            throw error;
        }

        const logCallback = async (log) => {
            logger.log(id, log);
            workflow.logs.push(log);

            if (log.includes('Ending activity: Activity_1prf23f')) {
                workflow.payload.ticketCreated = true;
            } else if (log.includes('Ending activity: Activity_1jh0wra')) {
                workflow.payload.appointmentScheduled = true;
            } else if (log.includes('Ending activity: Activity_1ra2c2y')) {
                workflow.payload.emailSent = true;
            }
            
            try {
                await workflow.save();
            } catch (error) {
                logger.log(id, `Error saving workflow: ${error.message}`);
            }
        };

        try {
            await Promise.race([
                workflowEngine.executeWorkflow(engine, payload, logCallback),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Workflow execution timeout')), 300000)) // 5 minutes timeout
            ]);
        } catch (error) {
            workflow.logs.push(`Error: ${error.message}`);
            await workflow.save();
            throw error;
        }

        const updatedWorkflow = await Workflow.findById(id);

        return {
            id,
            message: 'Workflow completed',
            email: updatedWorkflow.payload.email,
            steps: {
                ticketCreated: updatedWorkflow.payload.ticketCreated,
                appointmentScheduled: updatedWorkflow.payload.appointmentScheduled,
                emailSent: updatedWorkflow.payload.emailSent
            }
        };
    }
}

module.exports = new WorkflowService();
