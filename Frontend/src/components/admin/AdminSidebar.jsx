import React from 'react';
import { assets } from '../../assets/assets';
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    imageUrl: assets.profile,
  };

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon },
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquare },
    { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon },
    { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapseIcon },
  ];

  return (
    <div className="h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-60 w-full border-r border-gray-300/20 text-sm">
      {/* User Info */}
      <img
        className="h-14 w-14 rounded-full mx-auto"
        src={user.imageUrl}
        alt="sidebar"
      />
      <p className="mt-2 text-base text-center">
        {user.firstName} {user.lastName}
      </p>

      {/* Navigation Links */}
      <div className="w-full mt-6">
        {adminNavLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.path} end
              className={({ isActive }) =>
                `relative flex items-center gap-2 w-full py-2.5 pl-4 text-gray-400 hover:bg-primary/10 ${
                  isActive ? 'bg-primary/15 text-primary' : ''
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <p>{link.name}</p>
              {({ isActive }) =>
                isActive && (
                  <span className="w-1.5 h-full rounded-r bg-primary absolute right-0 top-0" />
                )
              }
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSidebar;
