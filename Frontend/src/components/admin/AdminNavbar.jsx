 import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
 
 const AdminNavbar = () => {
   const { isSuperAdmin, userRole } = useAppContext();

   return (
     <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
       <Link to='/' className="flex items-center gap-4">
         <img src={assets.logo} alt="logo"  className='w-36 h-auto'/>
         <span className={`px-3 py-1 text-xs font-bold rounded-full ${isSuperAdmin ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
           {isSuperAdmin ? 'SUPER ADMIN' : 'THEATER ADMIN'}
         </span>
       </Link>
     </div>
   )
 }
 
 export default AdminNavbar
 