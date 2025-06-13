import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Camera } from "lucide-react";
import axiosClient from "../API/axiosClient";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

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
        <div className="max-w-6xl mx-auto p-4 space-y-6 text-white">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 text-gray-300 rounded hover:bg-zinc-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-3xl font-bold">{user.username}'s Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                        <div className="flex items-start gap-6">
                            {user.profilePicture && (
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">{user.username}</h3>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p>
                                        <span className="text-gray-400">Member since:</span> {formatDate(user.dateCreated)}
                                    </p>
                                    {user.email && (
                                        <p>
                                            <span className="text-gray-400">Email:</span> {user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Recent Observations</h2>
                        {observations.length > 0 ? (
                            <div className="space-y-4">
                                {observations.map((observation) => (
                                    <div key={observation.id} className="bg-zinc-800 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            {observation.imageUrl && (
                                                <img
                                                    src={observation.imageUrl}
                                                    alt="Observation"
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-white">
                                                        {observation.species?.commonName || observation.species?.scientificName || 'Unknown Species'}
                                                    </h4>
                                                    <button
                                                        onClick={() => navigate(`/species/${observation.speciesId}`)}
                                                        className="text-blue-400 hover:text-blue-300 text-sm"
                                                    >
                                                        View Species
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-400 italic mb-2">
                                                    {observation.species?.scientificName}
                                                </p>
                                                {observation.body && (
                                                    <p className="text-gray-300 text-sm mb-2">{observation.body}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(observation.dateObserved)}
                                                    </div>
                                                    {observation.latitude && observation.longitude && (
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-300 mb-2">No observations yet</p>
                                <p className="text-sm text-gray-400">
                                    This user hasn't made any observations yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Statistics */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total Observations</span>
                                <span className="text-white font-semibold">{observations.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Member Since</span>
                                <span className="text-white font-semibold">{formatDate(user.dateCreated)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {observations.length > 0 && (
                        <div className="bg-zinc-900 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {observations.slice(0, 5).map((observation) => (
                                    <div key={observation.id} className="text-sm">
                                        <p className="text-white">
                                            Observed {observation.species?.commonName || observation.species?.scientificName}
                                        </p>
                                        <p className="text-gray-400">
                                            {formatDate(observation.dateObserved)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 