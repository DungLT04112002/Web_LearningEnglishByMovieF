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
            console.log("role", response.data.user.role);
            if (response.data.user.role === 'admin') {
                router.push('/Navigate/manager/movie'); // Điều hướng tới trang home
            } else {
                router.push('/Navigate/user/homepage'); // Điều hướng tới trang home
            }

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
  <div className="relative min-h-screen w-full overflow-hidden">
  {/* Ảnh nền */}
  <img
    src="/assets/HomePageImg.jpg"
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
  />

  {/* Overlay mờ đè lên ảnh */}
  <div className="absolute inset-0 bg-opacity-50 z-10"></div>

  {/* Login box nằm trên overlay */}
  <div className="relative z-20 flex items-center justify-center min-h-screen">
    <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập</h2>

      <GoogleOAuthProvider clientId={clientId}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </GoogleOAuthProvider>
    </div>
  </div>
</div>

    );
};

export default Login;
