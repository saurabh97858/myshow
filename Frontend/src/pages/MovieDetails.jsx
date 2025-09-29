import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyShowsData, dummyDateTimeData } from '../assets/assets'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'

const MovieDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [show, setShow] = useState(null)

  const timeFormat = (minutes) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m`
  }

  useEffect(() => {
    const foundShow = dummyShowsData.find((s) => s._id === id)
    if (foundShow) {
      setShow({
        movie: foundShow,
        dateTime: dummyDateTimeData[id] || [],
      })
    }
  }, [id])

  if (!show) {
    return <Loading />
  }

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-10">
      {/* Top Section: Poster + Movie Info */}
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Poster */}
        <div className="md:w-2/5">
          <img
            src={show.movie.poster_path}
            alt={show.movie.title}
            className="rounded-xl h-[420px] w-full object-cover"
          />
        </div>

        {/* Movie Info */}
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-primary font-medium">
            {show.movie.original_language?.toUpperCase()}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300 mt-1">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average?.toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight">
            {show.movie.overview}
          </p>

          <p className="mt-2 text-gray-300">
            {timeFormat(show.movie.runtime)} •{' '}
            {show.movie.genres.map((g) => g.name).join(', ')} •{' '}
            {show.movie.release_date.split('-')[0]}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
            >
              Buy Tickets
            </a>
            <button className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="mt-10">
        <p className="text-lg font-medium mb-4">Your Favourite Cast</p>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 w-max px-2">
            {show.movie.cast.slice(0, 12).map((cast, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <img
                  src={cast.profile_path || '/default-cast.jpg'}
                  alt={cast.name}
                  className="rounded-full h-20 w-20 object-cover"
                />
                <p className="font-medium text-xs mt-2">{cast.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Selection + Show Timings */}
      <div className="mt-10" id="dateSelect">
        <DateSelect dateTime={show.dateTime} id={id} />

        {/* Recommended Section */}
        <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
        <div className="flex flex-wrap max-sm:justify-center gap-8">
          {dummyShowsData.slice(0, 4).map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>

        <div className="flex justify-center mt-20">
          <button
            onClick={() => {
              navigate('/movies')
              scrollTo(0, 0)
            }}
            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
          >
            Show More
          </button>
        </div>

        {/* Show Timings */}
        {show.dateTime.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">
              Show Timings
            </h2>
            <div className="flex flex-wrap gap-2">
              {show.dateTime.map((dt) => {
                const date = new Date(dt.time)
                const timeStr = date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <span
                    key={dt.showId}
                    className="px-3 py-1 bg-primary/30 text-white rounded-lg cursor-pointer"
                  >
                    {timeStr}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieDetails
