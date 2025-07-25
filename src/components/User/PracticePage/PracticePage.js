"use client"
import React, { useEffect, useState, useRef } from "react";
import TaskBar from "../TaskBar/TaskBar";
import axios from "axios";
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ChatBotBox from "../ChatBot/ChatBot";
import { FiMessageCircle } from "react-icons/fi";

const BASE_API_URL = 'http://localhost:8081/api'; // Đặt URL gốc của API ở đây

const PracticePage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState([]);
    const [movieId, setMovieId] = useState();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [answerResults, setAnswerResults] = useState({});
    const [allQuestions, setAllQuestions] = useState([]); // Lưu tất cả câu hỏi để điều hướng
    const [questionNumberMap, setQuestionNumberMap] = useState({}); // Map để lưu số thứ tự của câu hỏi
    const [selectedQuizType, setSelectedQuizType] = useState('all'); // Thêm state cho loại quiz
    const [isViewResult, setIsViewResult] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        // Có 2 trường hợp nhảy vào trang PracticePage
        // Trường hợp 1: Từ trang HistoryPracticePage vào để chi tiết bài kiểm tra cũ
        // Trường hợp 2: Từ phim vào để làm bài tập
        if (searchParams.get('viewResult') === '1') {
            // Trường hợp 1: Từ trang HistoryPracticePage vào để chi tiết bài kiểm tra cũ
            setIsViewResult(true);
            const result = JSON.parse(localStorage.getItem('practiceResultView'));
            if (result) {
                console.log("call----------------------------");
                setMovieId(result.movieId);
                setSelectedAnswers(result.answers || {});
                setScore(result.score || 0);
                setShowScore(true);
                setShowAnswers(true);
                // Tính đúng/sai cho từng câu
                const res = {};
                if (result.quizzes) {
                    result.quizzes.forEach(quiz => {
                        quiz.questions.forEach(question => {
                            const selectedOption = result.answers?.[question.id];
                            const selectedOptionLabel = question.options.find(opt => opt.id === selectedOption)?.label;
                            const isCorrect = selectedOptionLabel && selectedOptionLabel.toLowerCase() === question.answer.toLowerCase();
                            res[question.id] = {
                                isCorrect,
                                selectedOption: selectedOptionLabel
                            };
                        });
                    });
                }
                setAnswerResults(res);
                setQuizzes(result.quizzes || []);
                // Tạo mảng tất cả câu hỏi để điều hướng
                const allQuestions = result.quizzes.flatMap(quiz => quiz.questions);
                setAllQuestions(allQuestions);

                // Tạo map số thứ tự cho tất cả câu hỏi
                const numberMap = {};
                allQuestions.forEach((question, index) => {
                    numberMap[question.id] = index + 1;
                });
                setQuestionNumberMap(numberMap);
            }
        } else {
            // Trường hợp 2: Từ phim vào để làm bài tập
            console.log("movieid", params.movieId);
            if (params?.movieId) {
                setMovieId(params.movieId);
                console.log("movieid", params.movieId);
                fetchMovieQuizzes();
            }
        }
    }, [params, searchParams]);

    useEffect(() => {
        if (!showScore) {
            // tăng biến elapsedTime lên 1 sau mỗi giây
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            // Xóa  elapsedTime
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [showScore]);

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
            // Tạo mảng tất cả câu hỏi để điều hướng ( làm phảng mảng question trong  quizzesWithQuestion)
            const allQuestions = quizzesWithQuestions.flatMap(quiz => quiz.questions);
            setAllQuestions(allQuestions);

            // Tạo map số thứ tự cho tất cả câu hỏi
            const numberMap = {};
            allQuestions.forEach((question, index) => {
                numberMap[question.id] = index + 1;
            });
            setQuestionNumberMap(numberMap);

        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleAnswerSelect = (questionId, optionId) => {
        // Thêm vào cuối đối tượng SelectedAnswers
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionId // key questionID động cho value optionID
        }));
    };

    const calculateScore = () => {
        let totalCorrect = 0;
        let totalQuestions = 0;
        const results = {};

        quizzes.forEach(quiz => {
            quiz.questions.forEach(question => {
                totalQuestions++;
                const selectedOption = selectedAnswers[question.id]; // selectedOption = id của option
                if (selectedOption) {
                    const selectedOptionLabel = question.options.find(opt => opt.id === selectedOption)?.label; // lấy label A B C D
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
        // Lưu vào lịch sử sau khi nộp bài
        if (movieId) {
            const oldHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
            const newRecord = {
                movieId,
                answers: selectedAnswers,
                score: finalScore,
                totalCorrect,
                totalWrong: totalQuestions - totalCorrect,
                totalQuestions,
                time: Date.now(),
                quizzes,
            };
            localStorage.setItem('practiceHistory', JSON.stringify([...oldHistory, newRecord]));
        }
    };

    const handleRetakeQuiz = () => {
        setSelectedAnswers({});
        setShowScore(false);
        setScore(0);
        setShowAnswers(false);
        setAnswerResults({});
        setElapsedTime(0);
    };

    const scrollToQuestion = (questionId) => {
        const element = document.getElementById(`question-${questionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const filteredQuizzes = selectedQuizType === 'all'
        ? quizzes
        : quizzes.filter(quiz => quiz.quiz_type === selectedQuizType);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="top-0 fixed w-[100vw] z-30">
                <TaskBar />
            </div>

            <div className="flex">
                {/* Main Content - 80% width */}
                <div className="w-4/5 p-8">
                    <div className=" mx-auto">
                        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Practice Quiz</h1>
                        {/* Filter dropdown */}
                        <div className="flex items-center space-x-4 my-10">
                            <label className="text-xl font-bold font-medium text-gray-700">Filter by type:</label>
                            <select
                                value={selectedQuizType}
                                onChange={(e) => setSelectedQuizType(e.target.value)}
                                className="rounded-md  font-bold  text-xl border-gray-300 shadow-sm text-black"
                            >
                                <option value="all">All Types</option>
                                <option value="reading">Reading Comprehension</option>
                                <option value="dialogue_reordering">Dialogue Reordering</option>
                                <option value="translation">Translation</option>
                                <option value="equivalent">Equivalent</option>
                            </select>
                        </div>
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
                                <div className="text-xl text-gray-800 font-semibold mb-6 leading-relaxed">
                                    {quiz.passage}
                                </div>
                                <div className="space-y-8">
                                    {
                                        quiz.questions.map((question) => (
                                            <div
                                                key={question.id}
                                                id={`question-${question.id}`}
                                                className={`relative border border-gray-200 rounded-lg p-6 transition-all duration-200 ${showAnswers
                                                    ? answerResults[question.id]?.isCorrect
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-red-50 border-red-200'
                                                    : 'hover:border-blue-200 hover:shadow-md'
                                                    }`}
                                            >
                                                {/* Question Number Badge - Moved to left side */}
                                                <div className="absolute -top-3 -left-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                                                    {questionNumberMap[question.id]}
                                                </div>

                                                <div className="font-semibold text-lg text-gray-800 mb-4">
                                                    {question.question}
                                                </div>
                                                <div className="ml-4 space-y-3">
                                                    {question.options.map((option) => (
                                                        <div
                                                            key={option.id}
                                                            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${showAnswers
                                                                ? option.label.toLowerCase() === question.answer.toLowerCase()
                                                                    ? 'bg-green-100 border-green-300'
                                                                    : selectedAnswers[question.id] === option.id && !answerResults[question.id]?.isCorrect
                                                                        ? 'bg-red-100 border-red-300'
                                                                        : 'bg-gray-50'
                                                                : selectedAnswers[question.id] === option.id
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'bg-gray-50 hover:bg-gray-100'
                                                                } border`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                id={`option-${option.id}`}
                                                                name={`question-${question.id}`}
                                                                value={option.id}
                                                                onChange={() => handleAnswerSelect(question.id, option.id)}
                                                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <label
                                                                htmlFor={`option-${option.id}`}
                                                                className="flex-1 text-gray-700 cursor-pointer"
                                                            >
                                                                <span className="font-medium">{option.label}.</span> {option.content}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                {showAnswers && (
                                                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-semibold text-green-600">Correct Answer:</span> {question.answer.toUpperCase()}
                                                        </p>
                                                        {question.explanation && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                <span className="font-semibold text-blue-600">Explanation:</span> {question.explanation}
                                                            </p>
                                                        )}
                                                        {question.quote && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                <span className="font-semibold text-purple-600">Quote:</span> {question.quote}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Panel - 20% width */}
                <div className="w-1/5 fixed top-16 right-0 h-[calc(85vh-64px)] bg-white border-l border-gray-200 flex flex-col p-6 z-20">
                    {/* Tiêu đề luôn hiển thị */}
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex-shrink-0">Question Navigation</h3>
                    {/* Thời gian làm bài */}
                    <div className="mb-4 text-base text-gray-700 font-semibold flex items-center gap-2">
                        <span>⏱️ Thời gian:</span> <span className="font-mono">{formatTime(elapsedTime)}</span>
                    </div>
                    {/* Nội dung cuộn được */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {allQuestions.map((question, index) => (
                                <button
                                    key={question.id}
                                    onClick={() => scrollToQuestion(question.id)}
                                    className={`p-3 rounded-lg text-center font-medium transition-all duration-200 ${showAnswers
                                        ? answerResults[question.id]?.isCorrect
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        : selectedAnswers[question.id]
                                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        {showScore && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <h4 className="font-semibold text-gray-800 mb-2">Your Score</h4>
                                <p className="text-3xl font-bold text-blue-600">{score.toFixed(1)}%</p>
                            </div>
                        )}
                    </div>
                    {/* Nút Submit/Retake luôn ở dưới */}
                    <div className="space-y-3 mt-6 flex-shrink-0">
                        {!showScore && (
                            <button onClick={calculateScore} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md">Submit Quiz</button>
                        )}
                        {showScore && (
                            <button onClick={handleRetakeQuiz} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md">Retake Quiz</button>
                        )}
                    </div>
                </div>

            </div>

            {/* Chatbox floating */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {!showChat ? (
                    <button
                        onClick={() => setShowChat(true)}
                        className="bg-gray-800 hover:bg-black-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 justify-center"
                        aria-label="Open chat"
                    >
                        <FiMessageCircle className="text-2xl" />
                        <span className="font-semibold text-base">Chatbot AI</span>
                    </button>
                ) : (
                    <ChatBotBox onClose={() => setShowChat(false)} context={quizzes} />
                )}
            </div>

        </div>
    );
};

export default PracticePage;