"use client"; // Chỉ định đây là Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiEye } from 'react-icons/fi'; // Thêm FiEye nếu muốn xem trước
import axios from 'axios'; // Sử dụng axios cho các yêu cầu HTTP

// Định nghĩa kiểu dữ liệu cho một bộ phim (TypeScript-like, for clarity)
// interface Movie {
//     id: number;
//     title: string;
//     description: string;
//     thumbnail_url: string;
//     video_url: string;
//     release_year: number;
//     created_at?: string; // Optional
// }

const BASE_API_URL = 'http://localhost:8081/api'; // Đặt URL gốc của API ở đây

const MMovie = () => {
    const [movies, setMovies] = useState([]); // State lưu danh sách phim
    const [showModal, setShowModal] = useState(false); // State điều khiển hiển thị modal
    const [loading, setLoading] = useState(false); // State trạng thái loading
    const [editingMovie, setEditingMovie] = useState(null); // State lưu phim đang chỉnh sửa (null nếu là thêm mới)
    const [currentMovieData, setCurrentMovieData] = useState({ // State lưu dữ liệu form
        title: '',
        description: '',
        thumbnail_url: '',
        video_url: '',
        release_year: '',
    });
    const [error, setError] = useState(null); // State lưu lỗi

    // --- Hàm gọi API ---

    // Hàm lấy danh sách phim
    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_API_URL}/movies`);
            setMovies(response.data || []); // Đảm bảo movies luôn là mảng
        } catch (err) {
            console.error("Error fetching movies:", err);
            setError("Failed to fetch movies. Please check the API connection.");
            setMovies([]); // Reset về mảng rỗng khi lỗi
        } finally {
            setLoading(false);
        }
    }, []); // useCallback để tránh tạo lại hàm mỗi lần render

    // Fetch phim khi component mount lần đầu
    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]); // Phụ thuộc vào fetchMovies

    // --- Hàm xử lý sự kiện ---

    // Thay đổi giá trị input trong form
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCurrentMovieData(prevData => ({
            ...prevData,
            [name]: value,
        }));
        console.log(event.target.value);
    };

    // Mở modal để thêm phim mới
    const handleAddClick = () => {
        setEditingMovie(null); // Đảm bảo không ở chế độ sửa
        setCurrentMovieData({ // Reset form data
            title: '',
            description: '',
            thumbnail_url: '',
            video_url: '',
            release_year: '',
        });
        setError(null); // Xóa lỗi cũ
        setShowModal(true);
    };

    // Mở modal để sửa phim
    const handleEditClick = (movie) => {
        setEditingMovie(movie); // Đặt phim đang sửa
        setCurrentMovieData({ // Điền dữ liệu phim vào form
            title: movie.title || '',
            description: movie.description || '',
            thumbnail_url: movie.thumbnail_url || '',
            video_url: movie.video_url || '',
            release_year: movie.release_year || '',
        });
        console.log(movie);

        setError(null);
        setShowModal(true);
    };

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setEditingMovie(null); // Reset trạng thái sửa
        setError(null); // Clear lỗi khi đóng modal
    };

    // Xử lý xóa phim
    const handleDeleteClick = async (id) => {
        if (!window.confirm(`Are you sure you want to delete movie ID: ${id}? This action cannot be undone.`)) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${BASE_API_URL}/movies/${id}`);
            // alert('Movie deleted successfully!'); // Hoặc dùng toast notification
            fetchMovies(); // Tải lại danh sách sau khi xóa
        } catch (err) {
            console.error(`Error deleting movie ${id}:`, err);
            setError(`Failed to delete movie. ${err.response?.data?.message || err.message}`);
            // alert(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý submit form (Thêm mới hoặc Cập nhật)
    const handleSubmit = async (event) => {
        event.preventDefault(); // Ngăn submit mặc định
        setLoading(true);
        setError(null);

        const movieDataPayload = {
            ...currentMovieData,
            // Đảm bảo release_year là số nếu nó có giá trị
            release_year: currentMovieData.release_year ? parseInt(currentMovieData.release_year, 10) : null,
        };

        // Validate year (simple example)
        if (movieDataPayload.release_year && isNaN(movieDataPayload.release_year)) {
            setError("Release Year must be a valid number.");
            setLoading(false);
            return;
        }

        try {
            if (editingMovie) {
                // --- Chế độ Update ---
                await axios.put(`${BASE_API_URL}/movies/${editingMovie.id}`, movieDataPayload);
                // alert('Movie updated successfully!');
            } else {
                // --- Chế độ Create ---
                await axios.post(`${BASE_API_URL}/movies`, movieDataPayload);
                // alert('Movie added successfully!');
            }
            closeModal(); // Đóng modal sau khi thành công
            fetchMovies(); // Tải lại danh sách phim
        } catch (err) {
            console.error(`Error ${editingMovie ? 'updating' : 'adding'} movie:`, err);
            // Cố gắng hiển thị lỗi cụ thể từ backend nếu có
            const backendError = err.response?.data?.details || err.response?.data?.error || err.response?.data?.message || err.message;
            setError(`Failed to ${editingMovie ? 'update' : 'add'} movie: ${backendError}`);
            // alert(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Phần Render JSX ---
    return (
        <div className="p-6 bg-gray-100 min-h-screen font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-bold text-gray-800">Movie Management</h1>
                <button
                    onClick={handleAddClick}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={loading}
                >
                    <FiPlus className="mr-2" />
                    Add New Movie
                </button>
            </div>

            {/* Hiển thị lỗi chung */}
            {error && !showModal && ( // Chỉ hiển thị lỗi chung khi modal đóng
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Bảng Danh sách Phim */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                        Loading movies...
                                    </td>
                                </tr>
                            )}
                            {!loading && movies.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">No movies found.</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
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
                                        {/* Optional: View Button */}
                                        {/* <button className="text-blue-600 hover:text-blue-800" title="View Details"><FiEye className="w-5 h-5" /></button> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm/Sửa Phim */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6 m-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6 border-b pb-3">
                            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
                        </h3>

                        {/* Hiển thị lỗi trong modal */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={currentMovieData.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={currentMovieData.description}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    disabled={loading}
                                ></textarea>
                            </div>

                            {/* Thumbnail URL */}
                            <div>
                                <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail URL
                                </label>
                                <input
                                    type="url"
                                    id="thumbnail_url"
                                    name="thumbnail_url"
                                    value={currentMovieData.thumbnail_url}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="https://example.com/image.jpg"
                                    disabled={loading}
                                />
                            </div>

                            {/* Video URL */}
                            <div>
                                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    Video URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    id="video_url"
                                    name="video_url"
                                    value={currentMovieData.video_url}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="https://example.com/video.mp4"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Release Year */}
                            <div>
                                <label htmlFor="release_year" className="block text-sm font-medium text-gray-700 mb-1">
                                    Release Year
                                </label>
                                <input
                                    type="number"
                                    id="release_year"
                                    name="release_year"
                                    value={currentMovieData.release_year}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g., 2023"
                                    min="1800" // Optional: Add min/max
                                    max={new Date().getFullYear() + 1} // Optional: Current year + 1
                                    disabled={loading}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2"></div>
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
