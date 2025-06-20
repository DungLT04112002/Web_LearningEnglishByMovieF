import Link from "next/link";
import React, { useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

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
                <p className="text-lg font-bold text-white">Movie Level {level}</p>
                <div className="relative w-full">
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-300 shadow-lg hover:scale-110"
                        onClick={() => scroll(-300)}
                    >
                        <FiChevronLeft size={28} />
                    </button>
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto space-x-4 scrollbar-hide px-16"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {filteredMovies.map((movie) => (
                            <div key={movie.id} className="flex-none w-[18%] items-center">
                                <div
                                    onClick={() => handleMovieClick(movie.id)}
                                    className="cursor-pointer"
                                >
                                    <img
                                        src={movie.thumbnail_url}
                                        alt={movie.title}
                                        className="rounded-lg mx-auto w-[80%] h-auto hover:scale-105 transition-transform duration-300"
                                    />
                                    <p className="text-center text-2xl mt-2 text-white hover:text-blue-400 transition-colors duration-300">
                                        {movie.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-300 shadow-lg hover:scale-110"
                        onClick={() => scroll(300)}
                    >
                        <FiChevronRight size={28} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListMovieHP;