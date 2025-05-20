// pages/Login.js
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            // Gebruik de login functie van AuthContext in plaats van directe axios call
            const success = await login({
                username: formData.username,
                password: formData.password
            });

            if (success) {
                setSuccess("Login succesvol!");
                setFormData({
                    username: "",
                    password: ""
                });

                const from = location.state?.from?.pathname || "/Account";
                navigate(from, { replace: true });
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Er is een fout opgetreden. Probeer het opnieuw.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white ">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full">
                {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500 text-white p-2 rounded mb-4">{success}</div>}
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
                    className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded"
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