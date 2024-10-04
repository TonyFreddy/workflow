const { Engine } = require('bpmn-engine');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const nodemailer = require('nodemailer');
const sendEmail = require('../mailler.js')
const dotenv = require('dotenv');
dotenv.config();
const { EventEmitter } = require('events');
const { fileURLToPath } = require('url');
const { createRequire } = require('module');
const { events } = require('../models/user.js');
const camundaModdle = require('camunda-bpmn-moddle/resources/camunda');

async function createWorkflowSession(payload) {    
  const environment = {
    services: {
      getService: () => {
        return 'service task executed';
        if (!(defaultScope.content.id === 'serviceTask')) return;
        return (execution, callback) => {
          callback(null, execution.environment.task);
        };
      },
    },
  }
  // Chargement du fichier BPMN
  const bpmnXml = fs.readFileSync('/home/cyrh2/bpmn-workflow/backend/src/workflows/diagram.bpmn', 'utf8');

  // Création d'une instance du moteur
  const engine = new Engine({
    name: 'First engine',
    source: bpmnXml,
    moddleOptions: {
      camunda: camundaModdle,
    },
  });

  // Définition du listener en tant qu'instance d'EventEmitter
  const listener = new EventEmitter();

  // Écouter le début des activités

  listener.on('activity.start', (activity) => {
    console.log(`Début de l'activité: ${activity.name}`);
  });

  listener.once('wait', (activity, engineApi) => {
    activity.signal({
      sirname: 'von Rosen',
    });
  });

  listener.on('activity.end', (activity, engineApi) => {
    if (activity.content.output) {
      engineApi.environment.output[activity.name] = activity.content.output;
      engineApi.environment.task = activity.name;
    }
  });

  // Écouter la fin des activités
  listener.on('activity.end', (activity) => {
    console.log(`Fin de l'activité: ${activity.name}`);
  });

  engine.execute({
    listener,
    environment,
    // services: {
    //   getService(defaultScope) {
    //     if (!(defaultScope.content.id === 'serviceTask')) return;
    //     return (execution, callback) => {
    //       callback(null, execution.environment.task);
    //       console.log("miaou");
    //     };
    //   },
    // },
    // variables: {input: 1},

    // extensions: {
    //   saveToEnvironmentOutput(activity, { environment }) {
    //     activity.on('end', (activity) => {
    //       environment.output[activity.name] = activity.content.output;
    //     });
    //   },
    // },
  }, (err, execution) => {
    if (err) throw err;
    console.log(execution.name, execution.environment.output);
  });

  // engine.once('end', (execution) => {
  //   console.log(execution.name, execution.environment.output);
  // });

  // Exécution du moteur avec le listener
  // engine.execute({ listener }, (err, execution) => {
  //   if (err) throw err;
  //   console.log("End of the Process");
  //   console.log(`From the Activity '${execution.environment.task}', the user name entered is: ${execution.environment.output.Name.sirname}`);
  // });
}

// async function createWorkflowSession(payload) {

//         let source = '/home/cyrh2/workflow/src/workflows/workflow.bpmn';
//         const bpmnSource = 0;
//         try {
//             bpmnSource = fs.readFileSync(source, 'utf-8'); // Lit le fichier BPMN
//             xml2js.parseString(bpmnSource, (err, result) => {
//             if (err || !result['bpmn:definitions'])
//                 throw new Error('The BPMN file is malformed.');
//             });
//         } catch (error) {
//             console.error('Error loading BPMN file:', error.message);
//             //throw new Error('The BPMN file is invalid or not found.');
//         }
    
//         const engine =  new Engine ({
//             name: 'Workflow Engine',
//             source: bpmnSource,
//             variables: {
//                 ...payload,
//                 email: payload.email
//             }
//         });
    
//         const transporter = nodemailer.createTransport({
//             service: "Gmail",
//             host: "smtp.gmail.com",
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });
    
//         let services = {
//             sendEMail: (email, message) => {
//                 console.log(`Sending email to: ${email}`);
//                 const mailOptions = {
//                     from: process.env.EMAIL_USER,
//                     to,
//                     subject,
//                     html:text 
//                 };        
//                 try {
//                     /* await */ transporter.sendMail(mailOptions);
//                     return true;
//                 } catch (error) {
//                     console.error('Error sending email:', error);
//                     return false;
//                 }
//             }   
//         }
//         engine.on('end', (execution) => {
//             console.log('Workflow finished successfully');
//             console.log('Execution output:', execution);
//         });
        
//         engine.on('error', (err) => {
//             console.error('Workflow execution encountered an error:', err);
//         });
//         try {
//             // Démarrer l'exécution du workflow
//             let result = await engine.execute({
//             variables: engine.variables, // Variables fournies
//             services: services, // Services externes appelés par le workflow
//             });
        
//             console.log('Workflow executed successfully:', result);
//             return result;
            
//         } catch (error) {
//             console.error('Error during workflow execution:', error);
//             throw error;  // Relancer l'erreur si nécessaire
//         }
// }



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
