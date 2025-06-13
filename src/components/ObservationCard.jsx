import { useState } from "react";
import { Edit, Trash2, Calendar, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";

const ObservationCard = ({ observation, onEdit, onView }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteObservation } = useObservations();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this observation? This cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteObservation(observation.id);
        } catch (error) {
            console.error("Failed to delete observation:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = () => {
        navigate(`/observations/${observation.id}`);
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

    const isOwner = user?.id === observation.userId;

    return (
        <div 
            className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors cursor-pointer"
            onClick={(e) => {
                // Don't navigate if clicking on action buttons
                if (e.target.closest('button')) {
                    return;
                }
                handleView();
            }}
        >
            {/* User Info Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700">
                    {observation.user?.profilePicture && (
                        <img
                            src={observation.user.profilePicture}
                            alt={observation.user.username}
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>
                <div className="flex-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${observation.userId}`);
                        }}
                        className="text-sm font-medium text-white hover:text-blue-300 transition-colors"
                    >
                        {observation.user?.username}
                    </button>
                    <p className="text-xs text-gray-400">{formatDate(observation.dateObserved)} at {formatTime(observation.dateObserved)}</p>
                </div>
                {isOwner && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onEdit(observation)}
                            className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
                            title="Edit observation"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded disabled:opacity-50"
                            title="Delete observation"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Species Info */}
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-white mb-1">
                    {observation.species?.commonName || "Unknown Species"}
                </h3>
                <p className="text-sm text-gray-400 italic">
                    {observation.species?.scientificName}
                </p>
                {observation.species?.taxonomy?.family && (
                    <p className="text-xs text-gray-500">
                        {observation.species.taxonomy.family}
                    </p>
                )}
            </div>

            {/* Image */}
            {observation.imageUrl && (
                <div className="mb-3">
                    <img
                        src={observation.imageUrl}
                        alt={`${observation.species?.commonName || 'Species'} observation`}
                        className="w-full h-48 object-cover rounded"
                    />
                </div>
            )}

            {/* Body/Notes */}
            {observation.body && (
                <p className="text-gray-300 text-sm mb-3">
                    {observation.body}
                </p>
            )}

            {/* Location (if coordinates are available) */}
            {(observation.latitude && observation.longitude) && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}</span>
                </div>
            )}

            {/* Posted Date */}
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
                Posted {formatDate(observation.datePosted)}
            </div>
        </div>
    );
};

export default ObservationCard; 