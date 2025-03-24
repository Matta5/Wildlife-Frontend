import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user data based on the id parameter
        fetch(`https://localhost:7186/users/${id}`)
            .then((response) => {
                if (response.status === 404) {
                    navigate("*"); // Navigate to NoPage
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                return response.json();
            })
            .then((data) => setUser(data))
            .catch((err) => setError(err.message));
    }, [id, navigate]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{user.username}</h1>
            <p>Email: {user.email}</p>
            <img src={user.profilePicture} alt={`${user.username}'s profile`} />
            <p>Account Created: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    );
}
