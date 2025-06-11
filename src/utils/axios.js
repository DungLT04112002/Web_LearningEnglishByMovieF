import axios from 'axios';

const BASE_API_URL = 'http://localhost:8081/api';

const axiosInstance = axios.create({
    baseURL: BASE_API_URL,
});

// Chỉ thêm token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 