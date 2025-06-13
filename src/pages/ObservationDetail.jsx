import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, User, Clock } from "lucide-react";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import GoogleMap from "../components/GoogleMap";
import ObservationForm from "../components/ObservationForm";

const ObservationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [observation, setObservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    const { getObservation, deleteObservation } = useObservations();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchObservation = async () => {
            try {
                setLoading(true);
                const data = await getObservation(id);
                setObservation(data);
            } catch (err) {
                setError("Failed to load observation");
                console.error("Error fetching observation:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchObservation();
        }
    }, [id, getObservation]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this observation? This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteObservation(id);
            navigate("/observations");
        } catch (error) {
            console.error("Failed to delete observation:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditFormClose = () => {
        setShowEditForm(false);
    };

    const handleEditFormSuccess = async () => {
        setShowEditForm(false);
        // Refresh the observation data
        try {
            const updatedObservation = await getObservation(id);
            setObservation(updatedObservation);
        } catch (err) {
            console.error("Error refreshing observation:", err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOwner = isAuthenticated && user?.id === observation?.userId;

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error || !observation) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="text-center py-12">
                    <p className="text-red-400 text-lg mb-4">{error || "Observation not found"}</p>
                    <button
                        onClick={() => navigate("/observations")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Observations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/observations")}
                        className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {observation.species?.commonName || "Unknown Species"}
                        </h1>
                        <p className="text-gray-400 italic">
                            {observation.species?.scientificName}
                        </p>
                    </div>
                </div>
                
                {isOwner && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700">
                        {observation.user?.profilePicture && (
                            <img
                                src={observation.user.profilePicture}
                                alt={observation.user.username}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-lg font-medium text-white">{observation.user?.username}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(observation.dateObserved)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(observation.dateObserved)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image */}
            {observation.imageUrl && (
                <div className="bg-zinc-900 rounded-lg overflow-hidden">
                    <img
                        src={observation.imageUrl}
                        alt={`${observation.species?.commonName || 'Species'} observation`}
                        className="w-full max-h-96 object-cover"
                    />
                </div>
            )}

            {/* Species Details */}
            <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Species Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-1">Common Name</h3>
                        <p className="text-white">{observation.species?.commonName || "Unknown"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-1">Scientific Name</h3>
                        <p className="text-white italic">{observation.species?.scientificName}</p>
                    </div>
                    {observation.species?.taxonomy && (
                        <>
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Class</h3>
                                <p className="text-white">{observation.species.taxonomy.class}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Order</h3>
                                <p className="text-white">{observation.species.taxonomy.order}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Family</h3>
                                <p className="text-white">{observation.species.taxonomy.family}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-300 mb-1">Genus</h3>
                                <p className="text-white">{observation.species.taxonomy.genus}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Observation Details */}
            <div className="bg-zinc-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Observation Details</h2>
                
                {/* Body/Notes */}
                {observation.body && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Notes</h3>
                        <p className="text-white whitespace-pre-wrap">{observation.body}</p>
                    </div>
                )}

                {/* Location */}
                {(observation.latitude && observation.longitude) && (
                    <div className="mb-6">
                        <GoogleMap 
                            latitude={observation.latitude} 
                            longitude={observation.longitude}
                            title={`${observation.species?.commonName || 'Species'} Observation`}
                        />
                    </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-1">Date Observed</h3>
                        <p className="text-white">{formatDate(observation.dateObserved)} at {formatTime(observation.dateObserved)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-1">Date Posted</h3>
                        <p className="text-white">{formatDate(observation.datePosted)} at {formatTime(observation.datePosted)}</p>
                    </div>
                </div>
            </div>

            {showEditForm && (
                <ObservationForm
                    observation={observation}
                    onClose={handleEditFormClose}
                    onSuccess={handleEditFormSuccess}
                />
            )}
        </div>
    );
};

export default ObservationDetail; 