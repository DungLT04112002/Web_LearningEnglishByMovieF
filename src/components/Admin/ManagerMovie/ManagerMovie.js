"use client"; // Chỉ định đây là Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiBook } from 'react-icons/fi';
import axiosInstance from '../../../utils/axios';
import { useRouter } from 'next/navigation';

const MMovie = () => {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [currentMovieData, setCurrentMovieData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        video_url: '',
        release_year: '',
        genre: '',
        difficulty: 1
    });

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/movies');
            setMovies(response.data || []);
        } catch (err) {
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentMovieData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        console.log(event.target.value);
    };

    const handleAddClick = () => {
        setEditingMovie(null);
        setCurrentMovieData({
            title: '',
            description: '',
            thumbnail_url: '',
            video_url: '',
            release_year: '',
            genre: '',
            difficulty: 1
        });
        setShowModal(true);
    };

    const handleEditClick = (movie) => {
        setEditingMovie(movie);
        setCurrentMovieData({
            title: movie.title || '',
            description: movie.description || '',
            thumbnail_url: movie.thumbnail_url || '',
            video_url: movie.video_url || '',
            release_year: movie.release_year || '',
            genre: movie.genre || '',
            difficulty: movie.difficulty || 1
        });
        console.log(movie);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMovie(null);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phim này không`)) {
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.delete(`/movies/${id}`);
            fetchMovies();
        } catch (err) {
            console.log("lỗi xóa phim.")
        } finally {
            setLoading(false);
        }
    };

    const handlePracticeClick = (movieId) => {
        router.push(`/Navigate/user/practicepage/${movieId}`);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const movieDataPayload = {
            ...currentMovieData,
            release_year: currentMovieData.release_year ? parseInt(currentMovieData.release_year, 10) : null,
            difficulty: parseInt(currentMovieData.difficulty, 10)
        };

        if (movieDataPayload.release_year && isNaN(movieDataPayload.release_year)) {
            setLoading(false);
            return;
        }

        try {
            if (editingMovie) {
                await axiosInstance.put(`/movies/${editingMovie.id}`, movieDataPayload);
            } else {
                await axiosInstance.post('/movies', movieDataPayload);
            }
            closeModal();
            fetchMovies();
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-bold text-gray-800">Movie Management</h1>
                <button
                    onClick={handleAddClick}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow "
                    disabled={loading}
                >
                    <FiPlus className="mr-2" />
                    Add New Movie
                </button>
            </div>

            <div className="bg-white rounded-lg  overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-black text-xs uppercase ">ID</th>
                                <th className="px-6 py-3 text-left text-black text-xs  uppercase ">Thumbnail</th>
                                <th className="px-6 py- 3 text-left text-black text-xs  uppercase ">Title</th>
                                <th className="px-6 py-3 text-left  text-black text-xs uppercase  ">Description</th>
                                <th className="px-6 py-3 text-left text-black text-xs  uppercase">Year</th>
                                <th className="px-6 py-3 text-left text-black text-xs  uppercase">Genre</th>
                                <th className="px-6 py-3 text-left text-black text-xs  uppercase">Difficulty</th>
                                <th className="px-6 py-3 text-xs   text-black   text-left  uppercase ">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y">
                            {loading && (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-500">
                                        Loading movies...
                                    </td>
                                </tr>
                            )}
                            {!loading && movies.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-500">No movies found.</td>
                                </tr>
                            )}
                            {!loading && movies.map((movie) => (
                                <tr key={movie.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {movie.thumbnail_url ? (
                                            <img src={movie.thumbnail_url} alt={movie.title} className="h-10 w-16 object-cover rounded" />
                                        ) : (
                                            <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{movie.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate hidden md:table-cell" title={movie.description}>
                                        {movie.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.release_year}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.genre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${movie.difficulty === 1 ? 'bg-green-100 text-green-800' :
                                            movie.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            Level {movie.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handlePracticeClick(movie.id)}
                                            className="text-green-600 hover:text-green-800 transition-colors -150"
                                            title="Practice Quiz"
                                            disabled={loading}
                                        >
                                            <FiBook className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(movie)}
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors duration-150"
                                            title="Edit Movie"
                                            disabled={loading}
                                        >
                                            <FiEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(movie.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                            title="Delete Movie"
                                            disabled={loading}
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
                    <div className="relative bg-white rounded-lg shadow-xl w-2/3 mx-auto p-6 m-4 duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold leading-6 text-black mb-6 border-b pb-3">
                            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-black mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={currentMovieData.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black "
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-black mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={currentMovieData.description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300  py-2 px-3 text-black "
                                    disabled={loading}
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="thumbnail_url" className="block text-sm font-medium text-black mb-1">
                                    Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    id="thumbnail_url"
                                    name="thumbnail_url"
                                    value={currentMovieData.thumbnail_url}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300  py-2 px-3 text-black "
                                    placeholder="https://example.com/image.jpg"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="video_url" className="block text-sm font-medium text-black mb-1">
                                    Video URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="video_url"
                                    name="video_url"
                                    value={currentMovieData.video_url}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black "
                                    placeholder="https://example.com/video.mp4"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="release_year" className="block text-sm font-medium text-black mb-1">
                                    Release Year
                                </label>
                                <input
                                    type="number"
                                    id="release_year"
                                    name="release_year"
                                    value={currentMovieData.release_year}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black "
                                    placeholder="e.g., 2023"
                                    min="1800"
                                    max={new Date().getFullYear() + 1}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="genre" className="block text-sm font-medium text-black mb-1">
                                    Genre
                                </label>
                                <select
                                    id="genre"
                                    name="genre"
                                    value={currentMovieData.genre}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black "
                                    disabled={loading}
                                >
                                    <option value="">Select a genre</option>
                                    <option value="Action">Action</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Animation">Animation</option>
                                    <option value="Comedy">Comedy</option>
                                    <option value="Crime">Crime</option>
                                    <option value="Documentary">Documentary</option>
                                    <option value="Drama">Drama</option>
                                    <option value="Family">Family</option>
                                    <option value="Fantasy">Fantasy</option>
                                    <option value="Horror">Horror</option>
                                    <option value="Mystery">Mystery</option>
                                    <option value="Romance">Romance</option>
                                    <option value="Sci-Fi">Sci-Fi</option>
                                    <option value="Thriller">Thriller</option>
                                    <option value="War">War</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-black mb-1">
                                    Difficulty Level
                                </label>
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    value={currentMovieData.difficulty}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black "
                                    disabled={loading}
                                >
                                    <option value="1">Level 1 - Easy</option>
                                    <option value="2">Level 2 - Medium</option>
                                    <option value="3">Level 3 - Hard</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-black bg-gray-100 "
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-sm bg-green-300 text-black rounded-md '}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                                    ) : null}
                                    {loading ? 'Saving...' : (editingMovie ? 'Update Movie' : 'Add Movie')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MMovie;
