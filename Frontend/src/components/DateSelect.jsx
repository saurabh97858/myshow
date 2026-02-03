import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const dates = Object.keys(dateTime).sort()

  const onBookHandler = () => {
    if (!selectedDate) {
      return toast.error('Please select a date')
    }
    if (!selectedTime) {
      return toast.error('Please select a time slot')
    }

    if (!selectedTime.showId) {
      return toast.error('Invalid show ID')
    }

    navigate(`/movies/${id}/${selectedTime.showId}`)
    scroll(0, 0)
  }

  // Get available times for selected date
  const availableTimes = selectedDate ? dateTime[selectedDate] || [] : []

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return { day: 'Today', date: date.getDate(), month: date.toLocaleDateString('en-US', { month: 'short' }) }
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return { day: 'Tomorrow', date: date.getDate(), month: date.toLocaleDateString('en-US', { month: 'short' }) }
    }
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    }
  }

  // Format time for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 border border-gray-700/50 backdrop-blur relative overflow-hidden">
      <BlurCircle top="-100px" left="-100px" />
      <BlurCircle bottom="-50px" right="-50px" />

      {/* Step 1: Date Selection */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span>
          <h3 className="text-lg font-semibold">Select Date</h3>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {dates.map((date) => {
              const { day, date: dateNum, month } = formatDate(date)
              const isSelected = selectedDate === date

              return (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  className={`flex-shrink-0 flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 min-w-[80px] ${isSelected
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                      : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700'
                    }`}
                >
                  <span className="text-xs font-medium opacity-80">{day}</span>
                  <span className="text-2xl font-bold">{dateNum}</span>
                  <span className="text-xs font-medium opacity-80">{month}</span>
                </button>
              )
            })}
          </div>

          <button className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Step 2: Time Selection */}
      {selectedDate && (
        <div className="relative z-10 mb-8 animate-fadeIn">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span>
            <h3 className="text-lg font-semibold">Select Time</h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {availableTimes.map((timeObj) => {
              const isSelected = selectedTime?.showId === timeObj.showId

              return (
                <button
                  key={timeObj.showId}
                  onClick={() => setSelectedTime(timeObj)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 ${isSelected
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border border-gray-700'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{formatTime(timeObj.time)}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: Proceed to Seats */}
      {selectedTime && (
        <div className="relative z-10 animate-fadeIn">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</span>
            <h3 className="text-lg font-semibold">Confirm & Proceed</h3>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-800/80 rounded-2xl p-5 mb-5 border border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Your Selection</p>
                <p className="text-lg font-semibold">
                  {formatDate(selectedDate).day}, {formatDate(selectedDate).date} {formatDate(selectedDate).month} at <span className="text-primary">{formatTime(selectedTime.time)}</span>
                </p>
              </div>

              <button
                onClick={onBookHandler}
                className="px-8 py-3 bg-gradient-to-r from-primary to-pink-600 hover:from-primary-dull hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-95"
              >
                🪑 Select Seats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - No date selected */}
      {!selectedDate && dates.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>👆 Select a date to see available show times</p>
        </div>
      )}
    </div>
  )
}

export default DateSelect
