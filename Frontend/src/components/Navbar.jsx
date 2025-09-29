import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const navigate = useNavigate()

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/', label: 'Theaters' },
    { to: '/', label: 'Releases' },
    { to: '/favourite', label: 'Favourites' },
  ]

  return (
    <nav className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-transparent">

      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
      </Link>

      {/* Desktop Links Container */}
      <div className="hidden md:flex gap-0 items-center bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
        {navItems.map(({ to, label }) => (
          <Link
            key={label}
            to={to}
            className="text-white font-medium px-4 py-1 hover:text-primary transition"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-8">
        <SearchIcon className="hidden md:block w-6 h-6 cursor-pointer text-white" />

        {!user ? (
          <Link to="/sign-in">
            <button className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer">
              Login
            </button>
          </Link>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: "w-10 h-10" } }}
          >
            <UserButton.Action
              label="My Bookings"
              labelIcon={<TicketPlus width={15} />}
              onClick={() => navigate('/my-bookings')}
            />
          </UserButton>
        )}

        {/* Mobile Menu Icon */}
        <MenuIcon
          className="md:hidden w-8 h-8 cursor-pointer text-white"
          onClick={() => setIsOpen(true)}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed top-0 left-0 z-40 w-full h-screen bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <XIcon
          className="absolute top-6 right-6 w-6 h-6 cursor-pointer text-white"
          onClick={() => setIsOpen(false)}
        />

        {/* Mobile Links Container */}
        <div className="flex flex-col items-center bg-black/50 px-6 py-4 rounded-xl gap-4">
          {navItems.map(({ to, label }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setIsOpen(false)}
              className="text-white text-2xl font-medium hover:text-primary transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
