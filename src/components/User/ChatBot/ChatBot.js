"use client";

import React, { useState, useRef, useEffect } from "react";
import sendMessageToGemini from "../../../service/GeminiChatBox"; // đổi đúng path nếu cần

const ChatBotBox = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

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
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-white  shadow-xl rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
                💬 AI Chat Assistant
            </h2>

            <div className="h-[400px] overflow-y-auto px-4 py-2 bg-gray-50 rounded-lg space-y-2">
                {chat.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${item.role === "user"
                                ? "bg-blue-500 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 rounded-bl-none"
                                }`}
                        >
                            {item.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div className="mt-4 flex gap-2">
                <textarea
                    rows={1}
                    className="flex-1 resize-none border border-gray-300 text-black rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className={`px-4 py-2 rounded-lg transition text-black ${loading || !message.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default ChatBotBox;
