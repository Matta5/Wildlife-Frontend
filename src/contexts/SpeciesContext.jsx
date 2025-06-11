import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SpeciesContext = createContext();

export const useSpecies = () => {
    const context = useContext(SpeciesContext);
    if (!context) {
        throw new Error("useSpecies must be used within a SpeciesProvider");
    }
    return context;
};

export const SpeciesProvider = ({ children }) => {
    const [species, setSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popularSpecies, setPopularSpecies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [filterResults, setFilterResults] = useState([]);

    const BASE_URL = "http://localhost:7186";

    // Load popular species
    const loadPopularSpecies = useCallback(async (limit = 10) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/popular?limit=${limit}`);
            setPopularSpecies(response.data);
            return response.data;
        } catch (error) {
            console.error("Error loading popular species:", error);
            toast.error("Failed to load popular species");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Search species in local database
    const searchSpecies = useCallback(async (query, limit = 20) => {
        if (!query.trim()) {
            toast.error("Please enter a search term");
            return [];
        }

        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/search?q=${encodeURIComponent(query)}&limit=${limit}`);
            setSearchResults(response.data);
            toast.success(`Found ${response.data.length} species`);
            return response.data;
        } catch (error) {
            console.error("Search error:", error);
            if (error.response?.status === 400) {
                toast.error("Please enter a valid search term");
            } else {
                toast.error("Search failed. Please try again.");
            }
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Global search (iNaturalist + local)
    const globalSearch = useCallback(async (query, limit = 15) => {
        if (!query.trim()) {
            toast.error("Please enter a search term");
            return [];
        }

        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/find?q=${encodeURIComponent(query)}&limit=${limit}`);
            setSearchResults(response.data);
            toast.success(`Found ${response.data.length} species`);
            return response.data;
        } catch (error) {
            console.error("Global search error:", error);
            if (error.response?.status === 400) {
                toast.error("Please enter a valid search term");
            } else if (error.response?.status === 404) {
                toast.info("No species found with that search term");
                setSearchResults([]);
            } else {
                toast.error("Search failed. Please try again.");
            }
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get species by ID
    const getSpeciesById = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching species:", error);
            if (error.response?.status === 404) {
                toast.error("Species not found");
            } else {
                toast.error("Failed to fetch species details");
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Import species from iNaturalist
    const importSpecies = useCallback(async (taxonId) => {
        if (!taxonId.trim()) {
            toast.error("Please enter a valid taxon ID");
            return null;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${BASE_URL}/api/species/import/${taxonId}`);
            const importedSpecies = response.data;
            
            // Success message with species details
            const speciesName = importedSpecies.commonName || importedSpecies.scientificName;
            toast.success(`Successfully imported: ${speciesName}`);
            
            // Immediately add to popular species list (at the beginning)
            setPopularSpecies(prev => [importedSpecies, ...prev.slice(0, 9)]);
            
            // Also add to search results if we're currently viewing them
            setSearchResults(prev => {
                // Check if species is already in search results
                const exists = prev.some(s => s.id === importedSpecies.id);
                if (!exists) {
                    return [importedSpecies, ...prev];
                }
                return prev;
            });
            
            return importedSpecies;
        } catch (error) {
            console.error("Import error:", error);
            if (error.response?.status === 404) {
                toast.error("Taxon ID not found on iNaturalist");
            } else if (error.response?.status === 409) {
                toast.info("Species already exists in database");
            } else {
                toast.error("Failed to import species");
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by class
    const filterByClass = useCallback(async (className, limit = 20) => {
        if (!className) return [];
        
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/class/${className}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in class ${className}`);
            return response.data;
        } catch (error) {
            console.error("Class filter error:", error);
            toast.error("Failed to filter by class");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by order
    const filterByOrder = useCallback(async (orderName, limit = 20) => {
        if (!orderName) return [];
        
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/order/${orderName}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in order ${orderName}`);
            return response.data;
        } catch (error) {
            console.error("Order filter error:", error);
            toast.error("Failed to filter by order");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by family
    const filterByFamily = useCallback(async (familyName, limit = 20) => {
        if (!familyName) return [];
        
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/species/family/${familyName}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in family ${familyName}`);
            return response.data;
        } catch (error) {
            console.error("Family filter error:", error);
            toast.error("Failed to filter by family");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        species,
        loading,
        popularSpecies,
        searchResults,
        filterResults,
        loadPopularSpecies,
        searchSpecies,
        globalSearch,
        getSpeciesById,
        importSpecies,
        filterByClass,
        filterByOrder,
        filterByFamily,
        setSearchResults,
        setFilterResults
    };

    return (
        <SpeciesContext.Provider value={value}>
            {children}
        </SpeciesContext.Provider>
    );
}; 