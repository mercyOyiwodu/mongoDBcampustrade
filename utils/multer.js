const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, './uploads')
    },
    filename: (req, file, cb)=> {
        cb(null, file.originalname)
    }
});

const fileFilter = (req, file, cb)=> {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true)
    } else{
        cb(new Error('Invalid File format: Image or Video Only'))
    }
};

const limits = {
    fileSize: 1024 * 1024 * 7
};

const upload = multer({
    storage,
    fileFilter,
    limits
});

module.exports = upload