import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-toastify';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { signup } = useAuth();

    const validateForm = () => {
        const newErrors = {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        };
        let isValid = true;

        // Username validation
        if (!formData.username) {
            newErrors.username = "Username is required";
            isValid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters long";
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
            isValid = false;
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const success = await signup({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            if (success) {
                toast.success("Account successfully created! Welcome!");
                
                // Reset form data
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });

                // Navigate to account page after successful signup
                navigate("/account");
            }
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error(err.response.data);
            } else if (!err.response || err.response?.status === 0) {
                toast.error("Cannot connect to server. Check your internet connection.");
            } else {
                toast.error(err.response?.data?.message || "An error occurred. Please try again.");
            }
            console.error("Signup error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full" data-testid="signup-form">
                <h1 className="text-center text-white text-2xl font-bold mb-6">Create an account</h1>
                <div className="mb-4">
                    <input
                        placeholder="Username"
                        type="text"
                        id="username"
                        name="username"
                        className={`w-full p-2 bg-black text-white border rounded ${errors.username ? 'border-red-500' : 'border-white'}`}
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isLoading}
                        data-testid="username-input"
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1" data-testid="username-error">{errors.username}</p>
                    )}
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Email"
                        type="text"
                        id="email"
                        name="email"
                        className={`w-full p-2 bg-black text-white border rounded ${errors.email ? 'border-red-500' : 'border-white'}`}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        data-testid="email-input"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1" data-testid="email-error">{errors.email}</p>
                    )}
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Password"
                        type="password"
                        id="password"
                        name="password"
                        className={`w-full p-2 bg-black text-white border rounded ${errors.password ? 'border-red-500' : 'border-white'}`}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        data-testid="password-input"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1" data-testid="password-error">{errors.password}</p>
                    )}
                </div>
                <div className="mb-4">
                    <input
                        placeholder="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`w-full p-2 bg-black text-white border rounded ${errors.confirmPassword ? 'border-red-500' : 'border-white'}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        data-testid="confirm-password-input"
                    />
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1" data-testid="confirm-password-error">{errors.confirmPassword}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    data-testid="signup-button"
                >
                    {isLoading ? "Creating account..." : "Create account"}
                </button>
                <p className="text-center mt-4">Already have account? <Link to="/Login" className="hover:underline" data-testid="login-link">Login</Link></p>
            </form>
        </div>
    );
};

export default SignUp;