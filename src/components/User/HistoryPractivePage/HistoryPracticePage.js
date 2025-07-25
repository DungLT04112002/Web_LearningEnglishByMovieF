"use client"
import React, { useEffect, useState } from "react";
import TaskBar from "../TaskBar/TaskBar";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const BASE_API_URL = 'http://localhost:8081/api'; // Đổi thành API backend của bạn nếu cần

const HistoryPracticePage = () => {
    const [history, setHistory] = useState([]);
    const [movies, setmovies] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Chỉ lấy lịch sử đã nộp từ localStorage
        const data = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
        setHistory(data.reverse()); // Hiển thị bài mới nhất lên đầu
        // Lấy thumbnail cho các movieId
        const uniqueMovieIds = [...new Set(data.map(item => item.movieId))];
        uniqueMovieIds.forEach(async (movieId) => {
            if (!movies[movieId]) {
                try {
                    const res = await axios.get(`${BASE_API_URL}/movies/${movieId}`);
                    setmovies(prev => ({ ...prev, [movieId]: res.data }));
                } catch (e) {
                    setmovies(prev => ({ ...prev, [movieId]: null }));
                }
            }
        });
    }, []);

    const handleCardClick = (item) => {
        localStorage.setItem('practiceResultView', JSON.stringify(item));
        router.push(`/Navigate/user/practicepage/${item.movieId}?viewResult=1`);
    };

    const handleDelete = (idx) => {
        const newHistory = [...history];
        newHistory.splice(idx, 1);
        setHistory(newHistory);
        localStorage.setItem('practiceHistory', JSON.stringify([...newHistory].reverse())); // Lưu lại theo thứ tự cũ
    };

    const handleClearHistory = () => {
        localStorage.removeItem('practiceHistory');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TaskBar />
            <div className="max-w-5xl mx-auto py-10 px-4">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleClearHistory}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow"
                    >
                        Delete All
                    </button>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 text-center mb-10">Practice History</h1>
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg">No practice history found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {history.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-2xl transition p-0 relative"
                                onClick={() => handleCardClick(item)}
                            >
                                {/* Nút xóa */}
                                <button
                                    className="absolute top-3 right-3 z-20 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg border-2 border-white transition-all duration-200 scale-110 hover:scale-125"
                                    onClick={e => { e.stopPropagation(); handleDelete(idx); }}
                                    title="Delete this record"
                                >
                                    <FaTrash size={20} />
                                </button>
                                {/* Thumbnail */}
                                <div className="h-48 w-full rounded-t-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {movies[item.movieId] ? (
                                        <img src={movies[item.movieId].thumbnail_url} alt="thumbnail" className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-gray-400">No Image</span>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="p-5">
                                    <div className="font-bold text-lg text-gray-800 mb-2">Movie ID: {item.movieId}</div>
                                    <div className="text-gray-600 text-sm mb-1">Time: {new Date(item.time).toLocaleString()}</div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-blue-600 font-semibold">Score: {item.score?.toFixed(1)}%</span>
                                        <span className="text-green-600 inline-flex items-center gap-1">
                                            <FaCheck /> {item.totalCorrect}
                                        </span>
                                        <span className="text-red-600 inline-flex items-center gap-1">
                                            <FaTimes /> {item.totalWrong}
                                        </span>

                                    </div>
                                    <div className="text-gray-500 text-xs">Total Questions: {item.totalQuestions}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPracticePage;
