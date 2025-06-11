import { X, ExternalLink, Image as ImageIcon } from "lucide-react";

const SpeciesDetailModal = ({ species, onClose }) => {
    if (!species) return null;

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold">{species.commonName || species.scientificName}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Section */}
                    <div className="space-y-4">
                        {species.imageUrl && (
                            <div className="relative h-64 bg-zinc-800 rounded-lg overflow-hidden">
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
                        )}
                        
                        {species.iNaturalistId && (
                            <a
                                href={`https://www.inaturalist.org/taxa/${species.iNaturalistId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View on iNaturalist
                            </a>
                        )}
                    </div>

                    {/* Information Section */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">Scientific Name</h3>
                                <p className="text-white italic text-lg">{species.scientificName}</p>
                            </div>
                            
                            {species.commonName && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Common Name</h3>
                                    <p className="text-white text-lg">{species.commonName}</p>
                                </div>
                            )}
                        </div>

                        {/* Taxonomy Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {species.family && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Family</h3>
                                    <p className="text-white">{species.family}</p>
                                </div>
                            )}
                            {species.order && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Order</h3>
                                    <p className="text-white">{species.order}</p>
                                </div>
                            )}
                            {species.class && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Class</h3>
                                    <p className="text-white">{species.class}</p>
                                </div>
                            )}
                            {species.phylum && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Phylum</h3>
                                    <p className="text-white">{species.phylum}</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {species.description && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">Description</h3>
                                <p className="text-gray-300 leading-relaxed">{species.description}</p>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="space-y-2">
                            {species.iNaturalistId && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">iNaturalist ID</h3>
                                    <p className="text-white font-mono">{species.iNaturalistId}</p>
                                </div>
                            )}
                            
                            {species.id && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-400 mb-1">Database ID</h3>
                                    <p className="text-white font-mono">{species.id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeciesDetailModal; 