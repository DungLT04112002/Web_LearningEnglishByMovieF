"use client";
import React, { useState, useEffect } from 'react';
import { FiTrash2, FiSave } from 'react-icons/fi';
import axios from 'axios';
import createQuiz from '../../../server/openAI.mjs';
import MQuiz from './MQuiz';

const BASE_API_URL = 'http://localhost:8081/api';

const ManagerQuizz = () => {
    // State cho danh sách phim và phim được chọn
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedMovieTitle, setSelectedMovieTitle] = useState('');
    const [key, setKey] = useState(0);

    // State cho phụ đề
    const [subtitle, setSubtitle] = useState('');
    const [subtitleLoading, setSubtitleLoading] = useState(false);

    // State cho quiz
    const [generatedQuizzes, setGeneratedQuizzes] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState(null);

    // Lấy danh sách phim
    useEffect(() => {
        fetchMovies();
    }, []);

    // Add this new useEffect
    useEffect(() => {
        if (selectedMovie) {
            setKey(prevKey => prevKey + 1); // Force MQuiz to remount when selectedMovie changes
        }
    }, [selectedMovie]);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/movies`);
            if (response.data && Array.isArray(response.data)) {
                setMovies(response.data);
            } else {
                setQuizError('Không thể lấy danh sách phim');
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            setQuizError('Lỗi khi lấy danh sách phim');
        }
    };

    // Lấy phụ đề khi chọn phim
    const handleMovieSelect = async (movieId) => {
        if (!movieId) {
            setQuizError('Vui lòng chọn phim');
            return;
        }

        setSelectedMovie(movieId);
        console.log("selectedMovie: ", selectedMovie);
        setSubtitleLoading(true);
        try {
            const selectedMovie = movies.find(m => m.id === parseInt(movieId));
            if (!selectedMovie) {
                setQuizError('Không tìm thấy thông tin phim');
                return;
            }

            setSelectedMovieTitle(selectedMovie.title);

            const response = await axios.get(`${BASE_API_URL}/movies/${movieId}/subtitles/en`);
            const englishSubtitle = response.data;

            if (englishSubtitle) {
                setSubtitle(englishSubtitle.srt_content);
            } else {
                setSubtitle('');
                setQuizError('Không tìm thấy phụ đề tiếng Anh cho phim này');
            }
        } catch (error) {
            console.error('Error fetching subtitle:', error);
            setQuizError('Lỗi khi lấy phụ đề');
        } finally {
            setSubtitleLoading(false);
        }
    };

    // Tạo quiz từ phụ đề
    const handleCreateQuiz = async () => {
        if (!subtitle) {
            setQuizError('Không có phụ đề để tạo quiz');
            return;
        }

        try {
            setQuizLoading(true);
            setQuizError(null);
            const quizData = await createQuiz(subtitle);
            setGeneratedQuizzes(quizData);
        } catch (error) {
            console.error('Error creating quiz:', error);
            setQuizError(`Lỗi tạo quiz: ${error.message}`);
        } finally {
            setQuizLoading(false);
        }
    };

    // Xóa quiz được tạo
    const handleDeleteGeneratedQuiz = (index) => {
        setGeneratedQuizzes(prev => prev.filter((_, i) => i !== index));
    };

    // Lưu quiz vào database
    const handleSaveQuiz = async (quiz) => {
        try {
            // Lưu quiz
            const quizResponse = await axios.post(`${BASE_API_URL}/quizzes`, {
                movie_id: selectedMovie,
                passage: quiz.passage
            });

            const quizId = quizResponse.data.quizId;

            // Lưu các câu hỏi
            for (const question of quiz.questions) {
                const questionResponse = await axios.post(`${BASE_API_URL}/questions`, {
                    quiz_id: quizId,
                    question: question.question,
                    answer: question.answer,
                    explanation: question.explanation,
                    quote: question.quote
                });

                const questionId = questionResponse.data.questionId;

                // Lưu các lựa chọn
                for (let i = 0; i < question.options.length; i++) {
                    const option = question.options[i];
                    await axios.post(`${BASE_API_URL}/options`, {
                        question_id: questionId,
                        label: String.fromCharCode(65 + i), // A, B, C, D
                        content: option.substring(3) // Bỏ "A. ", "B. ", etc.
                    });
                }
            }

            // Xóa quiz đã lưu khỏi danh sách generated
            setGeneratedQuizzes(prev => prev.filter(q => q !== quiz));
            setQuizError(null);
        } catch (error) {
            console.error('Error saving quiz:', error);
            setQuizError(`Lỗi lưu quiz: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Quiz</h1>
            </div>

            {/* Movie Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phim
                </label>
                <select
                    value={selectedMovie}
                    onChange={(e) => handleMovieSelect(e.target.value)}
                    className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">-- Chọn phim --</option>
                    {movies.map((movie) => (
                        <option key={movie.id} value={movie.id}>
                            {movie.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selected Movie Info */}
            {selectedMovie && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-2">{selectedMovieTitle}</h2>
                    <button
                        onClick={handleCreateQuiz}
                        disabled={quizLoading || subtitleLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {quizLoading ? 'Đang tạo quiz...' : 'Tạo quiz từ phụ đề'}
                    </button>
                </div>
            )}

            {/* Error Display */}
            {quizError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    {quizError}
                </div>
            )}

            {/* Generated Quizzes */}
            {generatedQuizzes.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Quiz được tạo</h2>
                    <div className="space-y-6">
                        {generatedQuizzes.map((quiz, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Quiz #{index + 1}</h3>
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => handleSaveQuiz(quiz)}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center"
                                        >
                                            <FiSave className="w-4 h-4 mr-1" />
                                            Lưu
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGeneratedQuiz(index)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center"
                                        >
                                            <FiTrash2 className="w-4 h-4 mr-1" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">{quiz.passage}</p>

                                <div className="space-y-4">
                                    {quiz.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="border-t pt-4">
                                            <p className="font-medium text-gray-800">{qIndex + 1}. {question.question}</p>
                                            <ul className="ml-4 mt-2 space-y-1">
                                                {question.options.map((opt, i) => (
                                                    <li key={i} className={`pl-2 ${opt.startsWith(question.answer) ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                                                        {opt}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p><span className="font-medium">Giải thích:</span> {question.explanation}</p>
                                                <p><span className="font-medium">Trích dẫn:</span> {question.quote}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display saved quizzes */}
            {selectedMovie && <MQuiz key={key} movieId={selectedMovie} />}
        </div>
    );
};

export default ManagerQuizz;

