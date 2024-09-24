const mongoose = require('mongoose');

//Definition du shema mongoose pour les utilisateurs
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mot_de_passe: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);