import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
    const { isAuthenticated, logout, checkAuthStatus } = useAuth();
    const location = useLocation();

    // Force a re-check of auth status when the component mounts
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return (
        <div className="flex flex-col min-h-screen">
            <nav className="bg-black text-white fixed top-0 left-0 right-0 z-10 outline-1 outline-white">
                <div className="container mx-auto flex justify-between items-center py-4 px-50">
                    <a className="text-xl font-bold">Wildlife</a>
                    <ul className="flex space-x-4 font-medium">
                        <li>
                            <Link to="/"
                                className={`hover:underline ${location.pathname === "/" ? "underline font-bold" : ""}`}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/observations"
                                className={`hover:underline ${location.pathname === "/observations" ? "underline font-bold" : ""}`}
                            >
                                Observations
                            </Link>
                        </li>
                        <li>
                            <Link to="/species"
                                className={`hover:underline ${location.pathname === "/species" ? "underline font-bold" : ""}`}
                            >
                                Species
                            </Link>
                        </li>
                        <li>
                            <Link to="/recognition"
                                className={`hover:underline ${location.pathname === "/recognition" ? "underline font-bold" : ""}`}
                            >
                                Recognition
                            </Link>
                        </li>
                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link
                                        to="/Account"
                                        className={`hover:underline ${location.pathname === "/Account" ? "underline font-bold" : ""}`}
                                    >
                                        Account
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/Login"
                                        className={`px-4 py-2 bg-black outline-1 outline-white text-white rounded hover:bg-neutral-950 ${location.pathname === "/Login" ? "underline font-bold" : ""}`}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/SignUp"
                                        className={`px-4 py-2 bg-white text-black rounded hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 ${location.pathname === "/SignUp" ? "underline font-bold" : ""}`}
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            <div className="flex-grow mt-14 bg-black">
                <Outlet />
            </div>

            <footer className="bg-black text-white text-center py-4">
                <div className="container mx-auto">
                    <p>&copy; 2025 Wildlife. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;