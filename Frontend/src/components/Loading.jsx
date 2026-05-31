import React from 'react'

const Loading = () => {
  return (
    <div className='flex flex-col justify-center items-center h-[80vh] gap-6'>
      {/* Film Strip Loader */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-2 border-white/5 absolute"></div>
        {/* Spinning ring */}
        <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary/40 animate-spin absolute"></div>
        {/* Inner pulse */}
        <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-primary/60"></div>
        </div>
        {/* Film sprocket dots */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
            style={{
              transform: `rotate(${deg}deg) translateY(-34px)`,
            }}
          />
        ))}
      </div>

      {/* Film strip animation */}
      <div className="flex gap-1 overflow-hidden w-40">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-5 h-7 rounded-sm border border-white/10 bg-white/5 relative overflow-hidden"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
            {/* Sprocket holes */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black/60 rounded-full" />
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-black/60 rounded-full" />
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs tracking-[0.3em] uppercase font-bold animate-pulse">
        Loading...
      </p>
    </div>
  )
}

export default Loading
