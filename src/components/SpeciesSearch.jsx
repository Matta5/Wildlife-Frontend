import { useState, useEffect } from "react";
import { Search, Camera, Upload, X } from "lucide-react";
import { useSpecies } from "../contexts/SpeciesContext";
import axios from "axios";

const SpeciesSearch = ({ onSpeciesSelect, selectedSpecies, onClear }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [identifyImage, setIdentifyImage] = useState(null);
    const [identifyPreview, setIdentifyPreview] = useState(null);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [identificationResult, setIdentificationResult] = useState(null);

    const { searchSpecies, globalSearch } = useSpecies();
    const baseURL = "http://localhost:7186";

    // Search species when user types
    useEffect(() => {
        const searchTimeout = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const results = await globalSearch(searchTerm, 10);
                    setSearchResults(results);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout);
    }, [searchTerm, globalSearch]);

    // Handle species identification
    const handleIdentifyImage = async (file) => {
        if (!file) return;

        setIsIdentifying(true);
        setIdentificationResult(null);

        try {
            const formData = new FormData();
            formData.append("Image", file);

            const response = await axios.post(`${baseURL}/identify`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const result = response.data;
            setIdentificationResult(result);

            if (result.success && result.preferredEnglishName) {
                // Auto-select the identified species if found
                const identifiedSpecies = searchResults.find(
                    species => species.commonName?.toLowerCase() === result.preferredEnglishName.toLowerCase() ||
                               species.scientificName?.toLowerCase() === result.scientificName?.toLowerCase()
                );

                if (identifiedSpecies) {
                    onSpeciesSelect(identifiedSpecies);
                }
            }
        } catch (error) {
            console.error("Identification error:", error);
            setIdentificationResult({
                success: false,
                errorMessage: "Failed to identify species. Please try again."
            });
        } finally {
            setIsIdentifying(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setIdentifyImage(file);
            setIdentifyPreview(URL.createObjectURL(file));
            handleIdentifyImage(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setIdentifyImage(file);
            setIdentifyPreview(URL.createObjectURL(file));
            handleIdentifyImage(file);
        }
    };

    const handleSpeciesSelect = (species) => {
        onSpeciesSelect(species);
        setSearchTerm(species.commonName || species.scientificName);
        setShowResults(false);
        setSearchResults([]);
    };

    const handleClear = () => {
        setSearchTerm("");
        setSearchResults([]);
        setShowResults(false);
        setIdentifyImage(null);
        setIdentifyPreview(null);
        setIdentificationResult(null);
        onClear?.();
    };

    return (
        <div className="space-y-4">
            {/* Species Search */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Species *
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search for a species..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                        disabled={isIdentifying}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-50 w-full bg-zinc-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {searchResults.map((species) => (
                            <div
                                key={species.id}
                                onClick={() => handleSpeciesSelect(species)}
                                className="p-3 hover:bg-zinc-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                            >
                                <div className="flex items-center gap-3">
                                    {species.imageUrl && (
                                        <img
                                            src={species.imageUrl}
                                            alt={species.commonName}
                                            className="w-10 h-10 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <p className="text-white font-medium">
                                            {species.commonName}
                                        </p>
                                        <p className="text-gray-400 text-sm italic">
                                            {species.scientificName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Selected Species Display */}
                {selectedSpecies && (
                    <div className="mt-3 p-3 bg-zinc-700 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectedSpecies.imageUrl && (
                                    <img
                                        src={selectedSpecies.imageUrl}
                                        alt={selectedSpecies.commonName}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        {selectedSpecies.commonName}
                                    </p>
                                    <p className="text-gray-400 text-sm italic">
                                        {selectedSpecies.scientificName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClear}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Species Identification */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-identify Species (Optional)
                </label>
                <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {identifyPreview ? (
                        <div className="relative">
                            <img
                                src={identifyPreview}
                                alt="Identification preview"
                                className="max-h-32 mx-auto rounded"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIdentifyImage(null);
                                    setIdentifyPreview(null);
                                    setIdentificationResult(null);
                                }}
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
                                id="identify-upload"
                            />
                            <label htmlFor="identify-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <Camera className="w-8 h-8" />
                                    <span>Upload image to auto-identify species</span>
                                    <span className="text-sm">Drag & drop or click to browse</span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                {/* Identification Results */}
                {isIdentifying && (
                    <div className="mt-2 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-sm text-gray-400 mt-1">Identifying species...</p>
                    </div>
                )}

                {identificationResult && (
                    <div className={`mt-2 p-3 rounded-lg ${
                        identificationResult.success 
                            ? 'bg-green-900/20 border border-green-500' 
                            : 'bg-red-900/20 border border-red-500'
                    }`}>
                        {identificationResult.success ? (
                            <div>
                                <p className="text-green-400 font-medium">
                                    Identified: {identificationResult.preferredEnglishName}
                                </p>
                                <p className="text-gray-400 text-sm italic">
                                    {identificationResult.scientificName}
                                </p>
                                {identificationResult.confidence && (
                                    <p className="text-gray-400 text-sm">
                                        Confidence: {(identificationResult.confidence * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-red-400">
                                {identificationResult.errorMessage || "Failed to identify species"}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeciesSearch; 