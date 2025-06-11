import { useState } from "react";
import { Plus, Search, Filter, Calendar, MapPin, X } from "lucide-react";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";
import ObservationCard from "../components/ObservationCard";
import ObservationForm from "../components/ObservationForm";
import LoadingSpinner from "../components/LoadingSpinner";

const Observations = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingObservation, setEditingObservation] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterLocation, setFilterLocation] = useState("");

    const { observations, loading, error, stats } = useObservations();
    const { isAuthenticated } = useAuth();

    const handleCreateNew = () => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
            return;
        }
        setEditingObservation(null);
        setShowForm(true);
    };

    const handleEdit = (observation) => {
        setEditingObservation(observation);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingObservation(null);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingObservation(null);
    };

    // Filter observations based on search and filters
    const filteredObservations = observations.filter(obs => {
        const matchesSearch = !searchTerm || 
            obs.species?.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obs.species?.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obs.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            obs.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDate = !filterDate || 
            obs.dateObserved?.startsWith(filterDate);
        
        const matchesLocation = !filterLocation || 
            (obs.latitude && obs.longitude && 
             `${obs.latitude}, ${obs.longitude}`.includes(filterLocation.toLowerCase()));
        
        return matchesSearch && matchesDate && matchesLocation;
    });

    if (loading && observations.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Wildlife Observations</h1>
                    <p className="text-gray-400 mt-1">
                        Discover wildlife sightings from the community
                    </p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {isAuthenticated ? "New Observation" : "Login to Share"}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">Total Observations</h3>
                    <p className="text-3xl font-bold text-white">{observations.length}</p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">Unique Species</h3>
                    <p className="text-3xl font-bold text-white">
                        {new Set(observations.map(obs => obs.speciesId)).size}
                    </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">This Month</h3>
                    <p className="text-3xl font-bold text-white">
                        {observations.filter(obs => {
                            const obsDate = new Date(obs.dateObserved);
                            const now = new Date();
                            return obsDate.getMonth() === now.getMonth() && 
                                   obsDate.getFullYear() === now.getFullYear();
                        }).length}
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-zinc-900 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-gray-300">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Search & Filters</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search species, notes, or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Filter by coordinates..."
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-10 py-2 text-white focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Observations Grid */}
            {filteredObservations.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        {observations.length === 0 ? (
                            <>
                                <p className="text-xl mb-2">No observations yet</p>
                                <p>Be the first to share a wildlife sighting!</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl mb-2">No observations match your filters</p>
                                <p>Try adjusting your search criteria or filters.</p>
                            </>
                        )}
                    </div>
                    {observations.length === 0 && (
                        <button
                            onClick={handleCreateNew}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                            {isAuthenticated ? "Create Your First Observation" : "Login to Share"}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredObservations.map((observation) => (
                        <ObservationCard
                            key={observation.id}
                            observation={observation}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Observation Form Modal */}
            {showForm && (
                <ObservationForm
                    observation={editingObservation}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default Observations;