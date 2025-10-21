import React, { useEffect } from "react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";

const Layout = () => {
  const { isAdmin, fetchIsAdmin } = useAppContext();
  const navigate = useNavigate();

  // Fetch admin status on mount
  useEffect(() => {
    fetchIsAdmin();
  }, []); // no dependency needed

  // Redirect non-admin users after fetch
  useEffect(() => {
    if (isAdmin === false) {
      navigate("/"); // redirect non-admins to home
    }
  }, [isAdmin, navigate]);

  // Show loading until admin status is determined
  if (isAdmin === null) {
    return <Loading />;
  }

  // Show admin panel only if user is admin
  return isAdmin ? (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  ) : null; // null because redirect already happens
};

export default Layout;
