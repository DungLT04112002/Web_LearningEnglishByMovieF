"use client"
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import axios from 'axios';
import { useRouter } from 'next/navigation';

const Login = () => {
    const clientId = "134627762597-cig5pd6j5po4m3msuq4qi2p29pp9evbk.apps.googleusercontent.com";
    const router = useRouter();
    console.log("Client ID:", clientId);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Gọi API để xác thực token với backend
            const response = await axios.post('http://localhost:8081/api/auth/google', {
                credential: credentialResponse.credential
            });
            console.log("tok", response.data.accessToken);
            // Lưu token vào localStorage
            localStorage.setItem('accessToken', response.data.accessToken);

            router.push('/'); // Điều hướng tới trang home

            // Chuyển hướng sau khi đăng nhập thành công
        } catch (error) {
            console.error('Login failed:', error);
            alert('Đăng nhập thất bại. Vui lòng thử lại!');
        }
    };

    const handleGoogleError = () => {
        console.error('Google Login Failed');
        alert('Đăng nhập Google thất bại. Vui lòng thử lại!');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Đăng nhập</h2>
                <GoogleOAuthProvider clientId={clientId}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                    />
                </GoogleOAuthProvider>
            </div>
        </div>
    );
};

export default Login;
