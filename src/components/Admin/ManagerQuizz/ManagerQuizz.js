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
        <div className=" mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Movie Quizzes</h1>

                {/* Filter dropdown */}
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Filter by type:</label>
                    <select
                        value={selectedQuizType}
                        onChange={(e) => setSelectedQuizType(e.target.value)}
                        className="rounded-md border-gray-300 shadow-sm text-black"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3">
                        <h2 className="text-xl font-semibold mb-4 text-black">Edit Quiz</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Quiz Type</label>
                                <select
                                    value={quizForm.quiz_type}
                                    onChange={(e) => {
                                        console.log("Selected quiz type:", e.target.value); // Debug log
                                        setQuizForm(prev => ({
                                            ...prev,
                                            quiz_type: e.target.value
                                        }));
                                    }}
                                    className="border rounded py-2 px-3 text-black leading-tight w-full"
                                >
                                    <option value="reading">Reading Comprehension</option>
                                    <option value="dialogue_reordering">Dialogue Reordering</option>
                                    <option value="translation">Translation</option>
                                    <option value="equivalent">Equivalent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Passage</label>
                                <textarea
                                    value={quizForm.passage}
                                    onChange={(e) => setQuizForm(prev => ({
                                        ...prev,
                                        passage: e.target.value
                                    }))}
                                    className="border rounded py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline w-full h-32 resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowQuizModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateQuiz}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3">
                        <h2 className="text-xl font-semibold mb-4 text-black">Edit Question</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Question</label>
                                <textarea
                                    type="text"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Answer</label>
                                <textarea
                                    type="text"
                                    value={questionForm.answer}
                                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Explanation</label>
                                <textarea
                                    type="text"
                                    value={questionForm.explanation}
                                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Quote (optional)</label>
                                <textarea
                                    type="text"
                                    value={questionForm.quote}
                                    onChange={(e) => setQuestionForm({ ...questionForm, quote: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowQuestionModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateQuestion}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Option Modal */}
            {showOptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3">
                        <h2 className="text-xl font-semibold mb-4 text-black">Edit Option</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Label</label>
                                <textarea
                                    type="text"
                                    value={optionForm.label}
                                    onChange={(e) => setOptionForm({ ...optionForm, label: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-black text-sm font-bold mb-2">Content</label>
                                <textarea
                                    type="text"
                                    value={optionForm.content}
                                    onChange={(e) => setOptionForm({ ...optionForm, content: e.target.value })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowOptionModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateOption}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz list */}
            <div className="space-y-6">
                {filteredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-lg font-semibold text-black">
                                    {quiz.quiz_type === 'reading' ? quiz.passage : `Quiz Type: ${quiz.quiz_type}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Type: {quiz.quiz_type || 'reading'}
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    <FiEdit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FiTrash2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Questions list */}
                        <div className="space-y-4">
                            {quiz.questions.map((question) => (
                                <div key={question.id} className="border-b border-gray-300 pb-4">
                                    <div className="font-semibold text-black">{question.question}</div>
                                    <div className="text-sm text-black">Answer: {question.answer}</div>
                                    <div className="text-sm text-black">Explanation: {question.explanation}</div>
                                    {question.quote && <div className="text-sm text-black">Quote: {question.quote}</div>}
                                    <div className="flex justify-end space-x-4 mt-2">
                                        <button
                                            onClick={() => handleEditQuestion(question)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Options list */}
                                    <div className="ml-4 mt-2 space-y-2">
                                        {question.options.map((option) => (
                                            <div key={option.id} className="flex justify-between items-center">
                                                <div className="text-sm text-black">{option.label}. {option.content}</div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditOption(option)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOption(option.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
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
