const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");
const Workflow = require("./workflowModel");
const logger = require("../logger");
const workflowEngine = require("./workflowEngine");
const { sendEmail } = require("../mailler");

dotenv.config();

class WorkflowService {
 
  async createTicket(fullname, email, subject, issues) {
    try {
      const fullnameTest = fullname
      const emailTest = email
      const subjectTest = subject
      const issuesTest = issues
      const captcha = 'dtKj'
  
      const requestBody = {
        company: 'test',
        user: {
          fullnameTest,
          emailTest,
          company: 'test'
        },
        ticket: {
          subjectTest,
          issuesTest: issuesTest,
          company: 'test'
        },
        captcha
      }
  
      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
        Accept: '*/*',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'https://4022-154-66-135-180.ngrok-free.app',
        Referer: 'http://test.localhost:3000/newissue',
        Cookie:
          'connect.sid=s%3Aax5zWyBtbh5zF9wBL6dtZ-NX0I00lw43.UHAAW5pyZfK8UA3ocQUSla8AlJXl7ESxLJH8Az4TiYU; $trudesk%3Asidebar%3Aexpanded=true'
      }
  
      const apiUrl = 'https://4022-154-66-135-180.ngrok-free.app/api/v1/public/tickets/create'
  
      const response = await axios.post(apiUrl, requestBody, { headers })
  
      const ticketUid = response.data.ticket.uid
  
      temp.ticketUid = ticketUid
      temp.ticketUrl = response.data.ticket.url

  
      return { success: true, ticketUid: ticketUid, ticketUrl: response.data.ticket.url }
    } catch (error) {
      console.error('Error creating ticket:', error.response ? error.response.data : error.message)
      return { success: false, error: error.message }
    }
  }

  async scheduleAppointment(email, problemDescription) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
            scheduled: true,
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 
        };
    } catch (error) {
        throw new Error("Failed to schedule appointment");
    }
}

  async sendEmail(to, subject, text) {
    try {
      const result = await sendEmail(to, subject, text);
      if (result) {
        return true;
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      throw new Error("Failed to send email");
    }
  }

  async processWorkflowStep(step, variables) {
    switch (step) {
      case "createTicket":
        variables.ticketCreated = await this.createTicket(
          variables.problemDescription
        );
        break;
      case "scheduleAppointment":
        variables.appointmentScheduled = await this.scheduleAppointment(
          variables.email,
          variables.problemDescription
        );
        break;
      case "sendEmail":
        const emailSubject = "Follow-up on your issue";
        const emailText = `Dear customer,\n\nWe have received your report regarding: ${variables.problemDescription}.\n\nWe are working on a solution and will keep you informed.\n\nBest regards,\nSupport team`;
        variables.emailSent = await this.sendEmail(
          variables.email,
          emailSubject,
          emailText
        );
        break;
      default:
        console.log("Unknown step:", step);
    }
    return variables;
  }

  async startWorkflow(id, payload, email) {
    payload.ticketCreated = false;
    payload.appointmentScheduled = false;
    payload.emailSent = false;
    payload.email = email;
    payload.status = "STARTED";
  
    const workflow = new Workflow({
      _id: id,
      payload,
      logs: ["Workflow started."],
      status: "STARTED",
    });
  
    try {
      await workflow.save();
    } catch (error) {
      throw error;
    }
  
    const logAndUpdateStatus = async (status, log) => {
      logger.log(id, log);
      workflow.logs.push(log);
      workflow.status = status;
      try {
        await workflow.save();
      } catch (error) {
        logger.log(id, `Error saving workflow: ${error.message}`);
      }
    };
  
    try {
      await logAndUpdateStatus("CREATING_TICKET", "Starting to create ticket");
      const ticketResult = await this.createTicket("Tony", "tony@example.com", "test", "test");
      workflow.payload.ticketCreated = true;
      await logAndUpdateStatus("TICKET_CREATED", "Ticket created successfully");
  

      await logAndUpdateStatus("SCHEDULING_APPOINTMENT", "Starting to schedule appointment");
      const appointmentResult = await this.scheduleAppointment(email, payload.problemDescription);
      workflow.payload.appointmentScheduled = true;
      await logAndUpdateStatus("APPOINTMENT_SCHEDULED", "Appointment scheduled successfully");
  

      await logAndUpdateStatus("SENDING_EMAIL", "Starting to send email");
      const emailSubject = "Follow-up on your issue";
      const emailText = `Dear customer,\n\nWe have received your report regarding: ${payload.problemDescription}.\n\nWe are working on a solution and will keep you informed.\n\nBest regards,\nSupport team`;
      await this.sendEmail(email, emailSubject, emailText);
      workflow.payload.emailSent = true;
      await logAndUpdateStatus("EMAIL_SENT", "Email sent successfully");
  
      workflow.status = "COMPLETED";
      await workflow.save();
    } catch (error) {
      workflow.logs.push(`Error: ${error.message}`);
      workflow.status = "ERROR";
      await workflow.save();
      throw error;
    }
  
    const updatedWorkflow = await Workflow.findById(id);
  
    return {
      id,
      message: "Workflow completed",
      email: updatedWorkflow.payload.email,
      status: updatedWorkflow.status,
      steps: {
        ticketCreated: updatedWorkflow.payload.ticketCreated,
        appointmentScheduled: updatedWorkflow.payload.appointmentScheduled,
        emailSent: updatedWorkflow.payload.emailSent,
      },
    };
  }
}

module.exports = new WorkflowService();