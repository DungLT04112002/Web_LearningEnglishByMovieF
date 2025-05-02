import React, { use, useRef } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
const ListMovieHP = ({ lever }) => {

    const scrollRef = useRef(null);

    const scroll = (offset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    const movies = [
        { id: 1, title: "Movie 1", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        { id: 2, title: "Movie 2", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        { id: 3, title: "Movie 3", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        { id: 4, title: "Movie 4", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        { id: 5, title: "Movie 5", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        { id: 6, title: "Movie 6", poster: "https://images.plex.tv/photo?size=medium-360&scale=1&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff5ffecfcf931d7880b503e4719690c4c.jpg" },
        // thêm phim tuỳ ý
    ];
    return (
        <div className="w-[100vw]  bg-[#18191a] max-w-[100vw]">
            <div className="  my-[3vh]  bg-[#18191a] ] ">
                <p className="text-lg font-bold my-[20] ">Movie Lever {lever}</p>

                <div className="relative w-full">
                    {/* Nút trái */}
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black p-2 rounded-full "
                        onClick={() => scroll(-300)}
                    >
                        <FiChevronLeft size={24} color="white" />
                    </button>


                    {/* List phim */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto space-x-4 scrollbar-hide px-10"
                        style={{
                            scrollbarWidth: 'none',        // Firefox
                        }}
                    >
                        {movies.map((movie) => (
                            <div key={movie.id} className="flex-none w-[20%]  items-center">
                                <img src={movie.poster} alt={movie.title} className="rounded-lg mx-auto " />
                                <p className="text-center mt-2">{movie.title}</p>
                            </div>
                        ))}
                    </div>

                    {/* Nút phải */}
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black p-2 rounded-full "
                        onClick={() => scroll(300)}
                    >
                        <FiChevronRight size={24} />
                    </button>
                </div>


            </div>




        </div >
    )

}

export default ListMovieHP;