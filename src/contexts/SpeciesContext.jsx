import axiosClient from "../API/axiosClient";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
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
    const [error, setError] = useState(null);

    // Fetch popular species
    const fetchPopularSpecies = useCallback(async (limit = 10) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/popular?limit=${limit}`);
            setPopularSpecies(response.data);
            return response.data;
        } catch (error) {
            setError("Failed to fetch popular species");
            console.error("Error fetching popular species:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Search species
    const searchSpecies = useCallback(async (query, limit = 20) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/search?q=${encodeURIComponent(query)}&limit=${limit}`);
            setSearchResults(response.data);
            toast.success(`Found ${response.data.length} species`);
            return response.data;
        } catch (error) {
            setError("Failed to search species");
            console.error("Error searching species:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Find species (alternative search)
    const findSpecies = useCallback(async (query, limit = 20) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/find?q=${encodeURIComponent(query)}&limit=${limit}`);
            setSearchResults(response.data);
            
            // Check if any species were imported (we can't know for sure, but we can show a helpful message)
            if (response.data.length > 0) {
                toast.success(`Found ${response.data.length} species. Some may have been automatically imported from iNaturalist.`);
            } else {
                toast.info("No species found for this search term.");
            }
            
            return response.data;
        } catch (error) {
            setError("Failed to find species");
            console.error("Error finding species:", error);
            toast.error("Failed to search species. Please try again.");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get species by ID
    const getSpeciesById = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/${id}`);
            return response.data;
        } catch (error) {
            setError("Failed to fetch species");
            console.error("Error fetching species:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Import species from iNaturalist
    const importSpecies = useCallback(async (taxonId) => {
        try {
            setLoading(true);
            const response = await axiosClient.post(`/api/species/import/${taxonId}`);
            const importedSpecies = response.data;
            
            // Update popular species list
            setPopularSpecies(prev => [importedSpecies, ...prev.slice(0, -1)]);
            
            toast.success(`Successfully imported ${importedSpecies.commonName}`);
            return importedSpecies;
        } catch (error) {
            setError("Failed to import species");
            console.error("Error importing species:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by class
    const filterByClass = useCallback(async (className, limit = 20) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/class/${className}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in class ${className}`);
            return response.data;
        } catch (error) {
            setError("Failed to filter by class");
            console.error("Error filtering by class:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by order
    const filterByOrder = useCallback(async (orderName, limit = 20) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/order/${orderName}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in order ${orderName}`);
            return response.data;
        } catch (error) {
            setError("Failed to filter by order");
            console.error("Error filtering by order:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter by family
    const filterByFamily = useCallback(async (familyName, limit = 20) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/api/species/family/${familyName}?limit=${limit}`);
            setFilterResults(response.data);
            toast.success(`Found ${response.data.length} species in family ${familyName}`);
            return response.data;
        } catch (error) {
            setError("Failed to filter by family");
            console.error("Error filtering by family:", error);
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
        fetchPopularSpecies,
        searchSpecies,
        findSpecies,
        getSpeciesById,
        importSpecies,
        filterByClass,
        filterByOrder,
        filterByFamily,
        setSearchResults,
        setFilterResults,
        error
    };

    return (
        <SpeciesContext.Provider value={value}>
            {children}
        </SpeciesContext.Provider>
    );
}; 