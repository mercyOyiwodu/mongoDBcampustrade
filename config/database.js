const mongoose = require('mongoose'); // <-- fixed spelling
require('dotenv').config();

const db = process.env.MONGO_URL;

mongoose.connect(db)
  .then(() => {
    console.log('Connection to the database has been established successfully');
  })
  .catch((error) => {
    console.log('Error connecting to database: ' + error);
  });
