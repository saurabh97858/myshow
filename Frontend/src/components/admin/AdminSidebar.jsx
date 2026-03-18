import React from 'react';
import { assets } from '../../assets/assets';
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquare, FilmIcon, Home, MapPin, Flame, HelpCircle, Users, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useClerk } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const location = useLocation();
  const { user, isSuperAdmin, userRole, adminAccount, adminLogout } = useAppContext();
  const { signOut } = useClerk();

  const userProfile = {
    firstName: user?.firstName || 'Admin',
    lastName: user?.lastName || 'User',
    imageUrl: user?.imageUrl || assets.profile,
  };

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon, roles: ['admin', 'superadmin'] },
    // Only super admin manages movies globally
    { name: 'Add Movies', path: '/admin/add-movie', icon: FilmIcon, roles: ['superadmin'] },
    // Both can add theaters (but it's linked to owner if admin)
    { name: 'Add Theater', path: '/admin/add-theater', icon: MapPin, roles: ['admin', 'superadmin'] },
    // Both can add shows to their theaters
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquare, roles: ['admin', 'superadmin'] },
    // Only super admin manages trending globally
    { name: 'Manage Trending', path: '/admin/manage-trending', icon: Flame, roles: ['superadmin'] },
    // Super admin manages all admins
    { name: 'Manage Admins', path: '/admin/manage-admins', icon: Users, roles: ['superadmin'] },
    // Both can list shows and bookings (scoped by DB)
    { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon, roles: ['admin', 'superadmin'] },
    { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon, roles: ['admin', 'superadmin'] },
    { name: 'Help & Support', path: '/admin/support', icon: HelpCircle, roles: ['superadmin'] },
    { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['admin', 'superadmin'] },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-60 w-full border-r border-gray-300/20 text-sm">
      {/* User Info */}
      <img
        className="h-14 w-14 rounded-full mx-auto"
        src={userProfile.imageUrl}
        alt="sidebar"
      />
      <p className="mt-2 text-base text-center">
        {userProfile.firstName} {userProfile.lastName}
      </p>
      <div className={`mt-1 text-xs px-2 py-0.5 rounded-md ${isSuperAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
        {isSuperAdmin ? 'Super Admin' : 'Admin'}
      </div>

      {/* Navigation Links */}
      <div className="w-full mt-6 flex-1 overflow-y-auto no-scrollbar">
        {adminNavLinks
          .filter(link => link.roles.includes(userRole))
          .map((link, index) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;

          return (
            <NavLink
              key={index}
              to={link.path}
              end
              className={`relative flex items-center gap-3 w-full py-3.5 pl-6 text-gray-400 hover:bg-primary/10 transition-colors ${isActive ? 'bg-primary/15 text-primary font-medium' : ''
                }`}
            >
              <Icon className="w-5 h-5" />
              <p>{link.name}</p>
              {/* Active right bar */}
              {isActive && (
                <span className="w-1.5 h-full rounded-r bg-primary absolute right-0 top-0" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Back to Home */}
      <NavLink
        to="/"
        className="relative flex items-center gap-2 w-full py-4 pl-6 text-gray-400 hover:bg-primary/10 hover:text-white mt-auto border-t border-gray-700/50"
      >
        <Home className="w-5 h-5" />
        <p>Back to Home</p>
      </NavLink>

      {/* Logout Button */}
      <button
        onClick={async () => {
          if (adminAccount) {
            adminLogout();
          } else {
            // Sign out Clerk user properly
            try {
              await signOut();
              window.location.href = '/';
            } catch (err) {
              console.error("Clerk signOut failed:", err);
              toast.error("Logout failed. Please try again.");
            }
          }
        }}
        className="relative flex items-center gap-2 w-full py-4 pl-6 text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors border-t border-gray-700/50"
      >
        <LogOut className="w-5 h-5" />
        <p>Logout</p>
      </button>
    </div>
  );
};

export default AdminSidebar;
