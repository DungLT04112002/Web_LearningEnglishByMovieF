"use client"
import React, { useEffect, useState } from 'react';
import TaskBar from '../TaskBar/TaskBar';
import ListMovieHP from '../ListMoive/ListMovieHP';
import axios from 'axios';
import { FiPlayCircle, FiEdit3 } from 'react-icons/fi';

const BASE_API_URL = "http://localhost:8081/api";

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(`${BASE_API_URL}/movies`);
                console.log(response.data);
                setMovies(response.data);
                setLoading(false);
            } catch (err) {
                console.log("Không lấy được danh sách phim");
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) {
        return <div className="w-[100vw] h-[100vh] bg-[#18191a] flex items-center justify-center">
            <p className="text-white text-2xl">Loading...</p>
        </div>;
    }

    return (
        <div className='w-[100vw] bg-[#18191a]'>
            <div>
                <div className='w-full h-[10vh] fixed z-50'>
                    <TaskBar></TaskBar>
                </div>
                <div className="bg-gradient-to-b from-[#18191a] to-[#23272f] w-[100vw] min-h-[100vh] flex flex-col items-center justify-center pt-[10vh] pb-10 relative">
                    {/* Ảnh background mờ */}
                    <img
                        src="/assets/HomePageImg.jpg"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
                    />
                    {/* Hướng dẫn 2 bước */}
                    <div className="relative z-10 flex flex-col items-center w-full">
                        <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-8 text-center drop-shadow-lg tracking-wide">Chào mừng bạn đến với Movie Learning</h1>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full max-w-4xl">
                            {/* Bước 1 */}
                            <div className="flex flex-col items-center w-full md:w-1/2">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold shadow-lg">1</div>
                                    <span className="text-white text-2xl font-bold">Xem phim</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FiPlayCircle className="text-blue-400 mb-2" size={80} />
                                    <p className="text-white text-center text-lg opacity-80 max-w-xs">Chọn bộ phim bạn yêu thích, xem với phụ đề song ngữ để luyện nghe và hiểu nội dung.</p>
                                </div>
                            </div>
                            {/* Mũi tên hoặc đường nối */}
                            <div className="hidden md:flex flex-col items-center h-32 justify-center">
                                <div className="w-1 h-24 bg-blue-400 rounded-full"></div>
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl -mt-4">→</div>
                            </div>
                            {/* Bước 2 */}
                            <div className="flex flex-col items-center w-full md:w-1/2">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-600 text-white text-2xl font-bold shadow-lg">2</div>
                                    <span className="text-white text-2xl font-bold">Làm bài tập</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <FiEdit3 className="text-purple-400 mb-2" size={80} />
                                    <p className="text-white text-center text-lg opacity-80 max-w-xs">Sau khi xem phim, hãy thử sức với các bài tập tương tác để kiểm tra và nâng cao kỹ năng tiếng Anh của bạn.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ListMovieHP movies={movies} level={1} />
                <ListMovieHP movies={movies} level={2} />
                <ListMovieHP movies={movies} level={3} />
            </div>
        </div>
    );
};

export default HomePage;
