import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500" // TMDB base URL

// Format runtime in "xh ym" format
const formatRuntime = (minutes) => {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()

  // Extract metadata safely
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"
  const genres = movie.genres && movie.genres.length > 0 
    ? movie.genres.slice(0, 2).map((g) => g.name).join(" | ") 
    : null
  const runtime = movie.runtime ? formatRuntime(movie.runtime) : null

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-64">
      
      {/* Poster */}
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`)
          scrollTo(0, 0)
        }}
        src={movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : '/placeholder.png'}
        alt={movie.title}
        className="rounded-lg h-52 w-full object-cover object-center cursor-pointer"
      />

      {/* Title */}
      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      {/* Meta Info */}
      <p className="text-sm text-gray-400 mt-1">
        {releaseYear}
        {genres && ` • ${genres}`}
        {runtime && ` • ${runtime}`}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`)
            scrollTo(0, 0)
          }}
          className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
        </p>
      </div>
    </div>
  )
}

export default MovieCard
