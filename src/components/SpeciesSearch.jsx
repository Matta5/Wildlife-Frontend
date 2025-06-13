import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import axiosClient from "../API/axiosClient";

const SpeciesSearch = ({ onSpeciesSelect, selectedSpecies, onClear, initialSearchTerm = "" }) => {
    const [query, setQuery] = useState(initialSearchTerm);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (initialSearchTerm) {
            setQuery(initialSearchTerm);
            handleSearch();
        }
    }, [initialSearchTerm]);

    const handleSearch = async () => {
        if (query.trim().length < 2) return;

        setIsSearching(true);
        try {
            const response = await axiosClient.get(`/api/species/search?q=${encodeURIComponent(query.trim())}&limit=10`);
            setResults(response.data || []);
            setShowResults(true);
        } catch (error) {
            console.error("Error searching species:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSpeciesSelect = (species) => {
        onSpeciesSelect(species);
        setQuery(species.commonName || species.scientificName);
        setShowResults(false);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setShowResults(false);
        onClear();
    };

    return (
        <div className="relative">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Species *
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search for a species..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                    {!isSearching && query.trim().length >= 2 && (
                        <button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {showResults && results.length > 0 && (
                    <div className="absolute z-50 w-full bg-zinc-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {results.map((species) => (
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
        </div>
    );
};

export default SpeciesSearch; 