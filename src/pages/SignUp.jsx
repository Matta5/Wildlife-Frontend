import { useState } from "react";
import { toast } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosClient from '../API/axiosClient';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const notifySuccess = () => {
        toast.success("Sign-up successful!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            // Use your axiosClient instead of raw axios for consistent settings
            await axiosClient.post("/users/simple", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            // Notify user of success
            notifySuccess();

            // Reset form data
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            // Important: Update authentication status after registration
            await checkAuthStatus();

            // Navigate to account page after successful signup and auth check
            navigate("/Account");
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An error occurred. Please try again.");
                console.error("Signup error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full">
                {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
                <h1 className="text-center text-white text-2xl font-bold mb-6">Create an account</h1>
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
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Email"
                        type="email"
                        id="email"
                        name="email"
                        className="w-full p-2 bg-black text-white border border-white rounded"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full p-2 bg-black text-white border border-white rounded"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating account..." : "Create account"}
                </button>
                <p className="text-center mt-4">Already have account? <Link to="/Login" className="hover:underline">Login</Link></p>
            </form>
        </div>
    );
};

export default SignUp;