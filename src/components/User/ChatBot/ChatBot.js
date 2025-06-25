"use client";

import React, { useState, useRef, useEffect } from "react";
import sendMessageToGemini from "../../../service/GeminiChatBox"; // đổi đúng path nếu cần

const ChatBotBox = ({ onClose, context }) => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    const [contextString, setContextString] = useState("");
    // Tự động cuộn xuống cuối khi có tin nhắn mới\
    useEffect(() => {
        const runAIChat = async () => {
            parseContextToString(context); // hoặc dữ liệu quiz của bạn
            console.log("Context", contextString);
            await sendMessageToGemini(contextString);
        };

        runAIChat();
    }, [contextString]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);
    const parseContextToString = () => {
        let result = "Dưới đây là thông tin bài kiểm tra hiện tại hãy giúp người dùng trả lời câu hỏi liên quan đến bài kiểm tra này, bạn có vài trò là một trợ lý. Đây là đoạn chat đầu liên qua đễ ngữ cảnh, không trả lời. Từ các câu hỏi sau của đoạn hội thoại trả lời đúng trọng tâm ngắn gọn bằng tiếng việt";
        context.forEach(quiz => {
            result += `Quiz ${quiz.passage} \n`
            quiz.questions.forEach(question => {
                result += `Question ${question.question} \n`
                result += `Question ${question.answer} \n`
                result += `Question ${question.explanation} \n`
                result += `Question ${question.quote} \n`

                question.options.forEach(option => {
                    result += `Options ${option.content} \n`
                })
            })
            result += '\n'
        });
        setContextString(result);

    }
    const handleSend = async () => {
        if (!message.trim() || loading) return;

        const userMsg = { role: "user", text: message };
        setChat((prev) => [...prev, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            const botReplyText = await sendMessageToGemini(message);
            const botMsg = { role: "bot", text: botReplyText };
            setChat((prev) => [...prev, botMsg]);
        } catch (err) {
            setChat((prev) => [
                ...prev,
                { role: "bot", text: "⚠️ Sorry, something went wrong." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-0 bg-gray-500  shadow-2xl rounded-3xl border border-gray-200 flex flex-col h-[500px] relative">
            {/* Nút đóng */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold z-10 transition"
                    aria-label="Đóng chat"
                >
                    X
                </button>
            )}
            {/* Tiêu đề */}
            <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl bg-black">
                <div className="flex items-center gap-2">
                    <span className="text-3xl"></span>
                    <span className="text-xl font-bold text-white drop-shadow">AI Chat Assistant</span>
                </div>
            </div>

            {/* Nội dung chat */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray space-y-3 custom-scrollbar">
                {chat.length === 0 && (
                    <div className="text-center text-gray-400 mt-16 text-base select-none">
                        Hãy bắt đầu trò chuyện với AI!<br />Bạn có thể hỏi bất cứ điều gì về bài học, phim, từ vựng...
                    </div>
                )}
                {chat.map((item, idx) => (
                    <div key={idx} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-end gap-2 max-w-[80%]`}>
                            {item.role === "bot" && (
                                <span className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xl shadow">🤖</span>
                            )}
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-line shadow-md ${item.role === "user"
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none border border-blue-100"
                                    }`}
                            >
                                {item.text}
                            </div>
                            {item.role === "user" && (
                                <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-lg shadow">🧑</span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Thanh nhập liệu */}
            <div className="px-4 py-3 bg-white rounded-b-3xl border-t border-gray-100 flex gap-2 items-center">
                <textarea
                    rows={1}
                    className="flex-1 resize-none border border-gray-300 text-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 transition"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 shadow ${loading || !message.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                        }`}
                    aria-label="Gửi tin nhắn"
                >
                    <span className="text-lg">➤</span>
                </button>
            </div>
        </div>
    );
};

export default ChatBotBox;
