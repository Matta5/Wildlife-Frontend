import { useState, useEffect } from "react";
import { X, Upload, Camera, Search, Eye, MapPin } from "lucide-react";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";
import SpeciesSearch from "./SpeciesSearch";
import CoordinatePicker from "./CoordinatePicker";
import axiosClient from "../API/axiosClient";
import { toast } from "react-toastify";

const ObservationForm = ({ observation = null, onClose, onSuccess, prefillData = null }) => {
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
    const [showRecognitionModal, setShowRecognitionModal] = useState(false);
    const [recognitionResults, setRecognitionResults] = useState(null);
    const [isRecognizing, setIsRecognizing] = useState(false);

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

    // Initialize form with prefill data from recognition
    useEffect(() => {
        if (prefillData) {
            // Set the image from recognition
            if (prefillData.imageFile) {
                setImageFile(prefillData.imageFile);
            }
            if (prefillData.previewImage) {
                setPreviewImage(prefillData.previewImage);
            }

            // Set species info if available
            if (prefillData.species) {
                const species = prefillData.species;
                setSelectedSpecies({
                    id: 0, // Temporary ID, will be resolved when user selects from search
                    scientificName: species.species,
                    commonName: species.commonName
                });
                
                // Pre-fill body with recognition info
                setFormData(prev => ({
                    ...prev,
                    body: `Identified as ${species.commonName || species.species} with ${Math.round(species.confidence * 100)}% confidence`
                }));
            }
        }
    }, [prefillData]);

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
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
            // Automatically trigger recognition when image is uploaded
            setTimeout(() => handleRecognition(), 100);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setPreviewImage(previewUrl);
            // Automatically trigger recognition when image is dropped
            setTimeout(() => handleRecognition(), 100);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            setError("You must be logged in to create an observation");
            return;
        }

        if (!selectedSpecies || !selectedSpecies.id) {
            setError("Please select a species from the search results");
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

    const handleRecognition = async () => {
        if (!imageFile) {
            toast.error("Please upload an image first.");
            return;
        }

        if (isRecognizing) {
            return; // Prevent multiple simultaneous calls
        }

        setIsRecognizing(true);
        const formData = new FormData();
        formData.append("ImageFile", imageFile);

        try {
            console.log("Starting recognition for image:", imageFile.name);
            const response = await axiosClient.post("/identify", formData);
            console.log("Recognition response:", response.data);

            if (response.data.success) {
                // Transform the backend response to match frontend expectations
                const mainResult = {
                    species: response.data.scientificName,
                    commonName: response.data.preferredEnglishName,
                    confidence: response.data.confidence / 2000, // Normalize confidence to 0-1 range
                    description: `Scientific name: ${response.data.scientificName}`
                };

                // Add alternative results
                const alternativeResults = response.data.alternativeResults?.map(alt => ({
                    species: alt.scientificName,
                    commonName: alt.preferredEnglishName,
                    confidence: alt.confidence / 2000, // Normalize confidence to 0-1 range
                    description: `Scientific name: ${alt.scientificName}`,
                    taxonId: alt.taxonId,
                    imageUrl: alt.imageUrl
                })) || [];

                // Combine main result with alternatives (top 5)
                const allResults = [mainResult, ...alternativeResults].slice(0, 5);

                setRecognitionResults(allResults);
                setShowRecognitionModal(true);
                
                // Show import message if species was imported
                if (response.data.importMessage) {
                    toast.success(response.data.importMessage);
                } else {
                    toast.success("Recognition completed successfully!");
                }
            } else {
                toast.error(response.data.errorMessage || "An error occurred during recognition.");
            }
        } catch (error) {
            console.error("Recognition error:", error);
            console.error("Response data:", error.response?.data);
            
            if (error.response?.status === 413) {
                toast.error("File is too large. Please try a smaller file.");
            } else if (error.response?.status === 415) {
                toast.error("Invalid file type. Please use images only.");
            } else if (error.code === 'ECONNREFUSED') {
                toast.error("Cannot connect to server.");
            } else {
                toast.error("An error occurred during recognition.");
            }
        } finally {
            setIsRecognizing(false);
        }
    };

    const findSpeciesByScientificName = async (scientificName) => {
        try {
            const response = await axiosClient.get(`/api/species/search?q=${encodeURIComponent(scientificName)}&limit=1`);
            if (response.data && response.data.length > 0) {
                return response.data[0];
            }
        } catch (error) {
            console.error("Error finding species:", error);
        }
        return null;
    };

    const handleSelectRecognitionResult = async (result) => {
        console.log("Select recognition result clicked:", result);
        try {
            let species = null;
            
            // If we have a taxon ID, try to import directly
            if (result.taxonId) {
                try {
                    const importResponse = await axiosClient.post(`/api/species/import/${result.taxonId}`);
                    if (importResponse.data) {
                        species = importResponse.data;
                        console.log("Species imported directly:", species);
                    }
                } catch (importError) {
                    console.log("Direct import failed, falling back to search:", importError);
                }
            }
            
            // Fallback to search if direct import failed or no taxon ID
            if (!species) {
                species = await findSpeciesByScientificName(result.species);
            }
            
            if (species) {
                setSelectedSpecies(species);
                setFormData(prev => ({
                    ...prev,
                    speciesId: species.id,
                    body: `Identified as ${result.commonName || result.species} with ${Math.round(result.confidence * 100)}% confidence`
                }));
                setShowRecognitionModal(false);
                toast.success(`Selected: ${result.commonName || result.species}`);
            } else {
                toast.info(`Species "${result.species}" not found in database. Please search manually.`);
            }
        } catch (error) {
            console.error("Error selecting species:", error);
            toast.error("Failed to select species.");
        }
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

                    {prefillData && (
                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500 rounded">
                            <p className="text-blue-400 text-sm">
                                <strong>Recognition Result:</strong> {prefillData.species?.commonName || prefillData.species?.species}
                                <br />
                                <span className="text-xs">Please search and select the correct species from the database.</span>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Species Search */}
                        <SpeciesSearch
                            onSpeciesSelect={handleSpeciesSelect}
                            selectedSpecies={selectedSpecies}
                            onClear={handleSpeciesClear}
                            initialSearchTerm={prefillData?.species?.species}
                        />

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Observation Image (Can be used for identification)
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
                                        {/* Identify Wildlife Button */}
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={handleRecognition}
                                                disabled={isRecognizing}
                                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                                                    isRecognizing
                                                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                            >
                                                {isRecognizing ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Identifying...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="w-4 h-4" />
                                                        {recognitionResults ? 'Retry Recognition' : 'Identify Wildlife'}
                                                    </>
                                                )}
                                            </button>
                                        </div>
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
                        <CoordinatePicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onCoordinatesChange={(lat, lng) => {
                                setFormData(prev => ({
                                    ...prev,
                                    latitude: lat,
                                    longitude: lng
                                }));
                            }}
                            onClear={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    latitude: "",
                                    longitude: ""
                                }));
                            }}
                        />

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

            {/* Recognition Results Modal */}
            {showRecognitionModal && recognitionResults && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-zinc-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Wildlife Recognition Results</h3>
                                <button
                                    onClick={() => setShowRecognitionModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recognitionResults.map((result, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${
                                        index === 0
                                            ? 'border-green-600 bg-green-900/20'
                                            : 'border-gray-700 bg-zinc-800'
                                    }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    {result.commonName || result.species || 'Unknown species'}
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded font-medium">
                                                            Best Match
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-400 italic">
                                                    {result.species}
                                                </p>
                                            </div>
                                            {result.confidence && (
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                                    result.confidence > 0.8
                                                        ? 'bg-green-800 text-green-300'
                                                        : result.confidence > 0.6
                                                            ? 'bg-yellow-800 text-yellow-300'
                                                            : 'bg-red-800 text-red-300'
                                                }`}>
                                                    {Math.round(result.confidence * 100)}% confident
                                                </span>
                                            )}
                                        </div>
                                        
                                        {result.description && (
                                            <p className="text-gray-400 text-sm mb-4">{result.description}</p>
                                        )}
                                        
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectRecognitionResult(result)}
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm cursor-pointer"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Select This Species
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRecognitionModal(false)}
                                    className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObservationForm; 