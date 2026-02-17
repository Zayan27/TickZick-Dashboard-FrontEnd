import React, { useEffect, useState } from "react";
import { Spin } from 'antd';
import { Navigate, useLocation } from "react-router-dom";
import { DataService } from "../../config/dataService/dataService";
import { getItem, setItem, removeItem } from "../../utility/localStorageControl";

export default function ProtectedRoute({ children, allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  const location = useLocation();

  // Correct tokens based on role
  const adminToken = getItem("admin_token");
  const organizerToken = getItem("organizer_token");
  const savedRole = getItem("auth_role");

  // Pick correct token for validation
  const token = savedRole === "admin" ? adminToken : organizerToken;

  useEffect(() => {
    async function validate() {
      /** No token → not authenticated **/
      if (!token || !savedRole) {
        setValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await DataService.get(
          `/auth/validate-token?token=${token}`
        );

        if (res?.data?.success) {
          const backendRole = res.data.type;

          // Role must match token type
          if (backendRole !== savedRole) {
            removeSession();
          } else {
            setItem("auth_success", true);
            setItem("auth_role", backendRole);
            setItem("auth_user", res.data.user);

            setValid(true);
          }
        } else {
          removeSession();
        }
      } catch {
        removeSession();
      }

      setLoading(false);
    }

    validate();
  }, []);

  function removeSession() {
    removeItem("admin_token");
    removeItem("organizer_token");
    removeItem("auth_role");
    removeItem("auth_user");
    removeItem("auth_success");
    setValid(false);
  }

  /** LOADING STATE **/
  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-[#1b1d2a]">
        <Spin size="large" />
      </div>
    );

  /** NOT VALID → Redirect to relevant login **/
  if (!valid) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/auth/admin/login" replace />;
    }
    if (location.pathname.startsWith("/organizer")) {
      return <Navigate to="/auth/organizer/login" replace />;
    }
    return <Navigate to="/auth/organizer/login" replace />;
  }

  /** ROLE RESTRICTION **/
  if (savedRole !== allowedRole) {
    return <Navigate to={`/auth/${savedRole}/login`} replace />;
  }

  return children;
}