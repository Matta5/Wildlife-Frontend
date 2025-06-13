import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div>
            <section className="hero bg-black pt-35 pb-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Document and Share Your Nature Observations</h1>
                    <p className="text-lg text-white mb-6">Join our community of nature enthusiasts to identify species, share discoveries, and learn about biodiversity.</p>
                    
                    {isAuthenticated ? (
                        // Welkom bericht voor ingelogde gebruikers
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-white text-lg mb-4">Welcome back, {user.username}!</p>
                            <div className="flex justify-center gap-4">
                                <Link to="/recognition" className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200">Identify Species</Link>
                                <Link to="/observations" className="border border-gray-500 text-white py-2 px-4 rounded text-lg hover:bg-neutral-950">Explore Observations</Link>
                                <Link to="/account" className="border border-gray-500 text-white py-2 px-4 rounded text-lg hover:bg-neutral-950">My Account</Link>
                            </div>
                        </div>
                    ) : (
                        // Knoppen voor niet-ingelogde gebruikers
                        <div className="flex justify-center gap-4">
                            <Link to="/signup" className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 focus:outline-2 focus:outline-offset-2 focus:outline-white active:bg-gray-200">Get Started</Link>
                            <Link to="/observations" className="border border-gray-500 text-white py-2 px-4 rounded text-lg hover:bg-neutral-950">Browse Observations</Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="features py-10">
                <div className="container mx-auto">
                    <h2 className="text-center text-white text-2xl font-bold mb-8">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-black text-white border border-white p-6 rounded text-center">
                            <h3 className="text-xl font-bold mb-2">Record Observations</h3>
                            <p>Document your nature findings with photos, location data, and notes.</p>
                        </div>
                        <div className="bg-black text-white border border-white p-6 rounded text-center">
                            <h3 className="text-xl font-bold mb-2">Identify Species</h3>
                            <p>Use our recognition tool to identify plants and animals from your photos.</p>
                        </div>
                        <div className="bg-black text-white border border-white p-6 rounded text-center">
                            <h3 className="text-xl font-bold mb-2">Build Your Collection</h3>
                            <p>Create a personal catalog of your observations and favorite species.</p>
                        </div>
                        <div className="bg-black text-white border border-white p-6 rounded text-center">
                            <h3 className="text-xl font-bold mb-2">Connect & Share</h3>
                            <p>Interact with other nature enthusiasts through comments and shared discoveries.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;