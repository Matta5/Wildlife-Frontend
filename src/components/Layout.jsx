import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Menu, X } from "lucide-react";

const Layout = () => {
    const { isAuthenticated, logout, checkAuthStatus } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Check auth status when the component mounts
    useEffect(() => {
        checkAuthStatus();
    }, []); // Remove checkAuthStatus from dependencies to prevent infinite loops

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <nav className="bg-black text-white fixed top-0 left-0 right-0 z-10 outline-1 outline-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <a className="text-xl font-bold">Wildlife</a>
                        
                        {/* Hamburger menu button */}
                        <button 
                            className="md:hidden p-2 hover:bg-gray-800 rounded"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Desktop menu */}
                        <ul className="hidden md:flex space-x-4 font-medium items-center">
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
                                    <li>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-1 hover:underline text-gray-300 hover:text-white transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
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

                    {/* Mobile menu */}
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                        <ul className="pt-4 pb-3 space-y-3 font-medium">
                            <li>
                                <Link to="/"
                                    className={`block hover:underline ${location.pathname === "/" ? "underline font-bold" : ""}`}
                                    onClick={closeMenu}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/observations"
                                    className={`block hover:underline ${location.pathname === "/observations" ? "underline font-bold" : ""}`}
                                    onClick={closeMenu}
                                >
                                    Observations
                                </Link>
                            </li>
                            <li>
                                <Link to="/species"
                                    className={`block hover:underline ${location.pathname === "/species" ? "underline font-bold" : ""}`}
                                    onClick={closeMenu}
                                >
                                    Species
                                </Link>
                            </li>
                            <li>
                                <Link to="/recognition"
                                    className={`block hover:underline ${location.pathname === "/recognition" ? "underline font-bold" : ""}`}
                                    onClick={closeMenu}
                                >
                                    Recognition
                                </Link>
                            </li>
                            {isAuthenticated ? (
                                <>
                                    <li>
                                        <Link
                                            to="/Account"
                                            className={`block hover:underline ${location.pathname === "/Account" ? "underline font-bold" : ""}`}
                                            onClick={closeMenu}
                                        >
                                            Account
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                closeMenu();
                                                logout();
                                            }}
                                            className="flex items-center gap-1 hover:underline text-gray-300 hover:text-white transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/Login"
                                            className={`block px-4 py-2 bg-black outline-1 outline-white text-white rounded hover:bg-neutral-950 ${location.pathname === "/Login" ? "underline font-bold" : ""}`}
                                            onClick={closeMenu}
                                        >
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/SignUp"
                                            className={`block px-4 py-2 bg-white text-black rounded hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 ${location.pathname === "/SignUp" ? "underline font-bold" : ""}`}
                                            onClick={closeMenu}
                                        >
                                            Sign Up
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="flex-grow mt-14 bg-black">
                <Outlet />
            </div>

            <footer className="bg-black text-white text-center py-4">
                <div className="container mx-auto px-4">
                    <p>&copy; 2025 Wildlife. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;