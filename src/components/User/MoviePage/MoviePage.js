"use client"
import React, { useEffect, useState } from 'react';
import TaskBar from '../TaskBar/TaskBar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import LikeButton from '../LikeButton/LikeButton';

const BASE_API_URL = "http://localhost:8081/api";

const MoviePage = () => {
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const router = useRouter();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(`${BASE_API_URL}/movies`);
                setMovies(response.data);
                setFilteredMovies(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching movies:", err);
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        let filtered = [...movies];

        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(movie => movie.difficulty === parseInt(selectedDifficulty));
        }

        if (selectedGenre !== 'all') {
            filtered = filtered.filter(movie => movie.genre === selectedGenre);
        }

        setFilteredMovies(filtered);
    }, [selectedDifficulty, selectedGenre, movies]);

    const handleMovieClick = (movieId) => {
        router.push(`/Navigate/user/movieinfopage/${movieId}`);
    };

    // Lấy danh sách thể loại duy nhất từ danh sách phim
    const uniqueGenres = ['all', ...new Set(movies.map(movie => movie.genre))];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#18191a]">
            <TaskBar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">All Movies</h1>

                {/* Filter Section */}
                <div className="mb-8 flex gap-4">
                    <div className="flex-1">
                        <label className="block text-white text-sm font-bold mb-2">
                            Difficulty Level
                        </label>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Levels</option>
                            <option value="1">Beginner</option>
                            <option value="2">Intermediate</option>
                            <option value="3">Advanced</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-white text-sm font-bold mb-2">
                            Genre
                        </label>
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full bg-[#1f1f1f] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {uniqueGenres.map(genre => (
                                <option key={genre} value={genre}>
                                    {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <p className="text-gray-400 mb-4">
                    Showing {filteredMovies.length} movies
                </p>

                {/* Movies Grid */}
                <div className="grid grid-cols-5 gap-6">
                    {filteredMovies.map((movie) => (
                        <div
                            key={movie.id}
                            className="bg-[#1f1f1f] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="relative aspect-[2/3] cursor-pointer" onClick={() => handleMovieClick(movie.id)}>
                                <img
                                    src={movie.thumbnail_url}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-bold">
                                    Level {movie.difficulty}
                                </div>
                                <div className="absolute top-2 right-2">
                                    <LikeButton movieId={movie.id} />
                                </div>
                            </div>
                            <div className="p-4" onClick={() => handleMovieClick(movie.id)}>
                                <h2 className="text-white text-lg font-semibold mb-2 truncate" title={movie.title}>
                                    {movie.title}
                                </h2>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-400 text-sm">
                                        {movie.release_year || 'N/A'}
                                    </p>
                                    <span className="text-gray-400 text-sm">
                                        {movie.genre}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No results message */}
                {filteredMovies.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-lg">
                            No movies found matching your filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoviePage;
