// App.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Observations from "./pages/Observations";
import NoPage from "./pages/NoPage";
import User from "./pages/User";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Recognition from "./pages/Recognition";
import Species from "./pages/Species";
import Account from "./pages/Account";
import "./index.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

// Route configuratie met AuthProvider
const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="observations" element={<Observations />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="users/:id" element={<User />} />
          <Route path="recognition" element={<Recognition />} />
          <Route path="species" element={<Species />} />

          {/* Beveiligde routes */}
          <Route path="account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

// Hoofdapp component
export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);