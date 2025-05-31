const { createAd, deleteAd} = require('../controller/ADcontroller')
const { authenticateAdmin } = require('../middlewares/adminAuth');
const adRouter = require('express').Router();
const upload = require('../utils/multer');


adRouter.post('/createAd', upload.single('image'), authenticateAdmin, createAd);

adRouter.delete('/deleteAd/:id',authenticateAdmin, deleteAd);

module.exports = adRouter