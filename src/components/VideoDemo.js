"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';

const BASE_API_URL = "http://localhost:8081/api";
const VideoDemo = () => {
    const [currentTime, setCurrentTime] = useState(0);
    const [subtitles, setSubtitles] = useState([]);
    const [addTime, setAddTime] = useState();
    const [isEngSub, setIsEngSub] = useState(true);
    const [isVietSub, setIsVietSub] = useState(true);
    const activeSubtitleRef = useRef(null);


    useEffect(() => {
        fecthSubTitle();
        setAddTime(14 * 60 + 14);
    }, []);

    const fecthSubTitle = async () => {
        try {
            // router.get('/api/movies/:movie_id/subtitles', subController.getMovieSubtitles);

            const response = await axios.get(`${BASE_API_URL}/movies/1/subtitles`);
            console.log("subtitles ", response.data[0]);
            const englistSubtitle = response.data[0].srt_content;
            console.log("englistSubtitle: ", englistSubtitle);
            parseSubtitlesFromText(englistSubtitle);

        }
        catch (error) {
            console.error("Error fetching subtitles:", error);
        }
    }
    const parseSubtitlesFromText = (subtitleContent) => {
        //  console.log("parsedSubtitles: ", parsedSubtitles);

        const blocks = subtitleContent.split(/^\d+$/m).filter(block => block.trim());
        // console.log("blocks: ", blocks);
        const parsedSubtitles = blocks.map((block, index) => {
            console.log(`--- Processing Block ${index} ---`);
            console.log("Block content:", JSON.stringify(block));
            const lines = block.trim().split('\n');
            console.log("Lines:", lines);

            if (!lines || lines.length < 2) { // Cần ít nhất 2 dòng (time + text)
                console.error("Malformed block (too few lines):", block);
                return null; // Bỏ qua khối lỗi này
            }

            const timeLine = lines[0].trim();
            console.log("Time Line:", timeLine);

            const times = timeLine.split(' --> ');
            console.log("Times array:", times);

            if (!times || times.length !== 2) {
                console.error("Malformed time line:", timeLine);
                return null; // Bỏ qua khối lỗi này
            }

            const textContent = lines.slice(1).join('\n').trim();
            console.log("Text Content:", textContent);

            try {
                const startTime = timeToSeconds(times[0]);
                const endTime = timeToSeconds(times[1]);

                // Kiểm tra kết quả của timeToSeconds
                if (isNaN(startTime) || isNaN(endTime)) {
                    console.error("Invalid time format resulted in NaN:", times);
                    return null; // Bỏ qua khối lỗi này
                }

                return { startTime, endTime, text: textContent };
            } catch (timeError) {
                console.error("Error in timeToSeconds for block:", block, timeError);
                return null; // Bỏ qua khối lỗi này
            }
        }).filter(sub => sub !== null); // Lọc bỏ các kết quả null do lỗi
        //  console.log("parsedSubtitles: ", parsedSubtitles);
        setSubtitles(parsedSubtitles);
    };

    // Hàm chuyển đổi thời gian
    const timeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':');
        const [secs, ms] = seconds.split(',');
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms) / 1000;
    };

    // Format thời gian hiển thị
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Xử lý file SRT
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const blocks = content.split(/^\d+$/m).filter(block => block.trim());

                const parsedSubtitles = blocks.map(block => {
                    const lines = block.trim().split('\n');
                    const timeLine = lines[0].trim();
                    const times = timeLine.split(' --> ');
                    const textContent = lines.slice(1).join('\n').trim();

                    return {
                        startTime: timeToSeconds(times[0]),
                        endTime: timeToSeconds(times[1]),
                        text: textContent
                    };
                });
                setSubtitles(parsedSubtitles);
            };
            reader.readAsText(file);
        }
    };

    const handleProgress = (state) => {
        setCurrentTime(state.playedSeconds + addTime);
        //  console.log("currentTime: ", currentTime + addTime);
    };

    const getCurrentSubtitle = () => {
        return subtitles.find(sub =>
            currentTime >= sub.startTime &&
            currentTime <= sub.endTime
        );
    };

    const toggleBothSubs = () => {
        setIsEngSub(true);
        setIsVietSub(true);
    };

    const toggleEnglishOnly = () => {
        setIsEngSub(true);
        setIsVietSub(false);
    };

    const toggleVietnameseOnly = () => {
        setIsEngSub(false);
        setIsVietSub(true);
    };

    useEffect(() => {
        if (activeSubtitleRef.current) {
            activeSubtitleRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [currentTime]);

    return (
        <div className="w-[1800px] mx-auto p-5">
            <div className="grid grid-cols-5 gap-5">
                {/* Video section - 3/5 columns */}
                <div className="col-span-3 flex flex-col gap-4">

                    { /* aspect-video tính chiều cao dựa trên chiều rộng theo tỉ lệ 16:9 và chiều rộng là col-span-3 60% parent*/}
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                        <ReactPlayer
                            url="https://www.youtube.com/watch?v=n0vWLQy8fE4"
                            controls={true}
                            width="100%"
                            height="100%"
                            onProgress={handleProgress}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-3">
                        {/* Upload button */}
                        <div className="flex justify-center">
                            <label className="bg-blue-500 text-white px-6 py-3 rounded cursor-pointer transition-all duration-300 hover:bg-blue-600">
                                <input
                                    type="file"
                                    accept=".srt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                Tải lên file phụ đề
                            </label>
                        </div>

                        {/* Language buttons */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={toggleBothSubs}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5"
                            >
                                Xem song ngữ
                            </button>
                            <button
                                onClick={toggleEnglishOnly}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5"
                            >
                                Chỉ tiếng Anh
                            </button>
                            <button
                                onClick={toggleVietnameseOnly}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5"
                            >
                                Chỉ tiếng Việt
                            </button>
                        </div>
                    </div>

                    {/* Current subtitle display */}
                    <div className="bg-black/80 p-5 rounded-lg min-h-[60px] flex items-center justify-center">
                        {getCurrentSubtitle() && (
                            <div className="text-white text-lg text-center whitespace-pre-line">
                                {getCurrentSubtitle().text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtitle list - 2/5 columns */}
                <div className="col-span-2 bg-gray-800 rounded-lg flex flex-col p-4 aspect-[32/27]">
                    <h3 className="text-gray-200 m-0 mb-4">Danh sách phụ đề</h3>
                    <div className="flex-1 overflow-y-auto pr-2.5 scrollbar">
                        {subtitles.map((sub, index) => {
                            const isActive = currentTime >= sub.startTime && currentTime <= sub.endTime;
                            return (
                                <div
                                    key={index}
                                    ref={isActive ? activeSubtitleRef : null}
                                    className={`p-2.5 border-b border-gray-700 transition-all duration-300 ${isActive
                                        ? 'bg-green-500 text-white rounded'
                                        : 'text-gray-300'
                                        }`}
                                >
                                    <div className="text-xs opacity-80 mb-1">
                                        {formatTime(sub.startTime)}
                                    </div>
                                    <div className="text-sm whitespace-pre-line">
                                        {sub.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDemo; 