import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useSpecies } from "../contexts/SpeciesContext";
import SpeciesCard from "../components/SpeciesCard";
import SearchBar from "../components/SearchBar";
import TaxonomyFilter from "../components/TaxonomyFilter";
import ImportModal from "../components/ImportModal";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Species() {
    const [searchQuery, setSearchQuery] = useState("");
    const [importModal, setImportModal] = useState(false);
    const [taxonId, setTaxonId] = useState("");
    const [activeTab, setActiveTab] = useState("search");
    const [classFilter, setClassFilter] = useState("");
    const [orderFilter, setOrderFilter] = useState("");
    const [familyFilter, setFamilyFilter] = useState("");

    const {
        popularSpecies,
        searchResults,
        filterResults,
        loading,
        fetchPopularSpecies,
        searchSpecies,
        findSpecies,
        importSpecies,
        filterByClass,
        filterByOrder,
        filterByFamily,
        setSearchResults,
        setFilterResults
    } = useSpecies();

    useEffect(() => {
        fetchPopularSpecies();
    }, [fetchPopularSpecies]);

    const handleSearch = async (e) => {
        e.preventDefault();
        await searchSpecies(searchQuery);
    };

    const handleGlobalSearch = async (e) => {
        e.preventDefault();
        await findSpecies(searchQuery);
    };

    const handleImportSpecies = async () => {
        const result = await importSpecies(taxonId);
        if (result) {
            setActiveTab("popular");
            return result;
        }
        return null;
    };

    const handleFilterByClass = async (className) => {
        setClassFilter(className);
        setOrderFilter("");
        setFamilyFilter("");
        await filterByClass(className);
        setActiveTab("filter");
    };

    const handleFilterByOrder = async (orderName) => {
        setOrderFilter(orderName);
        setClassFilter("");
        setFamilyFilter("");
        await filterByOrder(orderName);
        setActiveTab("filter");
    };

    const handleFilterByFamily = async (familyName) => {
        setFamilyFilter(familyName);
        setClassFilter("");
        setOrderFilter("");
        await filterByFamily(familyName);
        setActiveTab("filter");
    };

    const EmptyState = ({ message, subMessage }) => (
        <div className="text-center py-8">
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-400">{subMessage}</p>
        </div>
    );

    const SpeciesGrid = ({ species, title }) => (
        <div>
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {loading ? (
                <LoadingSpinner message="Loading species..." />
            ) : species.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {species.map((speciesItem) => (
                        <SpeciesCard 
                            key={speciesItem.id} 
                            species={speciesItem} 
                        />
                    ))}
                </div>
            ) : (
                <EmptyState 
                    message="No species found." 
                    subMessage="Try searching for a different term or use the filters."
                />
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8 text-white">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">Species Database</h1>
                <p className="text-gray-400">Explore and manage wildlife species</p>
            </div>

            {/* Search Section */}
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onGlobalSearch={handleGlobalSearch}
                loading={loading}
            />

            {/* Import Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setImportModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Import Species
                </button>
            </div>

            {/* Main Content */}
            <div className="bg-zinc-900 rounded-lg shadow-2xl p-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-4 py-2 ${activeTab === "search" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-white"}`}
                    >
                        Search Results
                    </button>
                    <button
                        onClick={() => setActiveTab("popular")}
                        className={`px-4 py-2 ${activeTab === "popular" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-white"}`}
                    >
                        Popular Species
                    </button>
                    <button
                        onClick={() => setActiveTab("filter")}
                        className={`px-4 py-2 ${activeTab === "filter" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-white"}`}
                    >
                        Filter by Taxonomy
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "search" && (
                    <SpeciesGrid 
                        species={searchResults} 
                        title="Search Results"
                    />
                )}

                {activeTab === "popular" && (
                    <SpeciesGrid 
                        species={popularSpecies} 
                        title="Popular Dutch Species"
                    />
                )}

                {activeTab === "filter" && (
                    <div className="space-y-6">
                        <TaxonomyFilter
                            onFilterByClass={handleFilterByClass}
                            onFilterByOrder={handleFilterByOrder}
                            onFilterByFamily={handleFilterByFamily}
                            activeClass={classFilter}
                            activeOrder={orderFilter}
                            activeFamily={familyFilter}
                        />
                        
                        {(classFilter || orderFilter || familyFilter) && (
                            <SpeciesGrid 
                                species={filterResults} 
                                title={`Results for ${classFilter || orderFilter || familyFilter}`}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Import Modal */}
            <ImportModal
                isOpen={importModal}
                onClose={() => setImportModal(false)}
                taxonId={taxonId}
                setTaxonId={setTaxonId}
                onImport={handleImportSpecies}
                loading={loading}
            />
        </div>
    );
}