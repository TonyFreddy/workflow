
const {Workflow} = require('../models/workflowModel.js');
const User = require('../models/user.js');
const mongoose = require('mongoose');

const create_workflow = async (req, res) => {
    const data = req.body;
    const idUser = req.user.identity._id;
    console.log(idUser);
    const utilisateur = await User.findOne({ _id: new mongoose.Types.ObjectId(idUser) }, { _id: false });
    //try {
        const workflow_data = {
        id_user: idUser,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        event_start: data.event_start,
        actions: { task1: data.actions.task1 },
        status: "pending"
        };
        if ('task2' in data.actions) 
            Object.assign(workflow_data.actions, { task2: data.actions.task2 });
        if ('task3' in data.actions) 
            Object.assign(workflow_data.actions, { task3: data.actions.task3 });
        if ('task4' in data.actions) 
            Object.assign(workflow_data.actions, { task4: data.actions.task4 });
        if ('task5' in data.actions) 
            Object.assign(workflow_data.actions, { task5: data.actions.task5 });
        
        const new_workflow = new Workflow(workflow_data);
        await new_workflow.save();
        res.status(201).json({Message: "Le Workflow a été créer", new_workflow});
    // } catch (err) {
    //     res.status(400).json({ message: "Erreur lors de la création du workflow" });
    // }


// Fonction pour changer le statut d'un workflow
const updateWorkflowStatus = async (workflowId, newStatus) => {
    try {
        const workflow = await Workflow.findById(workflowId);
        if (!workflow) throw new Error('Workflow non trouvé');
        
        workflow.status = newStatus; // Mettre à jour le statut
        await workflow.save();
        
        return { success: true, message: `Le statut du workflow a été mis à jour en '${newStatus}'` };
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du workflow:', error.message);
        return { success: false, error: error.message };
    }
};

// Fonctions pour fermer ou annuler le workflow
const closeWorkflow = async (workflowId) => {
    return await updateWorkflowStatus(workflowId, 'closed');
};

const cancelWorkflow = async (workflowId) => {
    return await updateWorkflowStatus(workflowId, 'canceled');
};

module.exports = { create_workflow, closeWorkflow, cancelWorkflow };
};

module.exports = { create_workflow };