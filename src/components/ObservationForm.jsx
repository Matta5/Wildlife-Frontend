import { useState, useEffect } from "react";
import { X, Upload, Camera } from "lucide-react";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";
import SpeciesSearch from "./SpeciesSearch";

const ObservationForm = ({ observation = null, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        speciesId: "",
        body: "",
        dateObserved: new Date().toISOString().split('T')[0],
        latitude: "",
        longitude: ""
    });
    
    const [selectedSpecies, setSelectedSpecies] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { createObservation, updateObservation, updateObservationImage } = useObservations();
    const { user, isAuthenticated } = useAuth();

    // Initialize form with observation data if editing
    useEffect(() => {
        if (observation) {
            setFormData({
                speciesId: observation.speciesId || "",
                body: observation.body || "",
                dateObserved: observation.dateObserved ? new Date(observation.dateObserved).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                latitude: observation.latitude || "",
                longitude: observation.longitude || ""
            });
            
            // Set selected species if available
            if (observation.species) {
                setSelectedSpecies(observation.species);
            }
            
            if (observation.imageUrl) {
                setPreviewImage(observation.imageUrl);
            }
        }
    }, [observation]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSpeciesSelect = (species) => {
        setSelectedSpecies(species);
        setFormData(prev => ({
            ...prev,
            speciesId: species.id
        }));
    };

    const handleSpeciesClear = () => {
        setSelectedSpecies(null);
        setFormData(prev => ({
            ...prev,
            speciesId: ""
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            setError("You must be logged in to create an observation");
            return;
        }

        if (!selectedSpecies) {
            setError("Please select a species");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            if (observation) {
                // Update existing observation
                await updateObservation(observation.id, formData);
                if (imageFile) {
                    await updateObservationImage(observation.id, imageFile);
                }
            } else {
                // Create new observation
                await createObservation(formData, imageFile);
            }
            
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save observation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setPreviewImage(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {observation ? "Edit Observation" : "New Observation"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {!isAuthenticated && (
                        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded">
                            <p className="text-yellow-400 text-sm">
                                You must be logged in to create observations. 
                                <button 
                                    onClick={() => window.location.href = '/login'}
                                    className="ml-2 underline hover:no-underline"
                                >
                                    Login here
                                </button>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Species Search */}
                        <SpeciesSearch
                            onSpeciesSelect={handleSpeciesSelect}
                            selectedSpecies={selectedSpecies}
                            onClear={handleSpeciesClear}
                        />

                        {/* Date Observed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date Observed *
                            </label>
                            <input
                                type="date"
                                name="dateObserved"
                                value={formData.dateObserved}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Coordinates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 40.7128"
                                    className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    placeholder="e.g., -74.0060"
                                    className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Body/Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="body"
                                value={formData.body}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Describe your observation, behavior notes, habitat details, etc."
                                className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Observation Image
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="max-h-48 mx-auto rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Camera className="w-8 h-8" />
                                                <span>Click to upload or drag and drop</span>
                                                <span className="text-sm">PNG, JPG up to 10MB</span>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isAuthenticated}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Saving..." : (observation ? "Update" : "Create")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ObservationForm; 