const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Sử dụng path.join để đảm bảo đường dẫn đúng trên các hệ điều hành
        const uploadDir = path.join(__dirname, '../../public/uploads/subtitles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `subtitle-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Cấu hình filter cho file
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/x-subrip' || file.originalname.toLowerCase().endsWith('.srt')) {
        cb(null, true);
    } else {
        cb(new Error('Only .srt files are allowed!'), false);
    }
};

// Tạo middleware upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn 5MB
});

module.exports = {
    upload,
    storage,
    fileFilter
}; 