"use client";

import React, { useState, useEffect } from 'react';
import TaskBar from '../TaskBar/TaskBar';
import axiosInstance from '@/src/utils/axios';
import { useRouter } from 'next/navigation';
import { FiHeart, FiTrash2, FiSearch } from 'react-icons/fi';

const FavoritePage = () => {
    const [favorites, setFavorites] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            fetchFavorites();
        } else {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để lấy thông tin danh sách yêu thích.');
            router.push('/');
        }
    }, []);

    useEffect(() => {
        let filtered = [...favorites];

    }, [favorites]);

    const fetchFavorites = async () => {
        try {
            const response = await axiosInstance.get('/favorites');
            setFavorites(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setLoading(false);
        }
    };

    const removeFromFavorites = async (movieId) => {
        try {
            await axiosInstance.delete('/favorites', {
                data: { movie_id: movieId }
            });
            setFavorites(prev => prev.filter(movie => movie.id !== movieId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const handleMovieClick = (movieId) => {
        router.push(`/Navigate/user/watchmovie/${movieId}`);
    };


    if (!isLoggedIn) {
        return null; // or a redirect component
    }

    return (
        <div className="min-h-screen bg-[#18191a]">
            <TaskBar />
            <div className="container mx-auto px-4  pt-[10vh]">
                <div className="flex items-center gap-4 mb-8">
                    <FiHeart className="text-red-500" size={32} />
                    <h1 className="text-3xl font-bold text-white">My Favorite Movies</h1>
                </div>
                {/* Results count */}


                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {favorites.map((movie) => (
                            <div
                                key={movie.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="relative aspect-[2/3]">

                                    <img
                                        src={movie.thumbnail_url}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                        onClick={() => handleMovieClick(movie.id)}
                                    />

                                    <button
                                        onClick={() => removeFromFavorites(movie.id)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:text-red-500 transition-colors"
                                        title="Remove from Favorites"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h2 className="text-white text-lg font-semibold mb-2 truncate" title={movie.title}>
                                        {movie.title}
                                    </h2>
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-400 text-sm">
                                            Level {movie.difficulty}
                                        </p>
                                        <span className="text-gray-400 text-sm">
                                            {movie.genre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <FiSearch className="text-gray-600 mx-auto mb-4" size={64} />
                        <h2 className="text-gray-400 text-2xl font-semibold mb-2">No movies found</h2>
                        <p className="text-gray-500 mb-6">
                            {favorites.length > 0 ? "No movies match your current filters." : "Your favorites list is empty."}
                        </p>
                        {favorites.length === 0 && (
                            <button
                                onClick={() => router.push('/Navigate/user/moviepage')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300"
                            >
                                Go to movie page
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritePage;
