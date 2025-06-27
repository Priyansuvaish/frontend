"use client";
import { useState } from "react";

export default function UserPage() {
    const [firstname, setFirstname] = useState("");
    const [age, setAge] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitted(false);
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("/api/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ firstName: firstname, age: Number(age) }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Form submitted successfully!");
                setSubmitted(true);
            } else {
                setError(data.error_description || data.error || "Submission failed.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFetchTasks = async () => {
        setTasksError("");
        setTasks([]);
        setTasksLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8082/api/user/tasks", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error_description || data.error || "Failed to fetch tasks.");
            }
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : (data.tasks || []));
        } catch (err: any) {
            setTasksError(err.message || "An error occurred while fetching tasks.");
        } finally {
            setTasksLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md backdrop-blur-lg bg-white/90 dark:bg-gray-800/80 p-8 rounded-2xl shadow-2xl transition-all">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">🚀 User Form</h1>

                    {error && <div className="text-red-500 text-sm text-center animate-pulse">{error}</div>}
                    {success && <div className="text-green-600 text-sm text-center animate-pulse">{success}</div>}

                    <div>
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                        <input
                            id="firstname"
                            type="text"
                            value={firstname}
                            onChange={e => setFirstname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                        <input
                            id="age"
                            type="number"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition duration-300 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>

                <button
                    onClick={handleFetchTasks}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow transition duration-300 disabled:opacity-50"
                    disabled={tasksLoading}
                >
                    {tasksLoading ? "Loading Applications..." : "View My Applications"}
                </button>

                {tasksError && <div className="text-red-500 text-sm text-center mt-3">{tasksError}</div>}

                {tasks.length > 0 ? (
                    <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            📄 My Applications
                        </h2>
                        <div className="space-y-4">
                            {tasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                                >
                                    <p className="text-gray-800 dark:text-gray-100 text-sm mb-1">
                                        <span className="font-medium text-blue-600 dark:text-blue-400">Process ID:</span> {task.processInstanceId || 'N/A'}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-100 text-sm">
                                        <span className="font-medium text-green-600 dark:text-green-400">Current State:</span> {task.name || 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    !tasksLoading && (
                        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center text-gray-600 dark:text-gray-300">
                            <p className="text-md">🧐 You haven't submitted any applications yet.</p>
                        </div>
                    )
                )}

            </div>
        </div>

    );
} 