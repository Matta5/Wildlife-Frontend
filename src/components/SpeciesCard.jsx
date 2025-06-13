import { Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SpeciesCard = ({ species, showImage = true }) => {
    const navigate = useNavigate();

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

    const handleClick = () => {
        navigate(`/species/${species.id}`);
    };

    return (
        <div 
            className="bg-zinc-800 border border-gray-700 rounded-lg p-4 hover:bg-zinc-700 cursor-pointer transition-colors group"
            onClick={handleClick}
        >
            {/* Image Section */}
            {showImage && species.imageUrl && (
                <div className="relative mb-3 h-32 bg-zinc-900 rounded-lg overflow-hidden">
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
                        <ImageIcon className="w-8 h-8" />
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {species.commonName || species.scientificName}
                    </h3>
                    <p className="text-sm text-gray-400 italic">
                        {species.scientificName}
                    </p>
                </div>
            </div>

            {/* Taxonomy Info */}
            <div className="space-y-1">
                {species.family && (
                    <p className="text-sm text-gray-300">
                        <span className="text-gray-400">Family:</span> {species.family}
                    </p>
                )}
                {species.order && (
                    <p className="text-sm text-gray-300">
                        <span className="text-gray-400">Order:</span> {species.order}
                    </p>
                )}
                {species.class && (
                    <p className="text-sm text-gray-300">
                        <span className="text-gray-400">Class:</span> {species.class}
                    </p>
                )}
            </div>

            {/* Additional Info */}
            {species.iNaturalistId && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                        iNaturalist ID: {species.iNaturalistId}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SpeciesCard; 