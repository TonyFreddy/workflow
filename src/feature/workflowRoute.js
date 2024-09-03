const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const { validateWorkflow } = require('../validator/joi'); 
const { startWorkflow } = require('./workflowService');

const router = express.Router();

router.post('/workflow', async (req, res) => {
    const id = uuidv4();
    const { payload, email } = req.body;

    const { error } = validateWorkflow({ payload, email });
    if (error) {
        return res.status(400).json({ message: error.details.map(err => err.message) });
    }

    try {
        const response = await startWorkflow(id, payload, email);
        res.json(response);
    } catch (err) {
        logger.log(id, `Error: ${err.message}`);
        res.status(500).json({ message: 'Error creating the workflow', error: err.message });
    }
});

module.exports = router;