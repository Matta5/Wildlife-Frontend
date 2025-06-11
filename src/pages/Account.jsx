import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useObservations } from "../contexts/ObservationsContext";
import { X, Pencil } from "lucide-react";

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

    const { logout } = useAuth();
    const { observations, stats } = useObservations();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:7186/auth/me", {
                    withCredentials: true,
                });
                setUser(res.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleUsernamePatch = async () => {
        try {
            const formData = new FormData();
            formData.append("Username", newUsername);
            await axios.patch("http://localhost:7186/users", formData, {
                withCredentials: true,
            });
            setUser(prev => ({ ...prev, username: newUsername }));
            setIsEditingName(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfilePictureUpload = async () => {
        try {
            if (!uploadFile) return;
            const formData = new FormData();
            formData.append("ProfilePicture", uploadFile);
            await axios.patch("http://localhost:7186/users", formData, {
                withCredentials: true,
            });
            setUser(prev => ({ ...prev, profilePicture: URL.createObjectURL(uploadFile) }));
            setIsEditingPicture(false);
        } catch (err) {
            console.error(err);
            setUploadError("Failed to upload profile picture.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
        try {
            await axios.delete("http://localhost:7186/users", {
                withCredentials: true,
            });
            logout();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setUploadFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setUploadFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Get recent observations for current user (last 5)
    const userObservations = observations.filter(obs => obs.userId === user?.id);
    const recentObservations = userObservations
        .sort((a, b) => new Date(b.dateObserved) - new Date(a.dateObserved))
        .slice(0, 5);

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
                    <div className="relative group cursor-pointer" onClick={() => setIsEditingPicture(true)}>
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-700 relative">
                            {user.profilePicture && (
                                <img
                                    src={user.profilePicture}
                                    className="h-full w-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil className="text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <button onClick={() => {
                                setNewUsername(user.username);
                                setIsEditingName(true);
                            }}>
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
                    <p className="text-4xl font-bold mt-2 text-white">{stats.totalObservations}</p>
                    <p className="text-sm text-gray-400 mt-1">Wildlife sightings recorded</p>
                </div>
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Unique Species</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{stats.uniqueSpeciesObserved}</p>
                    <p className="text-sm text-gray-400 mt-1">Different species observed</p>
                </div>
            </div>

            {/* Observations List */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold">Recent Observations</h2>
                <p className="text-sm text-gray-400 mb-4">Your latest wildlife sightings</p>
                {recentObservations.length === 0 ? (
                    <p className="text-gray-500">No observations yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {recentObservations.map((obs) => (
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
                <div className="mt-4 text-center">
                    <button
                        className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800"
                        onClick={() => navigate("/observations")}
                    >
                        View All
                    </button>
                </div>
            </div>

            {/* Username Edit Popup */}
            {isEditingName && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
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
                                className="px-4 py-2 border border-gray-600 rounded hover:bg-zinc-800"
                                onClick={() => setIsEditingName(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleUsernamePatch}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Picture Upload Modal */}
            {isEditingPicture && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div
                        className="bg-zinc-900 p-6 rounded-lg shadow-lg w-full max-w-md"
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
                                    <img src={previewImage} className="h-24 w-24 object-cover rounded-full" />
                                ) : (
                                    "Drag & drop image or click to browse"
                                )}
                            </label>
                        </div>
                        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border border-gray-600 rounded hover:bg-zinc-800"
                                onClick={() => setIsEditingPicture(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleProfilePictureUpload}
                                disabled={!uploadFile}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
