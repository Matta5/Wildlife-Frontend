import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Image as ImageIcon, MapPin, Calendar } from "lucide-react";
import { useSpecies } from "../contexts/SpeciesContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SpeciesDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [species, setSpecies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { getSpeciesById } = useSpecies();

    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                setLoading(true);
                const speciesData = await getSpeciesById(parseInt(id));
                if (speciesData) {
                    setSpecies(speciesData);
                } else {
                    setError("Species not found");
                }
            } catch (err) {
                setError("Failed to load species details");
                console.error("Error fetching species:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSpecies();
        }
    }, [id, getSpeciesById]);

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
    };

    const handleImageLoad = (e) => {
        e.target.style.display = 'block';
        if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'none';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <LoadingSpinner message="Loading species details..." />
            </div>
        );
    }

    if (error || !species) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <div className="text-center py-8">
                    <h1 className="text-2xl font-bold text-white mb-4">Species Not Found</h1>
                    <p className="text-gray-400 mb-6">{error || "The species you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate('/species')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Species
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6 text-white">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/species')}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800 text-gray-300 rounded hover:bg-zinc-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h1 className="text-3xl font-bold">{species.commonName || species.scientificName}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Section */}
                    {species.imageUrl && (
                        <div className="bg-zinc-900 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Image</h2>
                            <div className="relative h-80 bg-zinc-800 rounded-lg overflow-hidden">
                                <img
                                    src={species.imageUrl}
                                    alt={species.commonName || species.scientificName}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                                <div 
                                    className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-gray-400"
                                    style={{ display: 'none' }}
                                >
                                    <ImageIcon className="w-16 h-16" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Taxonomy Information */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Taxonomy</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {species.taxonomy?.kingdom && (
                                <div>
                                    <span className="text-gray-400">Kingdom:</span>
                                    <p className="text-white font-medium">{species.taxonomy.kingdom}</p>
                                </div>
                            )}
                            {species.taxonomy?.phylum && (
                                <div>
                                    <span className="text-gray-400">Phylum:</span>
                                    <p className="text-white font-medium">{species.taxonomy.phylum}</p>
                                </div>
                            )}
                            {species.taxonomy?.class && (
                                <div>
                                    <span className="text-gray-400">Class:</span>
                                    <p className="text-white font-medium">{species.taxonomy.class}</p>
                                </div>
                            )}
                            {species.taxonomy?.order && (
                                <div>
                                    <span className="text-gray-400">Order:</span>
                                    <p className="text-white font-medium">{species.taxonomy.order}</p>
                                </div>
                            )}
                            {species.taxonomy?.family && (
                                <div>
                                    <span className="text-gray-400">Family:</span>
                                    <p className="text-white font-medium">{species.taxonomy.family}</p>
                                </div>
                            )}
                            {species.taxonomy?.genus && (
                                <div>
                                    <span className="text-gray-400">Genus:</span>
                                    <p className="text-white font-medium">{species.taxonomy.genus}</p>
                                </div>
                            )}
                            {species.taxonomy?.species && (
                                <div>
                                    <span className="text-gray-400">Species:</span>
                                    <p className="text-white font-medium">{species.taxonomy.species}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Observations */}
                    {species.observations && species.observations.length > 0 && (
                        <div className="bg-zinc-900 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Observations</h2>
                            <div className="space-y-4">
                                {species.observations.map((observation) => (
                                    <div key={observation.id} className="bg-zinc-800 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {observation.user?.profilePicture && (
                                                    <img
                                                        src={observation.user.profilePicture}
                                                        alt={observation.user.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-white font-medium">{observation.user?.username}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(observation.dateObserved)}
                                                        </div>
                                                        {observation.latitude && observation.longitude && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {observation.latitude.toFixed(4)}, {observation.longitude.toFixed(4)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {observation.body && (
                                            <p className="text-gray-300">{observation.body}</p>
                                        )}
                                        {observation.imageUrl && (
                                            <div className="mt-3">
                                                <img
                                                    src={observation.imageUrl}
                                                    alt="Observation"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Information</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="text-gray-400">Scientific Name</span>
                                <p className="text-white italic font-medium">{species.scientificName}</p>
                            </div>
                            {species.commonName && (
                                <div>
                                    <span className="text-gray-400">Common Name</span>
                                    <p className="text-white font-medium">{species.commonName}</p>
                                </div>
                            )}
                            {species.iconicTaxonName && (
                                <div>
                                    <span className="text-gray-400">Iconic Taxon</span>
                                    <p className="text-white font-medium">{species.iconicTaxonName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* External Links */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">External Links</h2>
                        <div className="space-y-3">
                            {species.inaturalistTaxonId && (
                                <a
                                    href={`https://www.inaturalist.org/taxa/${species.inaturalistTaxonId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View on iNaturalist
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-400">Database ID:</span>
                                <p className="text-white font-mono">{species.id}</p>
                            </div>
                            {species.inaturalistTaxonId && (
                                <div>
                                    <span className="text-gray-400">iNaturalist Taxon ID:</span>
                                    <p className="text-white font-mono">{species.inaturalistTaxonId}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
