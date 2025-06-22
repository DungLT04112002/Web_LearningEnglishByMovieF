import Link from "next/link";
import React, { useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import LikeButton from "../LikeButton/LikeButton";

const ListMovieHP = ({ movies, level }) => {
    const scrollRef = useRef(null);
    const router = useRouter();

    const filteredMovies = movies.filter(movie => movie.difficulty === level);

    const scroll = (offset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
        }
    };

    const handleMovieClick = (movieId) => {
        router.push(`/Navigate/user/movieinfopage/${movieId}`);
    };

    return (
        <div className="w-[100vw] bg-[#18191a] max-w-[100vw]">
            <div className="my-[3vh] bg-[#18191a]">
                <p className="text-2xl font-bold text-white mb-4 ml-8">Movie Level {level}</p>
                <div className="relative w-full">
                    <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-blue-50 text-blue-700 rounded-full p-3 transition-all duration-300 shadow-2xl hover:scale-110 border-4 border-white"
                        onClick={() => scroll(-300)}
                    >
                        <FiChevronLeft size={36} />
                    </button>
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto space-x-8 scrollbar-hide px-20 py-2"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {filteredMovies.map((movie) => (
                            <div key={movie.id} className="flex-none w-[18%] items-center">
                                <div className="cursor-pointer group relative">
                                    <img
                                        src={movie.thumbnail_url}
                                        alt={movie.title}
                                        className="rounded-xl mx-auto w-[80%] h-auto group-hover:scale-105 group-hover:shadow-2xl transition-transform duration-300 border-2 border-transparent group-hover:border-orange-400"
                                        onClick={() => handleMovieClick(movie.id)}
                                    />

                                    {/* Like Button Overlay */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <LikeButton
                                            movieId={movie.id}
                                            size={24}
                                            className="bg-black bg-opacity-50 p-2 rounded-full"
                                        />
                                    </div>

                                    <p className="text-center text-xl mt-3 text-white font-bold group-hover:text-orange-400 transition-colors duration-300 truncate">
                                        {movie.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-blue-50 text-blue-700 rounded-full p-3 transition-all duration-300 shadow-2xl hover:scale-110 border-4 border-white"
                        onClick={() => scroll(300)}
                    >
                        <FiChevronRight size={36} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListMovieHP;