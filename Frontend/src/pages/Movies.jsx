import React, { useState } from 'react'
import MovieCard from '../components/MovieCard'
import { useAppContext } from '../context/AppContext'
import { Search, Film, Calendar, Star } from 'lucide-react'

const Movies = () => {
  const { movies } = useAppContext()
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Filter movies based on selected category
  const filteredMovies = selectedCategory === 'All'
    ? movies
    : movies.filter(movie => movie.category === selectedCategory)

  const categories = [
    { id: 'All', label: 'All Movies', icon: Film },
    { id: 'Indian', label: 'Indian Cinema', icon: Star },
    { id: 'Hollywood', label: 'Hollywood', icon: Calendar }, // Using Calendar as placeholder icon if bespoke ones aren't available
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 relative">
      {/* Premium Theater Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
          alt="Cinema Background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold font-outfit tracking-tight mb-4">
              Explore <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Movies</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl font-light">
              Discover the latest blockbusters, critically acclaimed masterpieces, and hidden gems currently showing in cinemas.
            </p>
          </div>

          {/* Search / Sort placeholder (visual only for now) */}
          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-48 text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center md:justify-start gap-4 mb-12 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 border ${selectedCategory === cat.id
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <cat.icon className={`w-4 h-4 ${selectedCategory === cat.id ? 'text-black' : 'text-gray-500'}`} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredMovies.map((movie) => (
              <MovieCard movie={movie} key={movie._id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <Film className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Movies Found</h2>
            <p className="text-gray-500 max-w-md">
              We couldn't find any movies matching "{selectedCategory}". Try switching categories or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies

