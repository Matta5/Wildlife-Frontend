import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../API/axiosClient";
import { useAuth } from "../contexts/AuthContext";
import { useObservations } from "../contexts/ObservationsContext";
import { X, Pencil } from "lucide-react";
import { toast } from 'react-toastify';
import { optimizeImage } from '../utils/imageOptimizer';
import ProfileImage from '../components/ProfileImage';

export default function AccountPage() {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingPicture, setIsEditingPicture] = useState(false);
    const [selectedObservation, setSelectedObservation] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newUsername, setNewUsername] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userObservations, setUserObservations] = useState([]);
    const [observationStats, setObservationStats] = useState({
        totalObservations: 0,
        uniqueSpeciesObserved: 0
    });

    const { logout } = useAuth();
    const navigate = useNavigate();

    // Separate effect for fetching user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await axiosClient.get("/auth/me");
                setUser(userRes.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (error.response?.status === 401) {
                    logout();
                } else {
                    toast.error("Failed to load user data. Please try again later.");
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []); // Only run once on mount

    // Separate effect for fetching observations
    useEffect(() => {
        const fetchUserObservations = async () => {
            if (!user?.id) return;

            try {
                const observationsRes = await axiosClient.get(`/observations/GetAllFromUser/${user.id}`);
                const observations = observationsRes.data || [];
                setUserObservations(observations);
                
                // Calculate stats
                const uniqueSpecies = new Set(observations.map(obs => obs.speciesId)).size;
                setObservationStats({
                    totalObservations: observations.length,
                    uniqueSpeciesObserved: uniqueSpecies
                });
            } catch (error) {
                console.error("Error fetching user observations:", error);
                if (error.response?.status !== 404) {
                    toast.error("Failed to load observations. Please try again later.");
                }
                setUserObservations([]);
                setObservationStats({
                    totalObservations: 0,
                    uniqueSpeciesObserved: 0
                });
            }
        };

        fetchUserObservations();
    }, [user?.id]); // Only run when user ID changes

    const handleUsernamePatch = async () => {
        if (!newUsername.trim()) {
            toast.error("Username cannot be empty.");
            return;
        }

        if (newUsername.length < 3) {
            toast.error("Username must be at least 3 characters long.");
            return;
        }

        if (newUsername === user.username) {
            setIsEditingName(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("Username", newUsername);
            await axiosClient.patch("/users", formData);
            setUser(prev => ({ ...prev, username: newUsername }));
            setIsEditingName(false);
            toast.success("Username updated successfully!");
        } catch (err) {
            let errorMessage = "Failed to update username. Please try again.";
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 409) {
                errorMessage = "This username is already taken.";
            } else if (err.response?.status === 0) {
                errorMessage = "Cannot connect to server. Check your internet connection.";
            }
            
            toast.error(errorMessage);
            console.error("Username patch error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfilePictureUpload = async () => {
        if (!uploadFile) {
            toast.error("Please select an image first.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("ProfilePicture", uploadFile);
            await axiosClient.patch("/users", formData);
            setUser(prev => ({ ...prev, profilePicture: URL.createObjectURL(uploadFile) }));
            setIsEditingPicture(false);
            setUploadFile(null);
            setPreviewImage(null);
            toast.success("Profile picture updated successfully!");
        } catch (err) {
            let errorMessage = "Failed to update profile picture. Please try again.";
            
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.status === 0) {
                errorMessage = "Cannot connect to server. Check your internet connection.";
            }
            
            toast.error(errorMessage);
            console.error("Profile picture upload error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
        try {
            await axiosClient.delete("/users");
            logout();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const optimizedFile = await optimizeImage(file);
            setUploadFile(optimizedFile);
            setPreviewImage(URL.createObjectURL(optimizedFile));
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const optimizedFile = await optimizeImage(file);
            setUploadFile(optimizedFile);
            setPreviewImage(URL.createObjectURL(optimizedFile));
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <p className="text-center text-white">Loading...</p>;
    }

    if (!user) {
        return <p className="text-center text-red-400">Could not load user. Please login again.</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 text-white">
            {/* Profile Card */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group cursor-pointer" 
                        onClick={() => setIsEditingPicture(true)}
                        role="button"
                        tabIndex={0}
                        aria-label="Edit profile picture"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsEditingPicture(true);
                            }
                        }}
                    >
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-700 relative">
                            {user.profilePicture && (
                                <ProfileImage
                                    src={user.profilePicture}
                                    alt={user.username}
                                    size="md"
                                    className="rounded-full"
                                />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil className="text-white" aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <button 
                                onClick={() => {
                                    setNewUsername(user.username);
                                    setIsEditingName(true);
                                }}
                                aria-label="Edit username"
                            >
                                <Pencil className="text-gray-400 hover:text-white w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-gray-400">{user.email}</p>
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            onClick={logout}
                        >
                            Logout
                        </button>
                        <button
                            className="border border-red-500 text-red-400 px-4 py-2 rounded hover:bg-red-900"
                            onClick={handleDeleteAccount}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Total Observations</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{observationStats.totalObservations}</p>
                    <p className="text-sm text-gray-400 mt-1">Wildlife sightings recorded</p>
                </div>
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Unique Species</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{observationStats.uniqueSpeciesObserved}</p>
                    <p className="text-sm text-gray-400 mt-1">Different species observed</p>
                </div>
            </div>

            {/* Observations List */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold">Recent Observations</h2>
                <p className="text-sm text-gray-400 mb-4">Your latest wildlife sightings</p>
                {userObservations.length === 0 ? (
                    <p className="text-gray-500">No observations yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {userObservations
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
                {userObservations.length > 5 && (
                <div className="mt-4 text-center">
                    <button
                        className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800"
                        onClick={() => navigate("/observations")}
                    >

                        View All
                    </button>
                </div>)}
            </div>

            {/* Username Edit Popup */}
            {isEditingName && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm border border-zinc-700/70">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Edit Username</h2>
                            <button onClick={() => setIsEditingName(false)}>
                                <X className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border border-gray-600 rounded hover:bg-zinc-800 disabled:opacity-50"
                                onClick={() => setIsEditingName(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleUsernamePatch}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Picture Upload Modal */}
            {isEditingPicture && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm border border-zinc-700/70"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Update Profile Picture</h2>
                            <button onClick={() => setIsEditingPicture(false)}>
                                <X className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-gray-600 p-4 rounded flex flex-col items-center justify-center gap-2 text-gray-400">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="profile-pic-upload"
                            />
                            <label htmlFor="profile-pic-upload" className="cursor-pointer">
                                {previewImage ? (
                                    <ProfileImage
                                        src={previewImage}
                                        alt="Preview"
                                        size="md"
                                        className="rounded-full"
                                    />
                                ) : (
                                    "Drag & drop image or click to browse"
                                )}
                            </label>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border border-gray-600 rounded hover:bg-zinc-800 disabled:opacity-50"
                                onClick={() => setIsEditingPicture(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleProfilePictureUpload}
                                disabled={!uploadFile || isSubmitting}
                            >
                                {isSubmitting ? "Uploading..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
