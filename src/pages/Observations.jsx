import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, MapPin, X, Eye, User } from "lucide-react";
import { useObservations } from "../contexts/ObservationsContext";
import { useAuth } from "../contexts/AuthContext";
import ObservationCard from "../components/ObservationCard";
import ObservationForm from "../components/ObservationForm";
import LoadingSpinner from "../components/LoadingSpinner";
import axiosClient from "../API/axiosClient";
import { useNavigate } from "react-router-dom";
import { signalRService } from "../services/signalRService";

const Observations = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingObservation, setEditingObservation] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [observations, setObservations] = useState([]);
    const [myObservations, setMyObservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("explore");
    const [allObservations, setAllObservations] = useState([]);

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Fetch observations from explore endpoint
    useEffect(() => {
        const fetchObservations = async () => {
            try {
                setLoading(true);
                // Get all observations including current user
                const response = await axiosClient.get('/observations?limit=30');
                setObservations(response.data || []);
                setAllObservations(response.data || []);
            } catch (err) {
                console.error('Error fetching observations:', err);
                setError('Failed to load observations');
            } finally {
                setLoading(false);
            }
        };

        fetchObservations();
    }, []);

    useEffect(() => {
        const fetchMyObservations = async () => {
            if (activeTab !== "my" || !isAuthenticated || !user) {
                setMyObservations([]);
                return;
            }
            
            try {
                const response = await axiosClient.get(`/observations/GetAllFromUser/${user.id}`);
                setMyObservations(response.data || []);
            } catch (err) {
                console.error('Error fetching my observations:', err);
                setMyObservations([]);
            }
        };

        fetchMyObservations();
    }, [activeTab, isAuthenticated, user]);

    useEffect(() => {
        if (!isAuthenticated && activeTab === "my") {
            setActiveTab("explore");
        }
    }, [isAuthenticated, activeTab]);

    // Initialize SignalR connection
    useEffect(() => {
        const initializeSignalR = async () => {
            await signalRService.startConnection();
            
            // Listen for real-time updates
            signalRService.onNewObservation((observation) => {
                setObservations(prev => [observation, ...prev]);
                if (user && observation.userId === user.id) {
                    setMyObservations(prev => [observation, ...prev]);
                }
            });

            signalRService.onObservationUpdated((updatedObservation) => {
                setObservations(prev => 
                    prev.map(obs => obs.id === updatedObservation.id ? updatedObservation : obs)
                );
                setMyObservations(prev => 
                    prev.map(obs => obs.id === updatedObservation.id ? updatedObservation : obs)
                );
            });

            signalRService.onObservationDeleted((observationId) => {
                setObservations(prev => 
                    prev.filter(obs => obs.id !== observationId)
                );
                setMyObservations(prev => 
                    prev.filter(obs => obs.id !== observationId)
                );
            });
        };

        initializeSignalR();

        // Cleanup SignalR connection on component unmount
        return () => {
            signalRService.removeAllListeners();
            signalRService.stopConnection();
        };
    }, [user]);

    const handleCreateNew = () => {
        if (!isAuthenticated) {
            // Store the current URL to return after login
            const returnUrl = encodeURIComponent(window.location.pathname);
            navigate(`/login?returnUrl=${returnUrl}`);
            return;
        }
        setEditingObservation(null);
        setShowForm(true);
    };

    const handleEdit = (observation) => {
        if (!isAuthenticated) {
            const returnUrl = encodeURIComponent(window.location.pathname);
            navigate(`/login?returnUrl=${returnUrl}`);
            return;
        }
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
        // Remove the window.location.reload() since we'll get updates via SignalR
    };

    // Filter observations based on search and filters
    const getFilteredObservations = (obsList) => {
        return obsList.filter(obs => {
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
    };

    const filteredObservations = getFilteredObservations(observations);
    const filteredMyObservations = getFilteredObservations(myObservations);

    // Stats calculations
    const calculateStats = (observations) => {
        const now = new Date();
        const thisMonth = observations.filter(obs => {
            const obsDate = new Date(obs.dateObserved);
            return obsDate.getMonth() === now.getMonth() && 
                   obsDate.getFullYear() === now.getFullYear();
        }).length;

        const uniqueSpecies = new Set(observations.map(obs => obs.speciesId)).size;

        return {
            total: observations.length,
            uniqueSpecies,
            thisMonth
        };
    };

    // Get stats based on the active tab
    const getStats = () => {
        if (activeTab === "my") {
            return calculateStats(myObservations);
        } else {
            // For explore tab, use allObservations for stats
            return calculateStats(allObservations);
        }
    };

    const stats = getStats();

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
                        {activeTab === "explore" 
                            ? "Discover wildlife sightings from the community"
                            : "View and manage your own observations"
                        }
                    </p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    data-testid="new-observation-button"
                >
                    <Plus className="w-5 h-5" />
                    {isAuthenticated ? "New Observation" : "Login to Share"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab("explore")}
                    className={`flex items-center gap-2 px-4 py-2 ${
                        activeTab === "explore" 
                            ? "border-b-2 border-blue-500 text-blue-400" 
                            : "text-gray-400 hover:text-white"
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    Explore Community
                </button>
                {isAuthenticated && (
                    <button
                        onClick={() => setActiveTab("my")}
                        className={`flex items-center gap-2 px-4 py-2 ${
                            activeTab === "my" 
                                ? "border-b-2 border-blue-500 text-blue-400" 
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <User className="w-4 h-4" />
                        My Observations
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">
                        {activeTab === "explore" ? "Community Observations" : "My Observations"}
                    </h3>
                    <p className="text-3xl font-bold text-white">
                        {stats.total}
                    </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">Unique Species</h3>
                    <p className="text-3xl font-bold text-white">
                        {stats.uniqueSpecies}
                    </p>
                </div>
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300">This Month</h3>
                    <p className="text-3xl font-bold text-white">
                        {stats.thisMonth}
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
                            data-testid="observations-filter-date"
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
            {(() => {
                const currentObservations = activeTab === "explore" ? filteredObservations : filteredMyObservations;
                const allObservations = activeTab === "explore" ? observations : myObservations;
                
                if (currentObservations.length === 0) {
                    return (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                {allObservations.length === 0 ? (
                                    activeTab === "explore" ? (
                                        <>
                                            <p className="text-xl mb-2">No community observations yet</p>
                                            <p>Be the first to share a wildlife sighting!</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xl mb-2">You haven't made any observations yet</p>
                                            <p>Start by creating your first wildlife observation!</p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p className="text-xl mb-2">No observations match your filters</p>
                                        <p>Try adjusting your search criteria or filters.</p>
                                    </>
                                )}
                            </div>
                            {allObservations.length === 0 && (
                                <button
                                    onClick={handleCreateNew}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                                >
                                    {isAuthenticated ? "Create Your First Observation" : "Login to Share"}
                                </button>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentObservations.map((observation) => (
                            <ObservationCard
                                key={observation.id}
                                observation={observation}
                                onEdit={handleEdit}
                                isOwnObservation={activeTab === "my"}
                            />
                        ))}
                    </div>
                );
            })()}

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