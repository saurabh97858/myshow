import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon, ShieldCheck } from 'lucide-react'
import { UserButton, useUser } from '@clerk/clerk-react'

import { useAppContext } from '../context/AppContext'
import LocationSelector from './LocationSelector'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const navigate = useNavigate()
  const { favouriteMovies, isAdmin } = useAppContext()

  const [isScrolled, setIsScrolled] = useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/favourite', label: 'Favourites' },
  ]

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-12 lg:px-24 py-4 transition-all duration-300 ${isScrolled ? 'bg-black/70 backdrop-blur-md shadow-lg py-3' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>

      {/* Logo */}
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={assets.logo} alt="Logo" className="w-32 md:w-40 h-auto drop-shadow-lg" />
      </Link>

      {/* Desktop Links - Premium Glass Pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-lg shadow-lg ring-1 ring-white/5">
        {navItems.map(({ to, label }) => (
          <Link
            key={label}
            to={to}
            className="text-gray-300 font-medium px-5 py-2 rounded-full hover:text-white hover:bg-white/10 transition-all duration-300 text-sm tracking-wide"
          >
            {label}
          </Link>
        ))}

        {/* Admin Panel Link - Only for Admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className="text-primary font-medium px-5 py-2 rounded-full hover:bg-primary/10 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </Link>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <div className='hidden lg:block'>
          <LocationSelector />
        </div>
        <SearchIcon className="hidden md:block w-5 h-5 cursor-pointer text-gray-300 hover:text-white transition" />

        {!user ? (
          <Link to="/sign-in">
            <button className="px-6 py-2 bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dull hover:to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-primary/30 transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm tracking-wide">
              Login
            </button>
          </Link>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-white/20 hover:ring-primary transition-all"
              }
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus className="w-4 h-4" />}
                onClick={() => navigate('/my-bookings')}
              />

              {isAdmin && (
                <UserButton.Action
                  label="Admin Panel"
                  labelIcon={<ShieldCheck className="w-4 h-4" />}
                  onClick={() => navigate('/admin')}
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden p-2 text-white/80 hover:text-white transition bg-white/5 rounded-full backdrop-blur-md border border-white/10"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <button
          className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition bg-white/5 rounded-full border border-white/10"
          onClick={() => setIsOpen(false)}
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Mobile Links */}
        <div className="flex flex-col items-center gap-6 w-full px-6">
          {navItems.map(({ to, label }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setIsOpen(false)}
              className="text-gray-300 text-3xl font-bold hover:text-primary hover:tracking-wider transition-all duration-300"
            >
              {label}
            </Link>
          ))}

          <div className='mt-4 flex flex-col items-center gap-6'>
            <LocationSelector />

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="text-primary text-xl font-medium hover:text-white transition flex items-center gap-2"
              >
                <ShieldCheck className="w-6 h-6" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
