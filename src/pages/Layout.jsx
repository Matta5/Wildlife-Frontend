import { Outlet, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const Layout = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <nav className="bg-black text-white fixed top-0 left-0 right-0 z-10">
                <div className="container mx-auto flex justify-between items-center py-4 px-6">
                    <a className="text-xl font-bold">Wildlife</a>
                    <ul className="flex space-x-4">
                        <li>
                            <Link to="/" className="hover:underline">Home</Link>
                        </li>
                        <li>
                            <Link to="/Observations" className="hover:underline">Observations</Link>
                        </li>
                        <li>
                            <Link to="/Species" className="hover:underline">Species</Link>
                        </li>
                        {isLoggedIn ? (
                            <li>
                                <Link to="/User" className="hover:underline">Account</Link>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link to="/Login" className="hover:underline">Login</Link>
                                </li>
                                <li>
                                    <Link to="/SignUp" className="hover:underline">Sign Up</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            <div className="flex-grow mt-16">
                <Outlet />
            </div>

            <footer className="bg-black text-white text-center py-4">
                <div className="container mx-auto">
                    <p>&copy; 2023 Wildlife. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;