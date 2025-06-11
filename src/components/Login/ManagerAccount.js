"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
            console.log("account", localStorage.getItem('accessToken'))
            const response = await axios.get('http://localhost:8081/api/account', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setUserInfo(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch user information');
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
            // Upload avatar to your server or cloud storage
            // For this example, we'll just use a placeholder URL
            const avatarUrl = 'https://example.com/avatar.jpg';

            await axios.put('http://localhost:8081/api/account/avatar',
                { avatar_url: avatarUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );

            setUserInfo(prev => ({
                ...prev,
                avatar_url: avatarUrl
            }));
            setSuccess('Avatar updated successfully');
        } catch (err) {
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
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className=" mx-auto">
                <div className="bg-gray-900 shadow-lg rounded-lg p-6 border border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-md">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-900/50 border border-green-800 rounded-md">
                            <p className="text-green-400">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-6">
                            <div className="shrink-0">
                                <img
                                    className="h-16 w-16 object-cover rounded-full border-2 border-gray-700"
                                    src={userInfo.avatar_url}
                                    alt="Profile"
                                />
                            </div>
                            <label className="block">
                                <span className="sr-only">Choose profile photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="block w-full text-sm text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-gray-800 file:text-gray-300
                                        hover:file:bg-gray-700"
                                />
                            </label>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={userInfo.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={userInfo.email}
                                disabled
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-400 shadow-sm"
                            />
                        </div>

                        {/* Birthdate */}
                        <div>
                            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-300">
                                Birthdate
                            </label>
                            <input
                                type="date"
                                name="birthdate"
                                id="birthdate"
                                value={userInfo.birthdate}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                                Gender
                            </label>
                            <select
                                name="gender"
                                id="gender"
                                value={userInfo.gender}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManagerAccount;
