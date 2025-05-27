"use client"
import React, { useEffect, useState } from "react";
import TaskBar from "../TaskBar";
import axios from "axios";
import { useParams } from 'next/navigation';

const BASE_API_URL = 'http://localhost:8081/api'; // Đặt URL gốc của API ở đây

const PracticePage = () => {
    const params = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [movieId, setMovieId] = useState();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [answerResults, setAnswerResults] = useState({});

    useEffect(() => {
        console.log("movieid", params.movieId);
        if (params?.movieId) {
            setMovieId(params.movieId);
            console.log("movieid", params.movieId);
            fetchMovieQuizzes();
        }
    }, [params]);

    const fetchMovieQuizzes = async () => {
        try {
            const quizzesResponse = await axios.get(`${BASE_API_URL}/quizzes/movie/${params.movieId}`);
            const quizzesData = quizzesResponse.data;

            const quizzesWithQuestions = await Promise.all(
                quizzesData.map(async (quiz) => {
                    const questionsResponse = await axios.get(`${BASE_API_URL}/questions/quiz/${quiz.id}`);
                    const questions = questionsResponse.data;

                    const questionsWithOptions = await Promise.all(
                        questions.map(async (question) => {
                            const optionsResponse = await axios.get(`${BASE_API_URL}/options/question/${question.id}`);
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

        } catch (err) {

            console.error('Error:', err);

        }
    };

    const handleAnswerSelect = (questionId, optionId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionId
        }));
    };

    const calculateScore = () => {
        let totalCorrect = 0;
        let totalQuestions = 0;
        const results = {};

        quizzes.forEach(quiz => {
            quiz.questions.forEach(question => {
                totalQuestions++;
                const selectedOption = selectedAnswers[question.id];
                if (selectedOption) {
                    const selectedOptionLabel = question.options.find(opt => opt.id === selectedOption)?.label;
                    const isCorrect = selectedOptionLabel && selectedOptionLabel.toLowerCase() === question.answer.toLowerCase();
                    results[question.id] = {
                        isCorrect,
                        selectedOption: selectedOptionLabel
                    };
                    if (isCorrect) {
                        totalCorrect++;
                    }
                }
            });
        });

        const finalScore = (totalCorrect / totalQuestions) * 100;
        setScore(finalScore);
        setShowScore(true);
        setShowAnswers(true);
        setAnswerResults(results);
    };

    const handleRetakeQuiz = () => {
        setSelectedAnswers({});
        setShowScore(false);
        setScore(0);
        setShowAnswers(false);
        setAnswerResults({});
    };

    return (
        <div>
            <TaskBar></TaskBar>
            <div className="space-y-6">
                <p className="text-3xl font-bold text-gray-800 text-center">Practice</p>
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="text-lg text-black font-semibold">{quiz.passage}</div>
                        <div className="space-y-4">
                            {quiz.questions.map((question) => (
                                <div key={question.id} className={`border-b border-gray-300 text-black pb-4 ${showAnswers ? (answerResults[question.id]?.isCorrect ? 'bg-green-50' : 'bg-red-50') : ''}`}>
                                    <div className="font-semibold">{question.question}</div>
                                    <div className="ml-4 mt-2 space-y-2">
                                        {question.options.map((option) => (
                                            <div key={option.id} className={`flex items-center space-x-2 p-2 rounded ${showAnswers && option.label.toLowerCase() === question.answer.toLowerCase()
                                                ? 'bg-green-100'
                                                : showAnswers && selectedAnswers[question.id] === option.id && !answerResults[question.id]?.isCorrect
                                                    ? 'bg-red-100'
                                                    : ''
                                                }`}>
                                                <input
                                                    type="radio"
                                                    id={`option-${option.id}`}
                                                    name={`question-${question.id}`}
                                                    value={option.id}
                                                    onChange={() => handleAnswerSelect(question.id, option.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <label
                                                    htmlFor={`option-${option.id}`}
                                                    className="text-sm text-gray-700 cursor-pointer"
                                                >
                                                    {option.label}. {option.content}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {showAnswers && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Correct Answer:</span> {question.answer.toUpperCase()}
                                            </p>
                                            {question.explanation && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-semibold">Explanation:</span> {question.explanation}
                                                </p>
                                            )}
                                            {question.quote && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-semibold">Quote:</span> {question.quote}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={calculateScore}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Submit Quiz
                    </button>
                    {showScore && (
                        <button
                            onClick={handleRetakeQuiz}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Retake Quiz
                        </button>
                    )}
                </div>

                {showScore && (
                    <div className="text-center mt-4 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Your Score</h2>
                        <p className="text-xl text-blue-600 mt-2">{score.toFixed(1)}%</p>
                    </div>
                )}
            </div>
        </div>
    )
}
export default PracticePage;