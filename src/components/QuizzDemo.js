// my-app/components/VideoDemo.js
"use client";  // Thêm dòng này ở đầu file
import createQuiz from '../server/openAI.mjs';
import React, { useState, useEffect } from 'react'; // Thêm dòng này
import axios from 'axios';

const BASE_API_URL = "http://localhost:8081/api";
const QuizzDemo = () => {
    // ... code khác ...

    // Thêm state cho quiz
    const [quiz, setQuiz] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState(null);
    const [subtitle, setSubtitle] = useState([]);
    const [dataInput, setDataInput] = useState("");
    // Thêm state cho subtitle test
    useEffect(() => {
        fecthSubTitle();
    }, []);
    const fecthSubTitle = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/movies/1/subtitles`);
            console.log("subtitles ", response.data[0]);
            const englistSubtitle = response.data[0].srt_content;
            console.log("englistSubtitle: ", englistSubtitle);
            parseSubtitlesFromText(englistSubtitle);

        }
        catch (error) {
            console.error("Lỗi không thể lấy subtile từ db:", error);
        }
    }
    const parseSubtitlesFromText = (subtitleContent) => {
        if (typeof subtitleContent !== 'string' || !subtitleContent.trim()) {
            console.error("Subtitle rỗng hoặc không phải chuỗi .");
            setSubtitle([]);
            setDataInput("");
            return;
        }

        const blocks = subtitleContent.trim().split(/^\s*\d+\s*$/m).filter(block => block && block.trim()); // Lọc bỏ các khối rỗng

        const parsedSubtitleTexts = blocks.map((block, index) => {

            const lines = block.trim().split('\n');
            if (!lines || lines.length < 2) {
                return null;
            }
            if (!lines[0].includes('-->')) {
                return null;
            }
            const textContent = lines.slice(1).join('\n').trim();


            return textContent;

        }).filter(text => text !== null && text !== '');
        setSubtitle(parsedSubtitleTexts);
        const combinedTextForInput = parsedSubtitleTexts.join(' ');

        setDataInput(combinedTextForInput);
    };
    // Hàm tạo quiz từ phụ đề hiện tại
    const handleCreateQuiz = async () => {
        // Sử dụng trực tiếp state 'dataInput' vì nó đã chứa chuỗi nối
        const textToUse = dataInput; // Ưu tiên dataInput, nếu rỗng thì dùng testSubtitle

        if (!textToUse) {
            setQuizError("Không có nội dung phụ đề (dataInput) để tạo quiz.");
            return;
        }

        try {
            setQuizLoading(true);
            setQuizError(null);
            const quizData = await createQuiz(textToUse);
            setQuiz(quizData);
        } catch (error) {
            console.error("Lỗi tạo:", error);
            setQuizError(`Lỗi tạo quiz: ${error.message}`);
        } finally {
            setQuizLoading(false);
        }
    };

    return (
        <div className="w-[1800px] mx-auto p-5">
            {/* ... code video player ... */}

            {/* Quiz section */}
            <div className="mt-4">
                <button
                    onClick={handleCreateQuiz}
                    disabled={quizLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    {quizLoading ? 'Đang tạo câu hỏi...' : 'Tạo câu hỏi'}
                </button>

                {quizError && (
                    <div className="text-red-500 mt-2">
                        {quizError}
                    </div>
                )}

                {quiz && (
                    <div className="space-y-6 px-4 py-6">
                        {quiz.map((item, index) => (
                            <div key={index} className="bg-white shadow-md rounded-2xl p-6 space-y-4 border">
                                <h2 className="text-xl font-semibold text-indigo-600">Reading {index + 1}</h2>
                                <p className="text-gray-700 whitespace-pre-line">{item.passage}</p>

                                <div className="space-y-4 mt-4">
                                    {item.questions.map((q, qIndex) => (
                                        <div key={qIndex} className="border-t pt-4">
                                            <p className="font-medium text-gray-800">{qIndex + 1}. {q.question}</p>
                                            <ul className="ml-4 mt-2 space-y-1">
                                                {q.options.map((opt, i) => (
                                                    <li key={i} className={`pl-2 ${opt.startsWith(q.answer) ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                                                        {opt}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p><span className="font-medium">Explanation:</span> {q.explanation}</p>
                                                <p><span className="font-medium">Quote:</span> {q.quote}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizzDemo;