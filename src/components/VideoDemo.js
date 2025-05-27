"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Taskbar from './Cus/TaskBar';
import ReactPlayer from 'react-player';
import axios from 'axios';

import { useRouter, useParams } from 'next/navigation';

const BASE_API_URL = "http://localhost:8081/api";

const VideoDemo = () => {
    const router = useRouter();
    const params = useParams();
    const [currentTime, setCurrentTime] = useState(0);
    const [isEngSub, setIsEngSub] = useState(true);
    const [isVietSub, setIsVietSub] = useState(true);
    const [movieUrl, setMovieUrl] = useState('');
    const [englishSubtitles, setEnglishSubtitles] = useState([]);
    const [vietnameseSubtitles, setVietnameseSubtitles] = useState([]);
    const activeSubtitleRef = useRef(null);

    useEffect(() => {
        console.log("movieid", params.movieId);
        if (params?.movieId) {
            fetchMovieDetails();
            fetchSubtitles();
        }
    }, [params]);

    const fetchMovieDetails = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/movies/${params.movieId}`);
            setMovieUrl(response.data.video_url);
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    };

    const fetchSubtitles = async () => {
        try {
            // Fetch English subtitles
            const engResponse = await axios.get(`${BASE_API_URL}/movies/${params.movieId}/subtitles/en`);
            if (engResponse.data && engResponse.data.srt_content) {
                const engSubs = parseSubtitlesFromText(engResponse.data.srt_content);
                setEnglishSubtitles(engSubs);
            }

            // Fetch Vietnamese subtitles
            const vieResponse = await axios.get(`${BASE_API_URL}/movies/${params.movieId}/subtitles/vi`);
            if (vieResponse.data && vieResponse.data.srt_content) {
                const vieSubs = parseSubtitlesFromText(vieResponse.data.srt_content);
                setVietnameseSubtitles(vieSubs);
            }
        } catch (error) {
            console.error("Error fetching subtitles:", error);
        }
    };

    const parseSubtitlesFromText = (subtitleContent) => {
        if (!subtitleContent) return [];

        const blocks = subtitleContent.split(/\n\s*\n/).filter(block => block.trim());

        return blocks.map(block => {
            const lines = block.trim().split('\n');
            if (lines.length < 3) return null;

            const timeLine = lines[1].trim();
            const times = timeLine.split(' --> ');
            if (times.length !== 2) return null;

            const textContent = lines.slice(2).join('\n').trim();

            try {
                const startTime = timeToSeconds(times[0]);
                const endTime = timeToSeconds(times[1]);

                if (isNaN(startTime) || isNaN(endTime)) return null;

                return {
                    startTime: Math.floor(startTime),
                    endTime: Math.floor(endTime),
                    text: textContent
                };
            } catch (error) {
                console.error("Error parsing subtitle block:", error);
                return null;
            }
        }).filter(sub => sub !== null);
    };

    const timeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':');
        const [secs] = seconds.split(','); // Bỏ qua phần mili giây
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs);
    };

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgress = (state) => {
        setCurrentTime(Math.floor(state.playedSeconds)); // Chỉ lấy phần giây
    };

    // Hàm tìm phụ đề phù hợp với thời gian hiện tại
    const findMatchingSubtitle = (subtitles, currentTime) => {
        return subtitles.find(sub =>
            currentTime >= sub.startTime && currentTime <= sub.endTime
        );
    };

    const getCurrentSubtitle = () => {
        let displayText = '';

        // Ưu tiên tìm phụ đề tiếng Việt trước
        if (isVietSub) {
            const currentVieSub = findMatchingSubtitle(vietnameseSubtitles, currentTime);
            if (currentVieSub) {
                displayText += currentVieSub.text;
            }
        }

        // Nếu có phụ đề tiếng Anh và đang bật hiển thị
        if (isEngSub) {
            const currentEngSub = findMatchingSubtitle(englishSubtitles, currentTime);
            console.log("EnglishSub:", currentEngSub);
            if (currentEngSub) {
                displayText += "\n";
                displayText += currentEngSub.text;
            }
        }
        console.log("displayText", displayText);

        return displayText;
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

    return (<div>

        <Taskbar />
        <div className="mx-auto p-5 bg-[#18191a] min-h-[100vh]">
            <div className="grid grid-cols-8 gap-5">
                {/* Video section - 3/5 columns */}
                <div className="col-span-5 flex flex-col gap-4 ">
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg relative">
                        <Suspense fallback={<div>Loading...</div>}>
                            {movieUrl && (
                                <ReactPlayer
                                    //  url={movieUrl}
                                    controls={true}
                                    width="100%"
                                    height="100%"
                                    onProgress={handleProgress}
                                />
                            )}
                        </Suspense>

                        {/* Overlay subtitle */}
                        {getCurrentSubtitle() && (
                            <div className="absolute bottom-0 left-0 mb-[6vh] w-full bg-black/20 p-4 text-white text-lg text-center z-10 ">
                                {getCurrentSubtitle()}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-3">
                        {/* Language buttons */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={toggleBothSubs}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer "
                            >
                                Xem song ngữ
                            </button>
                            <button
                                onClick={toggleEnglishOnly}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer "
                            >
                                Chỉ tiếng Anh
                            </button>
                            <button
                                onClick={toggleVietnameseOnly}
                                className="bg-green-500 text-white px-4 py-2 rounded border-none cursor-pointer"
                            >
                                Chỉ tiếng Việt
                            </button>
                            <button
                                onClick={() => router.push(`/Navigate/user/practicepage/${params.movieId}`)}
                                className="bg-blue-500 text-white px-4 py-2 rounded border-none cursor-pointer "
                            >
                                Luyện tập
                            </button>
                        </div>
                    </div>

                    {/* Current subtitle display */}

                </div>

                {/* Subtitle list - 2/5 columns */}
                <div className="col-span-3 bg-gray-800 rounded-lg flex flex-col p-4 aspect-[32/27]">
                    <h3 className="text-gray-200 m-0 mb-4">Danh sách phụ đề</h3>
                    <div className="flex-1 overflow-y-auto pr-2.5 scrollbar">
                        {vietnameseSubtitles.map((sub, index) => {
                            const isActive = findMatchingSubtitle([sub], currentTime) !== undefined;

                            const engSub = findMatchingSubtitle(englishSubtitles, sub.startTime);
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
                                    {isVietSub && (
                                        <div className="text-sm whitespace-pre-line">
                                            {sub.text}
                                        </div>
                                    )}
                                    {isEngSub && engSub && (
                                        <div className="text-sm whitespace-pre-line">
                                            {engSub.text}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    </div>
    );
};

export default VideoDemo; 