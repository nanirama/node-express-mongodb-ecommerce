const Multer = require('multer');
const path = require('path');

const storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Save files to 'uploads' directory
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const name = path.basename(file.originalname, extension).replace(/ /g, '_'); // Replace spaces with underscores
        cb(null, Date.now() + '_' + name + extension); // Unique filename with timestamp
    }
});

const upload = Multer({ storage });

module.exports = upload;