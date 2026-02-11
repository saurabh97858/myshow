import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { ClockIcon } from 'lucide-react'

import { useAppContext } from '../context/AppContext'

const HeroSection = () => {

    const { movies } = useAppContext()
    const [featuredMovie, setFeaturedMovie] = useState(null)

    // Default "Avengers/Guardians" content that the user liked
    const defaultMovie = {
        title: "Guardians of the Galaxy",
        genres: ["Action", "Adventure", "Sci-Fi"],
        duration: 128, // 2h 8m
        description: "In a post Marvel Universe, a group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.",
        backdropUrl: "/backgroundImage.png",
        posterUrl: "/backgroundImage.png",
        isDefault: true,
        _id: null
    }

    /* 
    // Commented out to force default Avengers/Guardians background as per user request
    useEffect(() => {
        if (movies && movies.length > 0) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            setFeaturedMovie(movies[randomIndex]);
        }
    }, [movies]) 
    */

    const movie = featuredMovie || defaultMovie;
    const bgImage = movie.backdropUrl || movie.posterUrl || "/backgroundImage.png";

    // Check if it's the default movie or has Marvel-related keywords to show the logo
    const isMarvel = movie.title.toLowerCase().includes('guardians') || movie.title.toLowerCase().includes('avengers') || movie.isDefault;

    return (
        <div
            className='flex flex-col items-start justify-center gap-4 px-8 md:px-20 lg:px-40 bg-cover bg-center h-screen text-white relative'
            style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url("${bgImage}")`
            }}
        >
            {isMarvel && <img src={assets.marvelLogo} alt="Marvel" className='max-h-12 lg:h-14 mb-4 mt-20 animate-fade-in' />}
            {!isMarvel && <div className="mt-24"></div>}

            <h1 className='text-5xl md:text-[80px] md:leading-20 font-bold max-w-2xl leading-tight tracking-tight drop-shadow-lg'>
                {movie.title === "Guardians of the Galaxy" ? (
                    <>Guardians <br /> of the Galaxy</>
                ) : (
                    movie.title
                )}
            </h1>

            <div className='flex items-center gap-4 text-gray-300 font-medium'>
                <span>
                    {movie.genres && Array.isArray(movie.genres)
                        ? movie.genres.slice(0, 3).join(" | ")
                        : "Action | Adventure"}
                </span>

                <div className='flex items-center gap-1'>
                    <ClockIcon className='w-4.5 h-4.5' />
                    {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "2h 8m"}
                </div>
            </div>

            <p className='max-w-md text-gray-300 text-sm md:text-base'>
                {movie.description}
            </p>


        </div>
    )
}

export default HeroSection
