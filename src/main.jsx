// App.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Observations from "./pages/Observations";
import ObservationDetail from "./pages/ObservationDetail";
import NoPage from "./pages/NoPage";
import User from "./pages/User";
import UserDetail from "./pages/UserDetail";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Recognition from "./pages/Recognition";
import Species from "./pages/Species";
import SpeciesDetail from "./pages/SpeciesDetail";
import Account from "./pages/Account";
import "./index.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SpeciesProvider } from "./contexts/SpeciesContext";
import { ObservationsProvider } from "./contexts/ObservationsContext";
import { ToastProvider } from "./contexts/ToastContext";

// Beveiligde route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect naar login met een returnUrl om na login terug te keren
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public only route component (voor login/signup)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (isAuthenticated) {
    // Redirect naar account als gebruiker al ingelogd is
    return <Navigate to="/account" replace />;
  }

  return children;
};

// Route configuratie met AuthProvider
const AppRoutes = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="observations" element={
              <SpeciesProvider>
                <ObservationsProvider>
                  <Observations />
                </ObservationsProvider>
              </SpeciesProvider>
            } />
            <Route path="observations/:id" element={
              <SpeciesProvider>
                <ObservationsProvider>
                  <ObservationDetail />
                </ObservationsProvider>
              </SpeciesProvider>
            } />
            <Route path="login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="signup" element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            } />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="recognition" element={
              <ObservationsProvider>
                <Recognition />
              </ObservationsProvider>
            } />
            <Route path="species" element={
              <SpeciesProvider>
                <Species />
              </SpeciesProvider>
            } />
            <Route path="species/:id" element={
              <SpeciesProvider>
                <SpeciesDetail />
              </SpeciesProvider>
            } />

            {/* Beveiligde routes */}
            <Route path="account" element={
              <ProtectedRoute>
                <ObservationsProvider>
                  <Account />
                </ObservationsProvider>
              </ProtectedRoute>
            } />

            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
};

// Hoofdapp component
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);