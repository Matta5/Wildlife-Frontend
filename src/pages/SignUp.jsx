import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("https://localhost:7186/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                setSuccess("Sign-up successful!");
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Sign-up failed.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-112px)] bg-black text-white ">
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded border border-white max-w-md w-full">
                {error && <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500 text-white p-2 rounded mb-4">{success}</div>}
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
                    />
                </div>
                <button type="submit" className="w-full font-medium bg-white text-black hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200 py-2 rounded">Create account</button>
                <p className="text-center mt-4">Already have account? <Link to="/Login" className="hover:underline">Login</Link></p>
            </form>

        </div>
    );
};

export default SignUp;
