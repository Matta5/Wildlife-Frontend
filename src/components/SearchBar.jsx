import { Search, Globe } from "lucide-react";

const SearchBar = ({ 
    searchQuery, 
    setSearchQuery, 
    onSearch, 
    onGlobalSearch, 
    loading = false,
    placeholder = "Search species by name..."
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(e);
    };

    const handleGlobalSearch = (e) => {
        e.preventDefault();
        onGlobalSearch(e);
    };

    return (
        <div className="bg-zinc-900 rounded-lg shadow-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-zinc-800 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Search Options */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleGlobalSearch}
                    disabled={loading || !searchQuery.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Globe className="w-4 h-4" />
                    Global Search (iNaturalist)
                </button>
            </div>
        </div>
    );
};

export default SearchBar; 