import { X, Download, ExternalLink, CheckCircle } from "lucide-react";

const ImportModal = ({ 
    isOpen, 
    onClose, 
    taxonId, 
    setTaxonId, 
    onImport, 
    loading = false 
}) => {
    if (!isOpen) return null;

    const handleImport = async () => {
        const result = await onImport();
        if (result) {
            // Clear the input
            setTaxonId("");
            // Close the modal after a short delay to show success
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading && taxonId.trim()) {
            handleImport();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Import Species from iNaturalist</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            iNaturalist Taxon ID
                        </label>
                        <input
                            type="number"
                            value={taxonId}
                            onChange={(e) => setTaxonId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter taxon ID (e.g., 12345)"
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                    
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                        <p className="text-sm text-blue-300 mb-2">
                            <strong>How to find a Taxon ID:</strong>
                        </p>
                        <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Go to <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">iNaturalist.org</a></li>
                            <li>Search for a species</li>
                            <li>Click on the species page</li>
                            <li>The Taxon ID is in the URL: <code className="bg-zinc-800 px-1 rounded">inaturalist.org/taxa/12345</code></li>
                        </ol>
                    </div>
                    
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-green-300 font-medium mb-1">What happens after import:</p>
                                <ul className="text-xs text-gray-300 space-y-1">
                                    <li>• Species is immediately added to your database</li>
                                    <li>• Appears at the top of Popular Species</li>
                                    <li>• Available for search and filtering</li>
                                    <li>• Includes image and taxonomy data</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={loading || !taxonId.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Import Species
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportModal; 