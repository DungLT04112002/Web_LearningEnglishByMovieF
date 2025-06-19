const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../Middlerware/Auth');

// --- Bắt đầu Cấu hình Multer (Chuyển từ Controller nếu cần) ---
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

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/x-subrip' || file.originalname.toLowerCase().endsWith('.srt')) {
        cb(null, true);
    } else {
        cb(new Error('Only .srt files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Giới hạn 5MB
});
// --- Kết thúc Cấu hình Multer ---


// Import Controllers
const movieController = require('../Controller/VideoController/ViedeoController');
const subController = require('../Controller/SubComtroller/SubController');
const quizzController = require('../Controller/QuizzController/QuizzController');
const questionController = require('../Controller/QuestionController/QuestionController');
const optionController = require('../Controller/OptionController/OptionController');
const authController = require('../Controller/AuthController/AuthController');
const accountController = require('../Controller/AccountController/AccountController');

// Middleware xử lý JSON (giữ nguyên)
// Express v4.16.0 trở lên có sẵn express.json() và express.urlencoded(), không cần body-parser riêng
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Example of protected routes with role-based access
router.post('/api/movies', authenticateToken(['admin']), movieController.createMovie);
router.get('/api/movies', movieController.getMovies);
router.get('/api/movies/:id', movieController.getMovieById);
router.put('/api/movies/:id', authenticateToken(['admin']), movieController.updateMovie);
router.delete('/api/movies/:id', authenticateToken(['admin']), movieController.deleteMovie);


// --- Subtitle routes ---
// Routes that allow both admin and employee access
router.post('/api/subtitles', authenticateToken(['admin', 'employee']), upload.single('subtitleFile'), subController.addSubtitle);
// Lấy tất cả subtitles (Không cần Multer)
router.get('/api/subtitles', subController.getAllSubtitles);
// Lấy subtitles của một phim (Không cần Multer)
router.get('/api/movies/:movie_id/subtitles', subController.getMovieSubtitles);
// Lấy subtitle theo ngôn ngữ (Không cần Multer)
router.get('/api/movies/:movie_id/subtitles/:language', subController.getSubtitleByLanguage);
// Áp dụng middleware multer cho route cập nhật subtitle
router.put('/api/subtitles/:id', authenticateToken(['admin', 'employee']), upload.single('subtitleFile'), subController.updateSubtitle);
// Xóa subtitle (Không cần Multer)
router.delete('/api/subtitles/:id', subController.deleteSubtitle);

// Quiz routes
router.post('/api/quizzes', quizzController.addQuiz);
router.get('/api/quizzes', quizzController.getAllQuizzes);
router.get('/api/quizzes/:id', quizzController.getQuizById);
router.put('/api/quizzes/:id', quizzController.updateQuiz);
router.delete('/api/quizzes/:id', quizzController.deleteQuiz);
router.get('/api/quizzes/movie/:movie_id', quizzController.getQuizzesByMovie);

// Question routes
router.post('/api/questions', questionController.addQuestion);
router.get('/api/questions', questionController.getAllQuestions);
router.get('/api/questions/:id', questionController.getQuestionById);
router.put('/api/questions/:id', questionController.updateQuestion);
router.delete('/api/questions/:id', questionController.deleteQuestion);
router.get('/api/questions/quiz/:quiz_id', questionController.getQuestionsByQuiz);

// Option routes
router.post('/api/options', optionController.addOption);
router.get('/api/options', optionController.getAllOptions);
router.get('/api/options/:id', optionController.getOptionById);
router.put('/api/options/:id', optionController.updateOption);
router.delete('/api/options/:id', optionController.deleteOption);
router.get('/api/options/question/:question_id', optionController.getOptionsByQuestion);

//GoogleAuth
router.post('/api/auth/google', authController.LoginGoogle);

// Account routes
router.get('/api/account', authenticateToken(['user', 'admin']), accountController.getAccountInfo);
router.put('/api/account', authenticateToken(['user', 'admin']), accountController.updateAccountInfo);
router.put('/api/account/avatar', authenticateToken(['user', 'admin']), accountController.updateAvatar);

// Admin routes for user management
// router.get('/api/admin/users', accountController.getAllUsers);
// router.post('/api/admin/users', accountController.createUser);
// router.put('/api/admin/users/:userId/role', accountController.updateUserRole);
router.get('/api/admin/users', accountController.getAllUsers);
router.post('/api/admin/users', authenticateToken(['admin']), accountController.createUser);
router.put('/api/admin/users/:userId/role', authenticateToken(['admin']), accountController.updateUserRole);

module.exports = router; 