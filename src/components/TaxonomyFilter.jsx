import { Filter } from "lucide-react";

const TaxonomyFilter = ({ 
    onFilterByClass, 
    onFilterByOrder, 
    onFilterByFamily,
    activeClass = "",
    activeOrder = "",
    activeFamily = ""
}) => {
    const popularClasses = ["Aves", "Mammalia", "Reptilia", "Amphibia", "Insecta"];
    const popularOrders = ["Passeriformes", "Carnivora", "Rodentia", "Artiodactyla", "Squamata"];
    const popularFamilies = ["Turdidae", "Canidae", "Felidae", "Cervidae", "Colubridae"];

    return (
        <div className="bg-zinc-900 rounded-lg shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">Filter by Taxonomy</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Class Filter */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Class</h3>
                    <div className="space-y-2">
                        {popularClasses.map((className) => (
                            <button
                                key={className}
                                onClick={() => onFilterByClass(className)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activeClass === className 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300 hover:bg-zinc-700'
                                }`}
                            >
                                {className}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Filter */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Order</h3>
                    <div className="space-y-2">
                        {popularOrders.map((orderName) => (
                            <button
                                key={orderName}
                                onClick={() => onFilterByOrder(orderName)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activeOrder === orderName 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300 hover:bg-zinc-700'
                                }`}
                            >
                                {orderName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Family Filter */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-300 mb-3">Family</h3>
                    <div className="space-y-2">
                        {popularFamilies.map((familyName) => (
                            <button
                                key={familyName}
                                onClick={() => onFilterByFamily(familyName)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activeFamily === familyName 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-gray-300 hover:bg-zinc-700'
                                }`}
                            >
                                {familyName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxonomyFilter; 