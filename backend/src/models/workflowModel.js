const mongoose = require('mongoose');

const EVENEMENT = ['Survey answered', 'NPS answered',
    'CES answered', 'CSAT answered', 'Appointmet booked', 'Appointment started',
    'Appointment canceled', 'Appointment attended', 'New Ticket',
    'Ticket pending', 'Ticket closed', 'Ticket canceled', 'Customer joined', 
    'Customer called', 'Customer on hold', 'Customer marked noshow',
    'Customer Transferred', 'Customer served', 'SmartQueue opened', 'SmartQueue closed', 'Attending customer'];

// const workflowSchema = new mongoose.Schema({
//     _id: String,
//     payload: {
//         problemDescription: String,
//         solution: String,
//         email: String,
//         ticketCreated: Boolean,
//         appointmentScheduled: Boolean,
//         emailSent: Boolean
//     },
//     logs: [String],
//     status: String,
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// });

const workflowSchema = new mongoose.Schema ({
    id_user: {type: String, required: false },
    nom : {type: String, required:  false},
    prenom: {type: String, required: false },
    event_start: {type: String, enum: EVENEMENT, required: true},
    actions: {
        task1: {type: String, required: true},
        task2: {type: String, required: false},
        task3: {type: String, required: false},
        task4: {type: String, required: false},
        task5: {type: String, required: false},
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = {EVENEMENT, Workflow};