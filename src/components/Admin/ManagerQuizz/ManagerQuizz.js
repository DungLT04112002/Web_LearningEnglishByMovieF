"use client";
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios';
import { FiEdit, FiTrash2 } from 'react-icons/fi';  // Thêm icon

const MovieQuiz = ({ movieId }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [selectedQuizType, setSelectedQuizType] = useState('all'); // Thêm state cho loại quiz

    // Form states
    const [quizForm, setQuizForm] = useState({
        passage: '',
        quiz_type: 'reading' // Default value matching database ENUM
    });

    const [questionForm, setQuestionForm] = useState({
        question: '',
        answer: '',
        explanation: '',
        quote: ''
    });
    const [optionForm, setOptionForm] = useState({
        label: '',
        content: ''
    });

    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        console.log("id", movieId);
        fetchMovieQuizzes();
    }, []);

    const fetchMovieQuizzes = async () => {
        try {
            const quizzesResponse = await axiosInstance.get(`/quizzes/movie/${movieId}`);
            const quizzesData = quizzesResponse.data;

            const quizzesWithQuestions = await Promise.all(
                quizzesData.map(async (quiz) => {
                    const questionsResponse = await axiosInstance.get(`/questions/quiz/${quiz.id}`);
                    const questions = questionsResponse.data;

                    const questionsWithOptions = await Promise.all(
                        questions.map(async (question) => {
                            const optionsResponse = await axiosInstance.get(`/options/question/${question.id}`);
                            return {
                                ...question,
                                options: optionsResponse.data
                            };
                        })
                    );

                    return {
                        ...quiz,
                        questions: questionsWithOptions
                    };
                })
            );

            setQuizzes(quizzesWithQuestions);
            setLoading(false);
        } catch (err) {
            setError('Error fetching quiz data');
            console.error('Error:', err);
            setLoading(false);
        }
    };

    // Quiz handlers
    const handleEditQuiz = (quiz) => {
        console.log("Editing quiz:", quiz); // Debug log
        setSelectedQuiz(quiz);
        setQuizForm({
            passage: quiz.passage || '',
            quiz_type: quiz.quiz_type || 'reading'
        });
        setShowQuizModal(true);
    };

    const handleUpdateQuiz = async () => {
        try {
            if (!quizForm.quiz_type || !['reading', 'dialogue_reordering', 'translation', 'equivalent'].includes(quizForm.quiz_type)) {
                setError('Invalid quiz type');
                return;
            }

            const updateData = {
                movie_id: selectedQuiz.movie_id,
                passage: quizForm.passage,
                quiz_type: quizForm.quiz_type
            };

            await axiosInstance.put(`/quizzes/${selectedQuiz.id}`, updateData);
            setShowQuizModal(false);
            fetchMovieQuizzes();
        } catch (err) {
            console.error('Error updating quiz:', err);
            setError(err.response?.data?.message || 'Error updating quiz');
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await axiosInstance.delete(`/quizzes/${quizId}`);
                fetchMovieQuizzes();
            } catch (err) {
                console.error('Error deleting quiz:', err);
            }
        }
    };

    // Question handlers
    const handleEditQuestion = (question) => {
        setSelectedQuestion(question);
        setQuestionForm({
            question: question.question,
            answer: question.answer,
            explanation: question.explanation,
            quote: question.quote || ''
        });
        setShowQuestionModal(true);
    };

    const handleUpdateQuestion = async () => {
        try {
            await axiosInstance.put(`/questions/${selectedQuestion.id}`, {
                ...questionForm,
                quiz_id: selectedQuestion.quiz_id
            });
            setShowQuestionModal(false);
            fetchMovieQuizzes();
        } catch (err) {
            console.error('Lỗi update:', err);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Bạn có chắc muốn xóa ?')) {
            try {
                await axiosInstance.delete(`/questions/${questionId}`);
                fetchMovieQuizzes();
            } catch (err) {
                console.error('Lỗi xoa quiz:', err);
            }
        }
    };

    // Option handlers
    const handleEditOption = (option) => {
        setSelectedOption(option);
        setOptionForm({
            label: option.label,
            content: option.content
        });
        setShowOptionModal(true);
    };

    const handleUpdateOption = async () => {
        try {
            await axiosInstance.put(`/options/${selectedOption.id}`, {
                ...optionForm,
                question_id: selectedOption.question_id
            });
            setShowOptionModal(false);
            fetchMovieQuizzes();
        } catch (err) {
            console.error('Lỗi update:', err);
        }
    };

    const handleDeleteOption = async (optionId) => {
        if (window.confirm('Bạn có chắc muốn xóa không?')) {
            try {
                await axiosInstance.delete(`/options/${optionId}`);
                fetchMovieQuizzes();
            } catch (err) {
                console.error('lỗi xóa:', err);
            }
        }
    };

    // Thêm hàm filter quizzes
    const filteredQuizzes = selectedQuizType === 'all'
        ? quizzes
        : quizzes.filter(quiz => quiz.quiz_type === selectedQuizType);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Movie Quizzes</h1>
                <div className="flex items-center space-x-4">
                    <label className="text-base font-semibold text-gray-700">Filter by type:</label>
                    <select
                        value={selectedQuizType}
                        onChange={(e) => setSelectedQuizType(e.target.value)}
                        className="rounded-md border border-gray-300 shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    >
                        <option value="all">All Types</option>
                        <option value="reading">Reading Comprehension</option>
                        <option value="dialogue_reordering">Dialogue Reordering</option>
                        <option value="translation">Translation</option>
                        <option value="equivalent">Equivalent</option>
                    </select>
                </div>
            </div>
            {/* Quiz Modal */}
            {showQuizModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Quiz</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Quiz Type</label>
                                <select
                                    value={quizForm.quiz_type}
                                    onChange={(e) => setQuizForm(prev => ({ ...prev, quiz_type: e.target.value }))}
                                    className="border rounded-md py-2 px-3 text-black w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                >
                                    <option value="reading">Reading Comprehension</option>
                                    <option value="dialogue_reordering">Dialogue Reordering</option>
                                    <option value="translation">Translation</option>
                                    <option value="equivalent">Equivalent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Passage</label>
                                <textarea
                                    value={quizForm.passage}
                                    onChange={(e) => setQuizForm(prev => ({ ...prev, passage: e.target.value }))}
                                    className="border rounded-md py-2 px-3 text-black w-full h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowQuizModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateQuiz}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Question</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Question</label>
                                <textarea
                                    type="text"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Answer</label>
                                <textarea
                                    type="text"
                                    value={questionForm.answer}
                                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Explanation</label>
                                <textarea
                                    type="text"
                                    value={questionForm.explanation}
                                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Quote (optional)</label>
                                <textarea
                                    type="text"
                                    value={questionForm.quote}
                                    onChange={(e) => setQuestionForm({ ...questionForm, quote: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowQuestionModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateQuestion}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Option Modal */}
            {showOptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Option</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Label</label>
                                <textarea
                                    type="text"
                                    value={optionForm.label}
                                    onChange={(e) => setOptionForm({ ...optionForm, label: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-base font-semibold mb-2">Content</label>
                                <textarea
                                    type="text"
                                    value={optionForm.content}
                                    onChange={(e) => setOptionForm({ ...optionForm, content: e.target.value })}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => setShowOptionModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateOption}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Quiz list */}
            <div className="space-y-8">
                {filteredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-lg font-semibold text-gray-800">
                                    {quiz.quiz_type === 'reading' ? quiz.passage : `Quiz Type: ${quiz.quiz_type}`}
                                </div>
                                <div className="text-sm text-gray-500 font-semibold">Type: {quiz.quiz_type || 'reading'}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                    title="Edit Quiz"
                                >
                                    <FiEdit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                    title="Delete Quiz"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {quiz.questions.map((question) => (
                                <div key={question.id} className="border-b border-gray-200 pb-4">
                                    <div className="font-semibold text-gray-800 mb-1">{question.question}</div>
                                    <div className="text-sm text-black mb-1">Answer: <span className="font-semibold text-green-600">{question.answer}</span></div>
                                    <div className="text-sm text-blue-600 mb-1">Explanation: {question.explanation}</div>
                                    {question.quote && <div className="text-sm text-purple-600 mb-1">Quote: {question.quote}</div>}
                                    <div className="flex justify-end gap-4 mt-2">
                                        <button
                                            onClick={() => handleEditQuestion(question)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                            title="Edit Question"
                                        >
                                            <FiEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                            title="Delete Question"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="ml-4 mt-2 space-y-2">
                                        {question.options.map((option) => (
                                            <div key={option.id} className="flex justify-between items-center">
                                                <div className="text-sm text-gray-700 font-medium">{option.label}. {option.content}</div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOption(option)}
                                                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                                        title="Edit Option"
                                                    >
                                                        <FiEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOption(option.id)}
                                                        className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                                        title="Delete Option"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieQuiz;
