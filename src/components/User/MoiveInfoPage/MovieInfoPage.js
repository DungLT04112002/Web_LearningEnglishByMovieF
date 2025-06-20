'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const BASE_API_URL = 'http://localhost:8081/api';

const MovieInfoPage = () => {
  const router = useRouter();
    const params = useParams();
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    if (params) fetchMovieDetails();
  }, [params]);

  const fetchMovieDetails = async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/movies/${params.movieId}`);
      setMovieDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
    }
  };

  if (!movieDetails) {
    return <div className="text-white text-center mt-20">Đang tải thông tin phim...</div>;
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url(${movieDetails.thumbnail_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Màn che làm mờ */}
      <div className="absolute inset-0 bg-black bg-opacity-100 backdrop-blur-md"></div>

      {/* Nội dung chính */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-6 py-12 gap-10 text-white">
        {/* Hình thumbnail */}
        <div className="rounded-xl overflow-hidden shadow-lg max-w-sm">
          <img
            src={movieDetails.thumbnail_url}
            alt="Thumbnail"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Thông tin phim */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">{movieDetails.title}</h1>
          <p className="text-sm mb-2">
            <span className="font-semibold">Thể loại:</span> {movieDetails.genre}
          </p>
          <p className="text-sm mb-2">
            <span className="font-semibold">Độ khó:</span> {movieDetails.difficulty}
          </p>
          <p className="text-base text-gray-200 whitespace-pre-line leading-relaxed mb-6">
            {movieDetails.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/Navigate/user/watchmovie/${params.movieId}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow-md transition"
            >
              ▶ Xem phim
            </button>
            <button
              onClick={() => router.push(`/Navigate/user/practicepage/${params.movieId}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md transition"
            >
              📝 Luyện tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfoPage;
