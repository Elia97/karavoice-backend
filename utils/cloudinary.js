const cloudinary = require("cloudinary").v2;

// Configura le credenziali Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Metti il tuo cloud_name
  api_key: process.env.API_KEY, // Metti la tua api_key
  api_secret: process.env.API_SECRET, // Metti la tua api_secret
});

module.exports = cloudinary;
