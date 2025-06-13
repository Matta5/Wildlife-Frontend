import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import axiosClient from '../API/axiosClient';

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            showError("Wachtwoorden komen niet overeen.");
            setIsLoading(false);
            return;
        }

        // Additional validation
        if (formData.password.length < 6) {
            showError("Wachtwoord moet minimaal 6 karakters lang zijn.");
            setIsLoading(false);
            return;
        }

        if (formData.username.length < 3) {
            showError("Gebruikersnaam moet minimaal 3 karakters lang zijn.");
            setIsLoading(false);
            return;
        }

        try {
            await axiosClient.post("/users/simple", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            showSuccess("Account succesvol aangemaakt! Welkom!");
            
            // Reset form data
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            // Update authentication status after registration
            await checkAuthStatus();

            // Navigate to account page after successful signup and auth check
            navigate("/account");
        } catch (err) {
            let errorMessage = "Er is een fout opgetreden. Probeer het opnieuw.";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 409) {
                if (err.response.data.includes("Username")) {
                    errorMessage = "Deze gebruikersnaam is al in gebruik.";
                } else if (err.response.data.includes("Email")) {
                    errorMessage = "Dit e-mailadres is al in gebruik.";
                }
            } else if (err.response?.status === 0) {
                errorMessage = "Kan geen verbinding maken met de server. Controleer je internetverbinding.";
            }
            
            showError(errorMessage);
            console.error("Signup error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full">
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
                        minLength={3}
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
                        minLength={6}
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
                    className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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