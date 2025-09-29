import React, { useState } from 'react';
import { dummyTrailers } from '../assets/assets';
import ReactPlayer from 'react-player';
import BlurCircle from './BlurCircle';
import { PlayCircleIcon } from 'lucide-react';

const TrailersSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleThumbnailClick = (trailer) => {
    setCurrentTrailer(trailer);
    setIsPlaying(true); // Auto-play selected trailer
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailers
      </p>

      {/* Video Player */}
      <div className="relative mt-6 flex justify-center">
        <BlurCircle top="-100px" right="-100px" />

        <ReactPlayer
          key={currentTrailer.videoUrl} // Force re-render when changing video
          url={currentTrailer.videoUrl}
          controls={true}
          playing={isPlaying}
          className="rounded-lg overflow-hidden"
          width="960px"
          height="540px"
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer, index) => {
          const isActive = trailer.videoUrl === currentTrailer.videoUrl;

          return (
            <div
              key={index}
              className={`relative cursor-pointer rounded-lg overflow-hidden transform transition duration-300 hover:-translate-y-1 ${
                isActive ? 'ring-4 ring-blue-500 brightness-100' : ''
              }`}
              onClick={() => handleThumbnailClick(trailer)}
            >
              <img
                src={trailer.image}
                alt={`Trailer ${index}`}
                className={`w-full h-32 object-cover transition ${
                  isActive ? 'brightness-100' : 'brightness-75'
                }`}
              />
              <PlayCircleIcon
                strokeWidth={1.6}
                className="absolute top-1/2 left-1/2 w-10 h-10 text-white transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrailersSection;
