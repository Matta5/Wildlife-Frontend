import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../API/axiosClient";
import { useAuth } from "./AuthContext";

const ObservationsContext = createContext();

export const useObservations = () => {
    const context = useContext(ObservationsContext);
    if (!context) {
        throw new Error("useObservations must be used within an ObservationsProvider");
    }
    return context;
};

export const ObservationsProvider = ({ children }) => {
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalObservations: 0,
        uniqueSpeciesObserved: 0
    });
    
    const { user } = useAuth();

    // Fetch all observations (limit 30)
    const fetchObservations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get("/observations/explore?limit=30");
            setObservations(response.data);
            
            // Calculate stats for current user
            if (user?.id) {
                const userObservations = response.data.filter(obs => obs.userId === user.id);
                const uniqueSpecies = new Set(userObservations.map(obs => obs.speciesId)).size;
                setStats({
                    totalObservations: userObservations.length,
                    uniqueSpeciesObserved: uniqueSpecies
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch observations");
            console.error("Error fetching observations:", err);
        } finally {
            setLoading(false);
        }
    };

    // Create a new observation
    const createObservation = async (observationData, imageFile = null) => {
        setLoading(true);
        setError(null);
        try {
            let response;

            if (imageFile) {
                // Use multipart form data endpoint for observations with images
                const formData = new FormData();
                
                // Add observation data with correct field names (PascalCase for C# DTO)
                formData.append("SpeciesId", observationData.speciesId);
                formData.append("Body", observationData.body || "");
                if (observationData.dateObserved) {
                    formData.append("DateObserved", observationData.dateObserved);
                }
                if (observationData.latitude) {
                    formData.append("Latitude", observationData.latitude);
                }
                if (observationData.longitude) {
                    formData.append("Longitude", observationData.longitude);
                }
                
                // Add image
                formData.append("image", imageFile);

                response = await axiosClient.post("/observations", formData);
            } else {
                // Use JSON endpoint for observations without images
                const jsonData = {
                    speciesId: parseInt(observationData.speciesId),
                    body: observationData.body || "",
                    dateObserved: observationData.dateObserved || null,
                    latitude: observationData.latitude ? parseFloat(observationData.latitude) : null,
                    longitude: observationData.longitude ? parseFloat(observationData.longitude) : null
                };

                response = await axiosClient.post("/observations/simple", jsonData);
            }

            // Refresh observations after creating
            await fetchObservations();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create observation");
            console.error("Error creating observation:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get a single observation
    const getObservation = async (id) => {
        try {
            const response = await axiosClient.get(`/observations/${id}`);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch observation");
            console.error("Error fetching observation:", err);
            throw err;
        }
    };

    // Update an observation
    const updateObservation = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            // Convert string numbers to actual numbers or null
            const formattedData = {
                speciesId: updateData.speciesId ? parseInt(updateData.speciesId) : null,
                body: updateData.body,
                dateObserved: updateData.dateObserved || null,
                latitude: updateData.latitude ? parseFloat(updateData.latitude) : null,
                longitude: updateData.longitude ? parseFloat(updateData.longitude) : null
            };

            const response = await axiosClient.patch(`/observations/${id}`, formattedData);
            
            // Refresh observations after updating
            await fetchObservations();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update observation");
            console.error("Error updating observation:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update observation image
    const updateObservationImage = async (id, imageFile) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("image", imageFile);

            const response = await axiosClient.patch(`/observations/${id}/image`, formData);
            
            // Refresh observations after updating
            await fetchObservations();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update observation image");
            console.error("Error updating observation image:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete an observation
    const deleteObservation = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.delete(`/observations/${id}`);
            
            // Refresh observations after deleting
            await fetchObservations();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete observation");
            console.error("Error deleting observation:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch observations when component mounts
    useEffect(() => {
        fetchObservations();
    }, [user?.id]);

    const value = {
        observations,
        loading,
        error,
        stats,
        fetchObservations,
        createObservation,
        getObservation,
        updateObservation,
        updateObservationImage,
        deleteObservation,
    };

    return (
        <ObservationsContext.Provider value={value}>
            {children}
        </ObservationsContext.Provider>
    );
}; 