import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getIsLoggedIn } from "../auth/authStorage.js";

export default function ProtectedRoute() {
  const location = useLocation();
  const isLoggedIn = getIsLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}


