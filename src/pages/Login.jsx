// pages/Login.js
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const success = await login({
                username: formData.username,
                password: formData.password
            });

            if (success) {
                toast.success("Login succesvol! Welkom terug!");
                setFormData({
                    username: "",
                    password: ""
                });

                const from = location.state?.from?.pathname || "/account";
                navigate(from, { replace: true });
            }
        } catch (err) {
            let errorMessage = "Er is een fout opgetreden. Probeer het opnieuw.";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = "Ongeldige gebruikersnaam of wachtwoord.";
            } else if (err.response?.status === 0) {
                errorMessage = "Kan geen verbinding maken met de server. Controleer je internetverbinding.";
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white ">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full">
                <h1 className="text-center text-white text-2xl font-bold mb-6">Login to your account</h1>
                <div className="mb-4">
                    <input
                        placeholder="Username"
                        type="text"
                        id="username"
                        name="username"
                        className="w-full p-2 bg-black text-white border border-white rounded"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Password"
                        type="password"
                        id="password"
                        name="password"
                        className="w-full p-2 bg-black text-white border border-white rounded"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Bezig met inloggen..." : "Login"}
                </button>
                <p className="text-center mt-4">Don't have an account yet? <Link to="/SignUp" className="hover:underline">Sign Up</Link></p>
            </form>
        </div>
    );
};

export default Login;