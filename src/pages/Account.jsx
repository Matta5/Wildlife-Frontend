import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext";

export default function AccountPage() {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedObservation, setSelectedObservation] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const { logout } = useAuth();

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:7186/auth/me", {
                    withCredentials: true,
                })
                setUser(res.data)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const stats = {
        totalObservations: 42,
        uniqueSpecies: 15,
    }

    const recentObservations = [
        {
            id: 1,
            species: "Bald Eagle",
            date: "2023-10-01",
            location: "Yellowstone National Park",
            notes: "Spotted near the river.",
        },
        {
            id: 2,
            species: "Red Fox",
            date: "2023-09-28",
            location: "Yosemite National Park",
            notes: "Crossed the road in front of me.",
        },
    ]

    if (loading) {
        return <p className="text-center text-white">Loading...</p>
    }

    if (!user) {
        return <p className="text-center text-red-400">Could not load user. Please login again.</p>
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 text-white">
            {/* Profile Card */}
            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-700" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <h1 className="text-2xl font-bold">{user.username}</h1>
                        <p className="text-gray-400">{user.email}</p>
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button
                            className="border border-gray-600 text-white px-4 py-2 rounded hover:bg-zinc-800"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </button>
                        <button
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 border-t border-gray-700 pt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Name</label>
                            <input
                                type="text"
                                defaultValue={user.username}
                                className="w-full bg-zinc-800 text-white border border-gray-600 rounded px-3 py-2 mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                defaultValue={user.email}
                                disabled
                                className="w-full bg-zinc-800 text-gray-400 border border-gray-700 rounded px-3 py-2 mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border border-gray-600 rounded hover:bg-zinc-800"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => setIsEditing(false)}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Total Observations</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{stats.totalObservations}</p>
                    <p className="text-sm text-gray-400 mt-1">Wildlife sightings recorded</p>
                </div>
                <div className="bg-zinc-800 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-300">Unique Species</h2>
                    <p className="text-4xl font-bold mt-2 text-white">{stats.uniqueSpecies}</p>
                    <p className="text-sm text-gray-400 mt-1">Different species observed</p>
                </div>
            </div>

            <div className="bg-zinc-900 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold">Recent Observations</h2>
                <p className="text-sm text-gray-400 mb-4">Your latest wildlife sightings</p>
                {recentObservations.length === 0 ? (
                    <p className="text-gray-500">No observations yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {recentObservations.map((obs) => (
                            <li
                                key={obs.id}
                                className="p-4 border border-gray-700 rounded hover:bg-zinc-800 cursor-pointer"
                                onClick={() => setSelectedObservation(obs)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <h3 className="font-medium text-white">{obs.species}</h3>
                                        <p className="text-sm text-gray-400">{obs.date}</p>
                                    </div>
                                    <button className="text-blue-400 hover:underline">View</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-4 text-center">
                    <button
                        className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-zinc-800"
                        onClick={() => navigate("/observations")}
                    >
                        View All
                    </button>
                </div>
            </div>

            {selectedObservation && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h3 className="text-xl font-bold">{selectedObservation.species}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Observed on {selectedObservation.date}
                        </p>
                        <hr className="mb-4 border-gray-700" />
                        <div className="mb-2">
                            <h4 className="text-sm font-medium text-gray-300">Location</h4>
                            <p>{selectedObservation.location}</p>
                        </div>
                        <div className="mb-2">
                            <h4 className="text-sm font-medium text-gray-300">Notes</h4>
                            <p>{selectedObservation.notes}</p>
                        </div>
                        <div className="text-right">
                            <button
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => setSelectedObservation(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
