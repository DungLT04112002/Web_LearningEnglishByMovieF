"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Login from '../../Login/LoginPage';
import axiosInstance from '@/src/utils/axios';

const ManagerAccount = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    birthdate: '',
    gender: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để vào trang cá nhân.');
        router.push('/');
        return;
      }

      const response = await axios.get('http://localhost:8081/api/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setUserInfo({
          name: response.data.name || '',
          email: response.data.email || '',
          birthdate: response.data.birthdate || '',
          gender: response.data.gender || '',
          avatar_url: response.data.avatar_url || ''
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const LogOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/Navigate/user/homepage');
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.put('http://localhost:8081/api/account',
        {
          name: userInfo.name,
          birthdate: userInfo.birthdate,
          gender: userInfo.gender
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      fetchUserInfo();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axiosInstance.put('http://localhost:8081/api/account/avatar', formData);

      if (response.data && response.data.avatar_url) {
        setUserInfo(prev => ({
          ...prev,
          avatar_url: `http://localhost:8081${response.data.avatar_url}`
        }));
        setSuccess('Avatar updated successfully');
      }
      fetchUserInfo();

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to update avatar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-900 shadow-lg rounded-xl p-8 border border-slate-800">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Account Settings</h2>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-800/20 border border-red-700 text-red-300 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-emerald-800/20 border border-emerald-700 text-emerald-300 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div>
                <img
                  src={userInfo.avatar_url || '/assets/default-avatar.png'}
                  alt="Avatar"
                  className="h-16 w-16 object-cover rounded-full border-2 border-slate-700"
                />
              </div>
              <label className="block w-full">
                <span className="block text-sm text-slate-300 mb-1">Profile Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0 file:font-semibold
                file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleInputChange}
                className="w-full rounded-md bg-slate-800 text-white border border-slate-700 shadow-sm focus:ring focus:ring-indigo-500/50"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={userInfo.email}
                disabled
                className="w-full rounded-md bg-slate-800 text-slate-400 border border-slate-700"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Birthdate</label>
              <input
                type="date"
                name="birthdate"
                value={userInfo.birthdate}
                onChange={handleInputChange}
                className="w-full rounded-md bg-slate-800 text-white border border-slate-700 focus:ring focus:ring-indigo-500/50"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={userInfo.gender}
                onChange={handleInputChange}
                className="w-full rounded-md bg-slate-800 text-white border border-slate-700 focus:ring focus:ring-indigo-500/50"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>

          </form>
          <div>
            <button
              onClick={LogOut}
              className="w-full py-2 px-4 rounded-md bg-orange-400 text-white font-semibold shadow hover:bg-orange-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAccount;
