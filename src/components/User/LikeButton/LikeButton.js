"use client";

import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import axiosInstance from '@/src/utils/axios';

const LikeButton = ({ movieId, size = 24, className = "" }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsLoggedIn(true);
            checkFavoriteStatus(movieId);
        }
    }, [movieId]);

    const checkFavoriteStatus = async (movieId) => {
        if (!movieId) return;
        try {
            const response = await axiosInstance.get(`/favorites/check/${movieId}`);
            setIsFavorited(response.data.isFavorited);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            alert('Please login to add movies to favorites');
            return;
        }

        setIsLoading(true);
        try {
            if (isFavorited) {
                await axiosInstance.delete('/favorites', {
                    data: { movie_id: movieId }
                });
                setIsFavorited(false);
            } else {
                await axiosInstance.post('/favorites', {
                    movie_id: movieId
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            if (error.response?.status === 409) { // Already in favorites
                setIsFavorited(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`
                ${isFavorited
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                } 
                transition-all duration-300 ease-in-out 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <FiHeart
                size={size}
                className={`${isFavorited ? 'fill-current' : ''}`}
            />
        </button>
    );
};

export default LikeButton; 