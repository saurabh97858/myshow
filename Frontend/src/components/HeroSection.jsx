import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { ClockIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
    const { movies } = useAppContext()
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)

    const defaultMovies = [
        {
            title: "Guardians of the Galaxy",
            genres: ["Action", "Adventure", "Sci-Fi"],
            duration: 128,
            description: "In a post Marvel Universe, a group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.",
            backdropUrl: "/backgroundImage.png",
            posterUrl: "/backgroundImage.png",
            isDefault: true,
            _id: null
        },
        {
            title: "Avengers: Endgame",
            genres: ["Action", "Sci-Fi", "Drama"],
            duration: 181,
            description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more.",
            backdropUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1920&q=80",
            posterUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1920&q=80",
            isDefault: true,
            _id: null
        }
    ]

    // Construct slides list combining DB movies and fallback defaults
    const [slides, setSlides] = useState(defaultMovies)

    useEffect(() => {
        if (movies && movies.length > 0) {
            // Keep at least the first default movie for the user's branding, then merge DB movies
            const dbSlides = movies.slice(0, 4).map(m => ({
                ...m,
                isDefault: false
            }))
            // Prepend original Guardians default
            setSlides([defaultMovies[0], ...dbSlides])
        }
    }, [movies])

    // Autoplay Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [slides])

    const handlePrev = (e) => {
        e.stopPropagation()
        setCurrentIndex(prevIndex => (prevIndex - 1 + slides.length) % slides.length)
    }

    const handleNext = (e) => {
        e.stopPropagation()
        setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length)
    }

    const handleBannerClick = (movie) => {
        if (movie._id) {
            navigate(`/movies/${movie._id}`)
            window.scrollTo(0, 0)
        }
    }

    if (slides.length === 0) return null

    const movie = slides[currentIndex]
    const bgImage = movie.backdropUrl || movie.posterUrl || "/backgroundImage.png"
    const isMarvel = movie.title.toLowerCase().includes('guardians') || movie.title.toLowerCase().includes('avengers') || movie.isDefault;

    return (
        <div 
            onClick={() => handleBannerClick(movie)}
            className={`flex flex-col items-start justify-center gap-4 px-8 md:px-20 lg:px-40 bg-cover bg-center h-screen text-white relative transition-all duration-700 ease-in-out select-none ${movie._id ? 'cursor-pointer' : ''}`}
            style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.85) 100%), linear-gradient(to top, rgba(9,9,11,1) 0%, rgba(0,0,0,0) 25%), url("${bgImage}")`
            }}
        >
            {/* Marvel branding overlay if applicable */}
            {isMarvel && (
                <img 
                    src={assets.marvelLogo} 
                    alt="Marvel" 
                    className="max-h-10 lg:h-12 mb-4 mt-20 animate-fade-in pointer-events-none drop-shadow-[0_4px_10px_rgba(229,9,20,0.4)]" 
                />
            )}
            {!isMarvel && <div className="mt-24"></div>}

            {/* Movie Info with key animated tags */}
            <div className="animate-slide-up space-y-3 max-w-3xl">
                <h1 className="text-4xl md:text-[70px] md:leading-18 font-extrabold tracking-tight drop-shadow-2xl bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent font-outfit">
                    {movie.title}
                </h1>

                <div className="flex items-center gap-4 text-primary font-bold text-xs tracking-wider uppercase">
                    <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                        {movie.genres && Array.isArray(movie.genres)
                            ? movie.genres.slice(0, 3).join(" | ")
                            : "Action | Adventure"}
                    </span>

                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md text-gray-300">
                        <ClockIcon className="w-3.5 h-3.5 text-primary" />
                        {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "2h 8m"}
                    </div>
                </div>

                <p className="max-w-xl text-gray-400 text-xs md:text-sm leading-relaxed drop-shadow-md">
                    {movie.description}
                </p>

                {movie._id && (
                    <button className="mt-2 bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-primary text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:scale-105">
                        🎟️ Book Tickets Now
                    </button>
                )}
            </div>

            {/* Left/Right Slider Navigation */}
            <button 
                onClick={handlePrev} 
                className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white flex items-center justify-center transition-all duration-300 transform active:scale-90 hover:scale-105 z-20 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button 
                onClick={handleNext} 
                className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 border border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white flex items-center justify-center transition-all duration-300 transform active:scale-90 hover:scale-105 z-20 group"
            >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-20" onClick={e => e.stopPropagation()}>
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            currentIndex === idx 
                                ? 'w-8 bg-primary shadow-md shadow-primary/40' 
                                : 'w-2.5 bg-white/20 hover:bg-white/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default HeroSection
