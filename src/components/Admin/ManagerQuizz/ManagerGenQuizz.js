"use client";
import React, { useState, useEffect } from 'react';
import { FiTrash2, FiSave, FiEdit } from 'react-icons/fi';
import axios from 'axios';
import createQuiz, { QUIZ_TYPES } from '../../../service/GeminiGenQuizz.mjs';
import MQuiz from './ManagerQuizz';

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
    const [selectedQuizType, setSelectedQuizType] = useState(QUIZ_TYPES.READING);

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
            const quizData = await createQuiz(subtitle, selectedQuizType);
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
                passage: quiz.passage,
                quiz_type: selectedQuizType
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
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Manager Quiz</h1>
            </div>
            <div className="mb-8 p-4 bg-white rounded-md shadow border border-gray-200">
                <div className="w-full max-w-md">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Choose a movie to generate quiz</label>
                    <select
                        value={selectedMovie}
                        onChange={(e) => handleMovieSelect(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    >
                        <option value="">-- Choose movie --</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>{movie.title}</option>
                        ))}
                    </select>
                </div>
                {selectedMovie && (() => {
                    const movie = movies.find(m => m.id === parseInt(selectedMovie));
                    if (!movie) return null;
                    return (
                        <>
                            <div className="flex items-center gap-4 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                {movie.thumbnail_url ? (
                                    <img src={movie.thumbnail_url} alt={movie.title} className="w-20 h-28 object-cover rounded shadow" />
                                ) : (
                                    <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                                <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-600 mb-1">{movie.title}</div>
                                    <div className="text-sm text-gray-600 mb-1">Year: {movie.release_year}</div>
                                    <div className="text-sm text-gray-600 mb-1">Genre: {movie.genre}</div>
                                    <div className="text-sm font-semibold text-gray-600 mb-1">
                                        Độ khó: <span className={`px-2 py-1 rounded-full text-xs text-black font-semibold ${movie.difficulty === 1 ? 'bg-green-100 text-green-800' : movie.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>Level {movie.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-base font-semibold text-gray-700 mb-2">Choose type quiz</label>
                                <select
                                    value={selectedQuizType}
                                    onChange={(e) => setSelectedQuizType(e.target.value)}
                                    className="w-full max-w-md rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                >
                                    <option value={QUIZ_TYPES.READING}>READING</option>
                                    <option value={QUIZ_TYPES.DIALOGUE_REORDERING}>DIALOGUE_REORDERING</option>
                                    <option value={QUIZ_TYPES.TRANSLATION}>TRANSLATION</option>
                                    <option value={QUIZ_TYPES.EQUIVALENT}>EQUIVALENT</option>
                                </select>
                                <button
                                    onClick={handleCreateQuiz}
                                    disabled={quizLoading || subtitleLoading}
                                    className="mt-4 ml-30 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {quizLoading ? 'Generate quiz...' : 'Quiz generated'}
                                </button>
                            </div>
                        </>
                    );
                })()}
            </div>
            {quizError && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded font-semibold max-w-md mx-auto">
                    {quizError}
                </div>
            )}
            {generatedQuizzes.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz generated</h2>
                    <div className="space-y-8">
                        {generatedQuizzes.map((quiz, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-lg p-6 w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <div className="text-lg font-semibold text-gray-800">{quiz.passage}</div>
                                        <div className="text-sm text-gray-500 font-semibold">Loại: {selectedQuizType}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveQuiz(quiz)}
                                            className="text-green-600 hover:text-green-800 transition-colors duration-150"
                                            title="Lưu Quiz"
                                        >
                                            <FiSave className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGeneratedQuiz(index)}
                                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                            title="Xóa Quiz"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {quiz.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="border-b border-gray-200 pb-4">
                                            <div className="font-semibold text-gray-800 mb-1">{qIndex + 1}. {question.question}</div>
                                            <ul className="ml-4 mt-2 space-y-1">
                                                {question.options.map((opt, i) => (
                                                    <li key={i} className="pl-2 text-sm text-gray-700 font-medium">
                                                        {opt}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-2 text-sm text-blue-600">
                                                <p><span className="font-semibold text-green-600">Đáp án đúng:</span> {question.answer}</p>
                                                <p><span className="font-semibold text-blue-600">Giải thích:</span> {question.explanation}</p>
                                                {question.quote && <p className="text-purple-600"><span className="font-semibold">Trích dẫn:</span> {question.quote}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedMovie && <MQuiz key={key} movieId={selectedMovie} />}
        </div>
    );
};

export default ManagerQuizz;

