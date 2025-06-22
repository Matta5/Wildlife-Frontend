import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Camera } from "lucide-react";
import axiosClient from "../API/axiosClient";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import ProfileImage from '../components/ProfileImage';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                
                // Check if user is viewing their own profile
                if (currentUser && currentUser.id === parseInt(id)) {
                    navigate('/account');
                    return;
                }

                // Fetch user data
                const userResponse = await axiosClient.get(`/users/${id}`);
                setUser(userResponse.data);

                // Fetch user's observations
                const observationsResponse = await axiosClient.get(`/observations/GetAllFromUser/${id}`);
                setObservations(observationsResponse.data || []);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user profile");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, currentUser, navigate]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <LoadingSpinner message="Loading user profile..." />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
                    <p className="text-gray-400 mb-6">{error || "The user you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 text-white">
            {/* Profile Card */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-700">
                            {user.profilePicture && (
                                <ProfileImage
                                    src={user.profilePicture}
                                    alt={user.username}
                                    size="md"
                                    className="rounded-full"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                        </div>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Total Observations</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{observations.length}</p>
                    <p className="text-sm text-gray-400 mt-1">Wildlife sightings recorded</p>
                </div>
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Unique Species</h2>
                    <p className="text-4xl font-bold mt-2 text-white">
                        {new Set(observations.map(obs => obs.speciesId)).size}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Different species observed</p>
                </div>
            </div>

            {/* Observations List */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold">Recent Observations</h2>
                <p className="text-sm text-gray-400 mb-4">Latest wildlife sightings</p>
                {observations.length === 0 ? (
                    <p className="text-gray-500">No observations yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {observations
                            .sort((a, b) => new Date(b.dateObserved) - new Date(a.dateObserved))
                            .slice(0, 5)
                            .map((obs) => (
                            <li
                                key={obs.id}
                                className="p-4 border border-gray-700 rounded hover:bg-zinc-800 cursor-pointer"
                                onClick={() => navigate(`/observations/${obs.id}`)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-medium text-white">{obs.species?.commonName || "Unknown Species"}</h3>
                                        <p className="text-sm text-gray-400">{formatDate(obs.dateObserved)}</p>
                                        {(obs.latitude && obs.longitude) && (
                                            <p className="text-sm text-gray-500">{obs.latitude.toFixed(4)}, {obs.longitude.toFixed(4)}</p>
                                        )}
                                    </div>
                                    <button className="text-blue-400 hover:underline">View</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {observations.length > 5 && (
                    <div className="mt-4 text-center">
                        <button
                            className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800"
                            onClick={() => navigate("/observations")}
                        >
                            View All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 