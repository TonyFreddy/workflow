const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    _id: String,
    payload: {
        problemDescription: String,
        solution: String,
        email: String,
        ticketCreated: Boolean,
        appointmentScheduled: Boolean,
        emailSent: Boolean
    },
    logs: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', workflowSchema);