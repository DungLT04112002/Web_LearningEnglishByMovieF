"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Taskbar from '../TaskBar/TaskBar';
import ReactPlayer from 'react-player';
import axios from 'axios';
import LikeButton from '../LikeButton/LikeButton';

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
    const [movieDetails, setMovieDetails] = useState(null);
    const [relatedMovies, setRelatedMovies] = useState([]);
    const activeSubtitleRef = useRef(null);
    const videoContainerRef = useRef(null);
    const [videoHeight, setVideoHeight] = useState(0);

    useEffect(() => {
        console.log("movieid", params.movieId);
        if (params?.movieId) {
            fetchMovieDetails();
            fetchSubtitles();
        }
    }, [params]);

    useEffect(() => {
        if (videoContainerRef.current) {
            setVideoHeight(videoContainerRef.current.clientHeight);
        }
    }, [movieDetails]);

    const fetchMovieDetails = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/movies/${params.movieId}`);
            setMovieUrl(response.data.video_url);
            setMovieDetails(response.data);
            if (response.data?.difficulty) {
                fetchRelatedMovies(response.data.difficulty, response.data.id);
            }
        } catch (error) {
            console.error("Error fetching movie details:", error);
            setMovieDetails(null);
        }
    };

    const fetchRelatedMovies = async (currentMovieDifficulty, currentMovieId) => {
        try {
            const response = await axios.get(`${BASE_API_URL}/movies`);

            if (response.data) {
                const filteredRelated = response.data.filter(movie =>
                    movie.difficulty === currentMovieDifficulty && movie.id !== currentMovieId
                );
                setRelatedMovies(filteredRelated);
            } else {
                setRelatedMovies([]);
            }
        } catch (error) {
            console.error("Error fetching related movies:", error);
            setRelatedMovies([]);
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

        // Display English subtitles first
        if (isEngSub) {
            const currentEngSub = findMatchingSubtitle(englishSubtitles, currentTime);
            if (currentEngSub) {
                displayText = currentEngSub.text;
            }
        }

        // Then display Vietnamese subtitles on the next line
        if (isVietSub) {
            const currentVieSub = findMatchingSubtitle(vietnameseSubtitles, currentTime);
            if (currentVieSub) {
                if (displayText) {
                    displayText += '\n' + currentVieSub.text;
                } else {
                    displayText = currentVieSub.text;
                }
            }
        }

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
                block: "start",
                inline: "nearest"
            });
        }
    }, [currentTime]);

    const activeEngIndex = englishSubtitles.findIndex(
        sub => currentTime >= sub.startTime && currentTime <= sub.endTime
    );

    const currentEngSub = englishSubtitles[activeEngIndex];
    const currentVieSub = currentEngSub
        ? vietnameseSubtitles.find(
            sub => currentEngSub.startTime >= sub.startTime && currentEngSub.startTime <= sub.endTime
        )
        : null;

    return (<div>
        <Taskbar />
        {/* Main content area */}
        <div className="w-full px-6 py-6 bg-gray-900 text-gray-200 min-h-screen">
            {/* Grid layout for main sections */}
            <div className="grid grid-cols-1 md:grid-cols-8 gap-6">

                {/* Left Column: Video, Controls, Movie Details */}
                <div className="md:col-span-5 flex flex-col gap-6">
                    {/* Movie Title */}
                    {movieDetails?.title && (
                        <h2 className="text-gray-100 text-3xl font-bold mb-4">{movieDetails.title}</h2>
                    )}

                    {/* Video Container */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-xl relative" ref={videoContainerRef}>
                        <Suspense fallback={<div>Loading...</div>}>
                            {movieUrl && (
                                <ReactPlayer
                                    url={movieUrl}
                                    controls={true}
                                    width="100%"
                                    height="100%"
                                    onProgress={handleProgress}
                                />
                            )}
                        </Suspense>

                        {/* Overlay subtitle */}
                        {getCurrentSubtitle() && (
                            <div className="absolute bottom-0 left-0 mb-[6vh] w-full bg-black bg-opacity-50 p-4 text-white text-xl text-center z-10">
                                {isEngSub && findMatchingSubtitle(englishSubtitles, currentTime) && (
                                    <div className="mb-2">
                                        {findMatchingSubtitle(englishSubtitles, currentTime).text}
                                    </div>
                                )}
                                {isVietSub && findMatchingSubtitle(vietnameseSubtitles, currentTime) && (
                                    <div>
                                        {findMatchingSubtitle(vietnameseSubtitles, currentTime).text}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={toggleBothSubs}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                        >
                            Xem song ngữ
                        </button>
                        <button
                            onClick={toggleEnglishOnly}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                        >
                            Chỉ tiếng Anh
                        </button>
                        <button
                            onClick={toggleVietnameseOnly}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                        >
                            Chỉ tiếng Việt
                        </button>
                        <button
                            onClick={() => router.push(`/Navigate/user/practicepage/${params.movieId}`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                        >
                            Luyện tập
                        </button>
                        <LikeButton
                            movieId={params.movieId}
                            size={20}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                        />
                    </div>

                    {/* Movie Details */}
                    {movieDetails && (
                        <div className="flex flex-col md:flex-row gap-6 mt-4 p-5 bg-gray-800 rounded-lg shadow-md">
                            <div className="flex-shrink-0 flex justify-center">
                                {movieDetails.thumbnail_url && (
                                    <img src={movieDetails.thumbnail_url} alt={movieDetails.title || 'Movie Poster'} className="w-40 h-60 object-cover rounded shadow-lg" />
                                )}
                            </div>
                            <div className="flex-1 text-gray-300">
                                <h4 className="text-gray-100 text-2xl font-semibold mb-3">Thông tin phim</h4>
                                <p className="text-base mb-2"><strong>Độ khó:</strong> {movieDetails.difficulty}</p>
                                <p className="text-base mb-2"><strong>Thể loại:</strong> {movieDetails.genre}</p>
                                <p className="text-base whitespace-pre-line leading-relaxed"><strong>Mô tả:</strong> {movieDetails.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Subtitle List, Related Movies */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    {/* Subtitle list */}
                    <div className="bg-gray-800 rounded-lg shadow-md flex flex-col p-5 overflow-hidden" style={{ height: videoHeight > 0 ? videoHeight : 'auto' }}>
                        <h3 className="text-gray-100 text-xl font-semibold mb-4">Danh sách phụ đề</h3>
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            {englishSubtitles.map((engSub, index) => {
                                const isActive = index === activeEngIndex;
                                const vieSub = findMatchingSubtitle(vietnameseSubtitles, engSub.startTime);
                                return (
                                    <div
                                        key={index}
                                        ref={isActive ? activeSubtitleRef : null}
                                        className={`p-3 border-b border-gray-700 transition-all duration-300 ${isActive
                                            ? 'bg-green-700 text-white rounded-md'
                                            : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="text-l opacity-70 mb-1">
                                            {formatTime(engSub.startTime)}
                                        </div>
                                        {isEngSub && (
                                            <div className="text-xl text-orange-200 whitespace-pre-line">
                                                {engSub.text}
                                            </div>
                                        )}
                                        {isVietSub && vieSub && (
                                            <div className="text-l whitespace-pre-line">
                                                {vieSub.text}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Related Movies List */}
                    {relatedMovies.length > 0 && (
                        <div className="bg-gray-800 rounded-lg shadow-md p-5 flex flex-col">
                            <h4 className="text-gray-100 text-xl font-semibold mb-4">Phim cùng độ khó</h4>
                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ maxHeight: '500px' }}> {/* Adjust max-height as needed */}
                                <div className="flex flex-col gap-4">
                                    {relatedMovies.map(relatedMovie => (
                                        <div
                                            key={relatedMovie.id}
                                            className="flex items-center gap-4 cursor-pointer p-3 hover:bg-gray-700 rounded-md transition duration-300 ease-in-out"
                                            onClick={() => router.push(`/Navigate/user/watchmovie/${relatedMovie.id}`)}
                                        >
                                            {relatedMovie.thumbnail_url && (
                                                <img src={relatedMovie.thumbnail_url} alt={relatedMovie.title || 'Movie Poster'} className="w-20 h-30 object-cover rounded" />
                                            )}
                                            <div className="flex-1 text-gray-300">
                                                <p className="text-base font-medium">{relatedMovie.title}</p>
                                                <p className="text-sm opacity-80">Độ khó: {relatedMovie.difficulty}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
    );
};

export default VideoDemo; 