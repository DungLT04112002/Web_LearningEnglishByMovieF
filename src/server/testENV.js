const dotenv = require('dotenv');
const path = require('path');

// Xác định đường dẫn đến thư mục gốc của dự án (my-app)
const projectRoot = path.resolve(__dirname, '../../');

// Load file .env.local từ thư mục gốc
dotenv.config({ path: path.resolve(projectRoot, '.env.local') });

// In ra giá trị API Key để kiểm tra
console.log("API Key:", process.env.NEXT_PUBLIC_PORT);

