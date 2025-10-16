const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Keep original name with timestamp prefix to avoid conflicts
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, '_'); // replace spaces
        cb(null, `${timestamp}-${safeName}`);
    }
});

const upload = multer({ storage });

module.exports = upload;
