// const axios = require('axios');
const express = require('express')
const dotenv = require('dotenv');
const webrRoutes = require('../router/Router')
const cors = require('cors');
const path = require('path');
// Xác định đường dẫn đến thư mục gốc của dự án (my-app)
const projectRoot = path.resolve(__dirname, '../../');
// Load file .env.local từ thư mục gốc
dotenv.config({ path: path.resolve(projectRoot, '.env.local') });

const app = express()

// >>>>>>> DÒNG NÀY RẤT QUAN TRỌNG <<<<<<<<
// Phục vụ các file tĩnh (như ảnh) từ thư mục 'public'
app.use(express.static(path.join(projectRoot, 'public')));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());
app.use(webrRoutes);


const port = process.env.NEXT_PUBLIC_PORT;

//configViewEngine(app);// cấu hình ở config/configEngine

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})