import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import axiosClient from "../API/axiosClient";
import { toast } from "react-toastify";

const SpeciesSearch = ({ onSpeciesSelect, selectedSpecies, onClear, initialSearchTerm = "" }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        // Clear any existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        // Don't search if the term is too short
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        // Set a new timeout to search after user stops typing
        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/api/species/search?q=${encodeURIComponent(searchTerm)}`);
                setResults(response.data || []);
                setShowResults(true);
            } catch (error) {
                console.error("Search error:", error);
                toast.error("Failed to search species");
            } finally {
                setLoading(false);
            }
        }, 300); // Wait 300ms after user stops typing

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchTerm]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (!value) {
            setResults([]);
            setShowResults(false);
        }
    };

    const handleSelectSpecies = (species) => {
        onSpeciesSelect(species);
        setSearchTerm(species.commonName || species.scientificName);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Species *
            </label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Search for a species..."
                    className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                    onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                />
                {selectedSpecies && (
                    <button
                        onClick={() => {
                            onClear();
                            setSearchTerm("");
                            setResults([]);
                            setShowResults(false);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((species) => (
                        <button
                            key={species.id}
                            onClick={() => handleSelectSpecies(species)}
                            className="w-full text-left px-4 py-2 hover:bg-zinc-700 focus:outline-none focus:bg-zinc-700"
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
                                    <div className="text-white">{species.commonName}</div>
                                    <div className="text-sm text-gray-400 italic">{species.scientificName}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected Species Display */}
            {selectedSpecies && !showResults && (
                <div className="mt-3 p-3 bg-zinc-700 rounded-lg">
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
                </div>
            )}

            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
};

export default SpeciesSearch; 