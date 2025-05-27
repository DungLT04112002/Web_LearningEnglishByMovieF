"use client"
import React, { useEffect, useState } from 'react';
import TaskBar from '../TaskBar';
import ListMovieHP from '../ListMoive/ListMovieHP';
import axios from 'axios';

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
                <div className='w-full h-[10vh] fixed z-1'>
                    <TaskBar></TaskBar>
                </div>
                <div className="bg-[#141414] w-[100vw] h-[90vh] min-h-screen text-white ">
                    <div className="relative w-full h-full ">
                        {/* Ảnh background */}
                        <img
                            src="/assets/HomePageImg.jpg"
                            alt="Background"
                            className="w-[100%] h-[100%] object-cover opacity-60"
                        />
                        {/* Chữ đè lên */}
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <h1 className="text-white text-5xl font-bold drop-shadow-lg">
                                Welcome to Movie Website
                            </h1>
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
