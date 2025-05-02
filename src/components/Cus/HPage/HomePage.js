"use client"
import React, { useEffect, useState } from 'react';
import TaskBar from '../TaskBar';
import ListMovieHP from '../ListMoive/ListMovieHP';
const HomePage = () => {
    const [sections, setSections] = useState([]);
    return (
        <div className='w-[100vw] bg-[#18191a]'>
            <div className='w-full h-[10vh] fixed z-1'>
                <TaskBar></TaskBar>
            </div>
            <div className="bg-[#141414] h-[90vh] min-h-screen text-white ">
                <div className="relative w-full h-full ">
                    {/* Ảnh background */}
                    <img
                        src="/assets/HomePageImg.jpg"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60"
                    />

                    {/* Chữ đè lên */}
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <h1 className="text-white text-5xl font-bold drop-shadow-lg">
                            Welcome to Movie Website
                        </h1>
                    </div>
                </div>
            </div>
            <ListMovieHP className="w-[100%]" lever={1}></ListMovieHP>
            <ListMovieHP className="w-[100%]" lever={2}></ListMovieHP>
            <ListMovieHP className="w-[100%]" lever={3}></ListMovieHP>


        </div>
    );
};

export default HomePage;
