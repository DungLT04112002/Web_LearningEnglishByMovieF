const axios = require('axios');

/**
 * Cấu hình mặc định cho HTTP client
 * - Timeout: 30 giây
 * - Headers: JSON content type
 */
const httpClient = axios.create({
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Interceptor xử lý request
 * - Thêm token vào header nếu có
 */
httpClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor xử lý response
 * - Xử lý lỗi 401 (Unauthorized)
 * - Xử lý lỗi 403 (Forbidden)
 */
httpClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Xử lý khi token hết hạn
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Xử lý khi không có quyền truy cập
                    console.error('Access denied');
                    break;
            }
        }
        return Promise.reject(error);
    }
);

module.exports = httpClient; 