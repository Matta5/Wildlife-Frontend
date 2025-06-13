import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../API/axiosClient";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { Upload, Camera, X, Loader2, Eye, MapPin } from "lucide-react";
import ObservationForm from "../components/ObservationForm";

export default function Recognition() {
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [showObservationForm, setShowObservationForm] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();

    const handleRecognition = async (e) => {
        e.preventDefault();

        if (!uploadFile) {
            toast.error("Please select a file to upload.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("ImageFile", uploadFile);

        try {
            console.log("Starting recognition for image:", uploadFile.name);
            const response = await axiosClient.post("/identify", formData);
            console.log("Recognition response:", response.data);

            if (response.data.success) {
                // Transform the backend response to match frontend expectations
                const mainResult = {
                    species: response.data.scientificName,
                    commonName: response.data.preferredEnglishName,
                    confidence: response.data.confidence / 2000, // Normalize confidence to 0-1 range
                    description: `Scientific name: ${response.data.scientificName}`,
                    taxonId: response.data.taxonId,
                    imageUrl: response.data.imageUrl
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

                setResults(allResults);
                
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
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select image files only (JPG, PNG, etc.)");
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File is too large. Maximum size is 10MB.");
            return;
        }

        setUploadFile(file);

        // Clean up previous preview URL to prevent memory leaks
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }

        setPreviewImage(URL.createObjectURL(file));
        setResults(null); // Clear previous results
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const clearFile = () => {
        setUploadFile(null);
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setPreviewImage(null);
        setResults(null);
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

    const handleMakeObservation = (result) => {
        if (!user) {
            toast.info("Please log in to make an observation.");
            navigate("/login", {
                state: {
                    returnTo: "/recognition",
                    observationData: { results, image: previewImage }
                }
            });
            return;
        }

        setSelectedResult(result);
        setShowObservationForm(true);
    };

    const handleViewSpecies = async (result, index) => {
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
                navigate(`/species/${species.id}`);
            } else {
                toast.info(`Species "${result.species}" not found in database. You can import it from iNaturalist.`);
            }
        } catch (error) {
            console.error("Error finding species:", error);
            toast.error("Failed to find species details.");
        }
    };

    const handleObservationFormClose = () => {
        setShowObservationForm(false);
        setSelectedResult(null);
    };

    const handleObservationFormSuccess = () => {
        toast.success("Observation created successfully!");
        handleObservationFormClose();
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto pt-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Wildlife Recognition</h1>
                    <p className="text-gray-400">Upload a photo to identify wildlife</p>
                </div>

                <div className="bg-zinc-900 rounded-lg shadow-2xl p-6 mb-6">
                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-500 bg-zinc-800'
                            : uploadFile
                                ? 'border-green-500 bg-zinc-800'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {previewImage ? (
                            <div className="space-y-4">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="max-h-64 mx-auto rounded-lg shadow-md"
                                />
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={clearFile}
                                        className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800 transition-colors"
                                        disabled={loading}
                                    >
                                        Choose Different Photo
                                    </button>
                                    <button
                                        onClick={handleRecognition}
                                        disabled={loading}
                                        className={`px-6 py-2 rounded font-semibold transition-colors ${loading
                                            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Identifying...
                                            </span>
                                        ) : (
                                            <>
                                                <Camera className="inline w-5 h-5 mr-2" />
                                                Identify Wildlife
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-white mb-2">
                                    Drag and drop a photo of wildlife here or click to select
                                </p>
                                <p className="text-sm text-gray-400 mb-4">
                                    JPG, PNG, WEBP up to 10MB
                                </p>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        disabled={loading}
                                    />
                                    <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                        Select File
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {results && (
                    <div className="bg-zinc-900 rounded-lg shadow-2xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Recognition Results</h2>

                        {Array.isArray(results) && results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div key={index} className={`border rounded-lg p-4 ${index === 0
                                        ? 'border-green-600 bg-green-900/20'
                                        : 'border-gray-700 bg-zinc-800'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    {result.commonName || result.species || 'Unknown species'}
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded font-medium">
                                                            Best Match
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-400 italic">
                                                    {result.species}
                                                </p>
                                            </div>
                                            {result.confidence && (
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${result.confidence > 0.8
                                                    ? 'bg-green-800 text-green-300'
                                                    : result.confidence > 0.6
                                                        ? 'bg-yellow-800 text-yellow-300'
                                                        : 'bg-red-800 text-red-300'
                                                    }`}>
                                                    {Math.round(result.confidence * 100)}% confident
                                                </span>
                                            )}
                                        </div>
                                        {result.commonName && result.commonName !== result.species && (
                                            <p className="text-gray-300 mb-2">
                                                <strong>Common name:</strong> {result.commonName}
                                            </p>
                                        )}
                                        {result.description && (
                                            <p className="text-gray-400 text-sm mb-4">{result.description}</p>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleViewSpecies(result, index)}
                                                className="flex items-center gap-2 px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors text-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Species
                                            </button>
                                            <button
                                                onClick={() => handleMakeObservation(result)}
                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Make Observation
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-300 mb-4">No wildlife recognized in this photo.</p>
                                <p className="text-sm text-gray-400">
                                    Try a clearer photo with clearly visible wildlife.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Observation Form Modal */}
            {showObservationForm && selectedResult && (
                <ObservationForm
                    onClose={handleObservationFormClose}
                    onSuccess={handleObservationFormSuccess}
                    prefillData={{
                        species: selectedResult,
                        imageFile: uploadFile,
                        previewImage: previewImage
                    }}
                />
            )}
        </div>
    );
}