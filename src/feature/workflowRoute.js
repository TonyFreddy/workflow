const express = require('express');
const router = express.Router();
const WorkflowService = require('./workflowService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

router.post('/workflow', async (req, res) => {
    try {
        const { problemDescription, email } = req.body;
        
        if (!problemDescription || !email) {
            return res.status(400).json({ error: 'Problem description and email are required.' });
        }

        const workflowId = uuidv4();
        logger.log(workflowId, 'Workflow started');

        const result = await WorkflowService.startWorkflow(workflowId, { problemDescription }, email);

        logger.log(workflowId, 'Workflow completed');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while starting the workflow.' });
    }
});
/*
router.get('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const workflow = await WorkflowService.getWorkflowStatus(id);
        
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found.' });
        }

        res.status(200).json({
            id: workflow._id,
            status: workflow.status,
            steps: {
                ticketCreated: workflow.payload.ticketCreated,
                appointmentScheduled: workflow.payload.appointmentScheduled,
                emailSent: workflow.payload.emailSent
            },
            logs: workflow.logs
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the workflow status.' });
    }
});*/

module.exports = router;
