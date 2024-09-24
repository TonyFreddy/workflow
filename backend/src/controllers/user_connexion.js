const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const User = require('../models/user.js');

const register = async (req, res) => {
    const data = req.body;
    let nv_nom = data.nom.toUpperCase();
    let nv_prenom = data.prenom.toUpperCase();
    try {
      //Debut cryptage du mot de passe
        const password = await bcrypt.hash( req.body.mot_de_passe, 10);
        data.mot_de_passe = password; //Fin de cryptage 
        const user_data = {
        nom: nv_nom,
        prenom: nv_prenom,
        email: data.email,
        mot_de_passe: data.mot_de_passe,
        };
        const new_user = new User(user_data);
        await new_user.save();
        res.status(201).json({Message: "Utilisateur enregistré avec succès",new_user});
    } catch (err) {
      // Vérifie si l'erreur est liée à un duplicata d'e-mail(11000 est le code d'erreur MongoDB)
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        res.status(400).json({ message: "Cet e-mail existe déjà" });
      } else {
        res.status(400).json({ message: "Erreur lors de l'enregistrement de l'utilisateur" });
      }
    }
  };

  const connexion = async (req, res) => {
    try {
      const { email, mot_de_passe } = req.body;
      
      //Verifie si l'email existe dans la base de données
      const utilisateur = await User.findOne({ email }, { projection: { _id: 0} });
      if(!utilisateur) {
        return res.status(400).json({ message: "L'email est invalide" });
      }
      //Comparer le mot de passe entré avec le mot de passe crypté dans la base de données
      const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
      if(!motDePasseValide) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }
      //Si les informations sont valides
      console.log(utilisateur);
      const return_token = generateJwt(utilisateur);
      res.status(200).json({ message: "Connexion réussie", data:return_token, utilisateur});
    
    } catch (err) {
      res.status(400).json({ message: "Veuillez-vous inscrire" });
    }
  };

  const generateJwt= (identity) =>{
    try {
      const token = jwt.sign({ identity }, process.env.JWT_SECRET, { expiresIn: "12h" });
  
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 12);
  
      return {
        token,
        expiresIn: "12h",
        expirationTime
      };
    }
    catch (error) {
      console.log(error);
    }
  };

module.exports = { register, connexion, generateJwt };
