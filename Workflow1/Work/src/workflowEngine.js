const { Engine } = require('bpmn-engine');
const fs = require('fs');
const EventEmitter = require('events');

// Chargement du fichier BPMN
const bpmnXml = fs.readFileSync('./src/workflow.bpmn', 'utf8');

// Création d'une instance du moteur
const engine = new Engine({
  source: bpmnXml
});

// Définition du listener en tant qu'instance d'EventEmitter
const listener = new EventEmitter();

// Écouter le début des activités
listener.on('activity.start', (activity) => {
  console.log(`Début de l'activité: ${activity.id}`);
});

// Écouter la fin des activités
listener.on('activity.end', (activity) => {
  console.log(`Fin de l'activité: ${activity.id}`);
});

// Exécution du moteur avec le listener
engine.execute({ listener }, (err, execution) => {
  if (err) throw err;   

  console.log('Workflow démarré !');

  // Attendre la fin du workflow
  execution.waitFor('end', () => {
    console.log('Workflow terminé !');
  });
});