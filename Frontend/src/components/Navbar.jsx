import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon, ShieldCheck, Building2 } from 'lucide-react'
import { UserButton, useUser } from '@clerk/clerk-react'

import { useAppContext } from '../context/AppContext'
import LocationSelector from './LocationSelector'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { favouriteMovies, isAdmin } = useAppContext()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Add background when scrolled
      setIsScrolled(currentScrollY > 50)

      // Hide/Show based on scroll direction
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current && currentScrollY - lastScrollY.current > 5) {
          // Scrolling DOWN → hide navbar
          setIsHidden(true)
        } else if (lastScrollY.current > currentScrollY && lastScrollY.current - currentScrollY > 5) {
          // Scrolling UP → show navbar
          setIsHidden(false)
        }
      } else {
        setIsHidden(false)
      }

      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { to: '/', label: 'Home', color: 'from-violet-500 to-fuchsia-500', glow: 'shadow-violet-500/40' },
    { to: '/movies', label: 'Movies', color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/40' },
    { to: '/trending', label: 'Trending', color: 'from-amber-400 to-orange-500', glow: 'shadow-amber-500/40' },
    { to: '/favourite', label: 'Favourites', color: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/40' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-12 lg:px-12 py-4 transition-all duration-500 ease-in-out
        ${isScrolled ? 'bg-black/70 backdrop-blur-md shadow-lg py-3' : 'bg-gradient-to-b from-black/80 to-transparent'}
        ${isHidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >

      {/* Logo */}
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <img src={assets.logo} alt="Logo" className="w-32 md:w-40 h-auto drop-shadow-lg" />
      </Link>

      {/* Desktop Links - Premium Glass Pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-lg shadow-lg ring-1 ring-white/5">
        {navItems.map(({ to, label, color, glow }) => (
          <Link
            key={label}
            to={to}
            className={`relative font-medium px-5 py-2 rounded-full transition-all duration-300 text-sm tracking-wide group overflow-hidden
              ${isActive(to)
                ? `text-white bg-gradient-to-r ${color} shadow-lg ${glow}`
                : 'text-gray-300 hover:text-white'
              }
            `}
          >
            {/* Hover gradient background */}
            {!isActive(to) && (
              <span className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full`} />
            )}
            {/* Glow effect on hover */}
            <span className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg ${glow}`} style={{ pointerEvents: 'none' }} />
            <span className="relative z-10">{label}</span>
            {/* Active indicator dot */}
            {isActive(to) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        ))}

        {/* Admin Panel Link - Only for Admins */}
        {isAdmin && (
          <Link
            to="/admin"
            className={`relative font-medium px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm group overflow-hidden
              ${isActive('/admin')
                ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40'
                : 'text-emerald-400 hover:text-white'
              }
            `}
          >
            {!isActive('/admin') && (
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
            )}
            <ShieldCheck className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Admin</span>
          </Link>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        <div className='hidden lg:block'>
          <LocationSelector />
        </div>

        {/* Notification Bell - Only for logged in users */}
        {user && <NotificationBell />}

        {!user ? (
          <Link to="/sign-in">
            <button className="relative px-6 py-2 bg-gradient-to-r from-primary to-rose-600 hover:from-primary-dull hover:to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-primary/30 transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm tracking-wide overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Login</span>
            </button>
          </Link>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            userProfileMode="navigation"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-white/20 hover:ring-primary transition-all"
              }
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Action
                label="Partner With Us"
                labelIcon={<Building2 className="w-4 h-4" />}
                onClick={() => navigate('/apply-admin')}
              />

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
          {navItems.map(({ to, label, color }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`text-3xl font-bold transition-all duration-300 ${
                isActive(to)
                  ? 'bg-gradient-to-r bg-clip-text text-transparent ' + color + ' tracking-wider'
                  : 'text-gray-300 hover:text-primary hover:tracking-wider'
              }`}
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
                className="text-emerald-400 text-xl font-medium hover:text-white transition flex items-center gap-2"
              >
                <ShieldCheck className="w-6 h-6" />
                Admin Panel
              </Link>
            )}
          </div> {/* Close mt-4 */}
        </div> {/* Close mobile links container */}
      </div> {/* Close overlay */}
    </nav>
  )
}

export default Navbar
