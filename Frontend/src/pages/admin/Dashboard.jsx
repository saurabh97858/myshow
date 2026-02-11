import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon, BuildingIcon, TicketIcon, HelpCircle, TrendingUpIcon, Clock, User } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import BlurCircle from '../../components/BlurCircle';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {

  const { axios, getToken, user, image_base_url } = useAppContext()

  const currency = import.meta.env.VITE_CURRENCY

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    activeShowsCount: 0,
    totalUser: 0,
    support: { pending: 0, processing: 0, solved: 0, total: 0 },
    theaters: { total: 0 },
    movies: { total: 0 },
    popularMovies: [],
    recentBookings: [],
    revenueByMethod: []
  })
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const DashboardCards = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || '0', icon: ChartLineIcon, color: 'bg-blue-500/10 border-blue-500/20', iconColor: 'text-blue-500' },
    { title: 'Total Revenue', value: currency + ' ' + (dashboardData.totalRevenue || '0'), icon: CircleDollarSignIcon, color: 'bg-green-500/10 border-green-500/20', iconColor: 'text-green-500' },
    { title: 'Active Shows', value: dashboardData.activeShowsCount || '0', icon: PlayCircleIcon, color: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-500' },
    { title: 'Total Users', value: dashboardData.totalUser || '0', icon: UsersIcon, color: 'bg-pink-500/10 border-pink-500/20', iconColor: 'text-pink-500' },
    { title: 'Total Theaters', value: dashboardData.theaters?.total || '0', icon: BuildingIcon, color: 'bg-orange-500/10 border-orange-500/20', iconColor: 'text-orange-500' },
    { title: 'Total Movies', value: dashboardData.movies?.total || '0', icon: TicketIcon, color: 'bg-cyan-500/10 border-cyan-500/20', iconColor: 'text-cyan-500' },
    { title: 'Pending Support', value: dashboardData.support?.pending || '0', icon: HelpCircle, color: 'bg-yellow-500/10 border-yellow-500/20', iconColor: 'text-yellow-500' },
    { title: 'Solved Support', value: dashboardData.support?.solved || '0', icon: HelpCircle, color: 'bg-emerald-500/10 border-emerald-500/20', iconColor: 'text-emerald-500' }
  ]

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      })
      if (data.success) {
        setDashboardData(data.dashboardData)
        setLastUpdated(new Date());
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Error fetching dashboard data", error)
    } finally {
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();

      // Real-time auto-refresh every 5 seconds
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 5000); // 5 seconds for real-time updates

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return dateFormat(dateString);
  };

  return !loading ? (
    <>
      <div className="flex items-center justify-between mb-6">
        <Title text1="Admin" text2=" Dashboard" />
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {formatDate(lastUpdated.toISOString())}
            </p>
          )}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Clock className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className='relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6'>
        <BlurCircle top='-100px' left='0' />
        {DashboardCards.map((card, index) => (
          <div key={index} className={`flex items-center justify-between px-3 py-2.5 ${card.color} border rounded-md`}>
            <div>
              <h1 className='text-xs text-gray-400'>{card.title}</h1>
              <p className='text-lg font-bold mt-0.5'>{card.value}</p>
            </div>
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
          </div>
        ))}
      </div>

      {/* Support Tickets Analytics */}
      <div className='mt-6'>
        <h2 className='text-base font-semibold mb-3'>Support Tickets Overview</h2>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3'>
            <p className='text-xs text-gray-400'>Pending</p>
            <p className='text-2xl font-bold text-yellow-500'>{dashboardData.support?.pending || 0}</p>
          </div>
          <div className='bg-blue-500/10 border border-blue-500/20 rounded-md p-3'>
            <p className='text-xs text-gray-400'>In Processing</p>
            <p className='text-2xl font-bold text-blue-500'>{dashboardData.support?.processing || 0}</p>
          </div>
          <div className='bg-green-500/10 border border-green-500/20 rounded-md p-3'>
            <p className='text-xs text-gray-400'>Solved</p>
            <p className='text-2xl font-bold text-green-500'>{dashboardData.support?.solved || 0}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Popular Movies and Recent Activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
        {/* Popular Movies */}
        <div>
          <h2 className='text-base font-semibold mb-3 flex items-center gap-2'>
            <TrendingUpIcon className='w-4 h-4 text-primary' />
            Top 5 Popular Movies
          </h2>
          <div className='space-y-2'>
            {dashboardData.popularMovies && dashboardData.popularMovies.length > 0 ? (
              dashboardData.popularMovies.map((item, index) => (
                <div key={index} className='bg-primary/10 border border-primary/20 rounded-md p-3 flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className='w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary'>
                      {index + 1}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm truncate'>{item.movie?.title || 'Unknown'}</p>
                      <p className='text-xs text-gray-400'>{item.bookingCount} bookings</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-bold text-primary'>{currency} {item.revenue}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-sm'>No booking data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className='text-base font-semibold mb-3 flex items-center gap-2'>
            <Clock className='w-4 h-4 text-primary' />
            Recent Bookings
          </h2>
          <div className='space-y-2 max-h-[400px] overflow-y-auto'>
            {dashboardData.recentBookings && dashboardData.recentBookings.length > 0 ? (
              dashboardData.recentBookings.map((booking, index) => (
                <div key={index} className='bg-white/5 border border-white/10 rounded-md p-2.5 flex items-center justify-between'>
                  <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <User className='w-4 h-4 text-primary flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-xs truncate'>{booking.show?.movie?.title || 'Unknown Movie'}</p>
                      <p className='text-[10px] text-gray-400'>{booking.contactDetails?.name || 'Guest'} • {formatDate(booking.createdAt)}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs font-bold text-green-500'>{currency} {booking.amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-sm'>No recent bookings</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {dashboardData.revenueByMethod && dashboardData.revenueByMethod.length > 0 && (
        <div className='mt-6'>
          <h2 className='text-base font-semibold mb-3'>Revenue by Payment Method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {dashboardData.revenueByMethod.map((method, index) => (
              <div key={index} className='bg-primary/10 border border-primary/20 rounded-md p-3'>
                <p className='text-xs text-gray-400'>{method._id || 'Unknown'}</p>
                <p className='text-xl font-bold text-primary'>{currency} {method.total}</p>
                <p className='text-xs text-gray-400 mt-1'>{method.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Movies in Theaters */}
      <p className='mt-8 text-base font-semibold'>Active Movies in Theaters</p>

      <div className='relative flex flex-wrap gap-4 mt-4 max-w-5xl'>
        <BlurCircle top='100px' left='-100px' />
        {
          dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
            dashboardData.activeShows.map((show) => (
              <div key={show.movie._id} className='w-44 rounded-lg overflow-hidden h-full pb-2 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300' >
                <img
                  src={show.movie.posterUrl?.startsWith('http') ? show.movie.posterUrl : (image_base_url + show.movie.posterUrl)}
                  alt={show.movie.title}
                  className='h-52 w-full object-cover'
                />
                <p className='font-medium p-2 text-sm truncate'>{show.movie.title}</p>
                <div className='flex items-center justify-between px-2'>
                  <p className='text-sm font-medium'>{typeof show.movie.ticketPrice === 'number' ? currency + ' ' + show.movie.ticketPrice : 'See Details'}</p>
                  <p className='flex items-center gap-1 text-xs text-gray-400 pr-1'>
                    <StarIcon className='w-3 h-3 text-primary fill-primary' />
                    {show.movie.rating ? show.movie.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <p className='px-2 pt-1 text-[10px] text-gray-500'>Now Showing</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No active shows found.</p>
          )
        }
      </div>

    </>
  ) : <Loading />
}

export default Dashboard
