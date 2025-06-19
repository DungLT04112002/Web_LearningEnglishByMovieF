"use client"
import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import axiosInstance from '../../../utils/axios';

const MSubtitle = () => {
    const [subtitles, setSubtitles] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingSubtitle, setEditingSubtitle] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);

    // Fetch tất cả subtitle và movies khi component mount
    useEffect(() => {
        fetchSubtitles();
        fetchMovies();
    }, []);

    // Lấy danh sách phim
    const fetchMovies = async () => {
        try {
            const response = await axiosInstance.get('/movies');
            setMovies(response.data);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setError("Failed to fetch movies");
        }
    };

    // Lấy tất cả subtitle
    const fetchSubtitles = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/subtitles');
            setSubtitles(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching subtitles:", error);
            setError("Failed to fetch subtitles");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý xóa subtitle
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subtitle?")) {
            return;
        }
        try {
            await axiosInstance.delete(`/subtitles/${id}`);
            fetchSubtitles(); // Refresh danh sách sau khi xóa
        } catch (error) {
            console.error("Error deleting subtitle:", error);
            setError("Failed to delete subtitle");
        }
    };

    // Xử lý edit subtitle
    const handleEdit = (subtitle) => {
        setEditingSubtitle(subtitle);
        setSelectedMovie(subtitle.movie_id);
        setSelectedLanguage(subtitle.language);
        setShowModal(true);
    };
    const handleDownloadSRT = (srtContent, filename = 'subtitle.srt') => {
        const blob = new Blob([srtContent], { type: 'application/x-subrip' }); // MIME type cho file .srt
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Xử lý submit form
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('movie_id', String(selectedMovie));
        formData.append('language', selectedLanguage);
        if (selectedFile) {
            formData.append('subtitleFile', selectedFile);
        }

        try {
            console.log("--- FormData Content ---");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name}`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            console.log("-----------------------");
            if (editingSubtitle) {
                await axiosInstance.put(`/subtitles/${editingSubtitle.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                console.log("Post");
                await axiosInstance.post('/subtitles', formData);
            }
            setShowModal(false);
            fetchSubtitles();
        } catch (error) {
            console.error("Error saving subtitle:", error.response?.data || error);
            setError(error.response?.data?.details || "Failed to save subtitle");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Subtitle Management</h1>
                <button
                    onClick={() => {
                        setEditingSubtitle(null);
                        setSelectedMovie('');
                        setSelectedLanguage('en');
                        setSelectedFile(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    disabled={loading}
                >
                    <FiPlus className="mr-2" />
                    Add New Subtitle
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Subtitle Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Movie
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Language
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                File Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : subtitles.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No subtitles found
                                </td>
                            </tr>
                        ) : (
                            subtitles.map((subtitle) => (
                                <tr key={subtitle.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {movies.find(m => m.id === subtitle.movie_id)?.title || 'Unknown Movie'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subtitle.language === 'en' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {subtitle.language === 'en' ? 'English' : 'Vietnamese'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                                        {subtitle.srt_content ? (
                                            <button onClick={() => handleDownloadSRT(subtitle.srt_content, `subtitle-${subtitle.id}.srt`)}>
                                                Download SRT
                                            </button>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(subtitle)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            disabled={loading}
                                        >
                                            <FiEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subtitle.id)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={loading}
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            {editingSubtitle ? 'Edit Subtitle' : 'Add New Subtitle'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Movie Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Movie
                                </label>
                                <select
                                    value={selectedMovie}
                                    onChange={(e) => {
                                        setSelectedMovie(e.target.value)
                                        console.log(e.target.value)

                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select a movie</option>
                                    {movies.map((movie) => (
                                        <option key={movie.id} value={movie.id}>
                                            {movie.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Language
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => {
                                        setSelectedLanguage(e.target.value)
                                        console.log('Language selected:', e.target.value);
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="en">English</option>
                                    <option value="vi">Vietnamese</option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Subtitle File (.srt)
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files[0]);
                                        console.log(e.target.files[0]);
                                    }}
                                    accept=".srt"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    required={!editingSubtitle}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editingSubtitle ? 'Update' : 'Add')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MSubtitle;