"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, handleSignOut } from "../utils/auth";
import { FormTemplateService } from '@/services/formTemplateService';
import { FormTemplate } from '@/types/form-template';

import { Session } from "next-auth";
import { access } from "fs";

interface TaskItem {
    processInstanceId?: string | number;
    name?: string;
}

interface NestedSchema {
    properties: Record<string, any>;
    required?: string[];
}

export default function UserPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState("");
    const [templates, setTemplates] = useState<FormTemplate | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        if (!session) {
            router.replace("/");
        }
    }, [session, router]);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                setError("");

                if (!(session as Session)?.accessToken) {
                    console.log('No access token in session, redirecting to login');
                    handleSignOut();
                    return;
                }

                const accessToken = (session as Session).accessToken;
                const data = await FormTemplateService.getById(Number(process.env.NEXT_PUBLIC_TEMPLATE_ID), accessToken!);
                setTemplates(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, []);
    useEffect(() => {
        const nested: NestedSchema | undefined = templates?.schemaJson?.properties as NestedSchema | undefined;
        if (nested) {
            const initialData: { [key: string]: any } = {};
            Object.keys(nested).forEach((key) => {
                initialData[key] = "";
            });
            setFormData(initialData);
        }
    }, [templates]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        console.log("access", (session as Session)?.accessToken)
        try {
            const res = await fetch("/api/apply", {
                method: "POST",
                headers: getAuthHeaders((session as Session)?.accessToken),
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Form submitted successfully!");
            } else {
                setError(data.error_description || data.error || "Submission failed.");
            }
            if (!res.ok) {
                if (res.status === 401) {
                    handleSignOut();
                }
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFetchTasks = async () => {
        setTasksError("");
        setTasks([]);
        setTasksLoading(true);
        console.log("url", process.env.NEXT_PUBLIC_BACKEND_URL)
        console.log("token", (session as Session)?.accessToken);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/tasks`, {
                headers: getAuthHeaders((session as Session)?.accessToken),
            });
            if (!res.ok) {
                if (res.status === 401) {
                    handleSignOut();
                }
                const data = await res.json();
                throw new Error(data.error_description || data.error || "Failed to fetch tasks.");
            }
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : (data.tasks || []));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred while fetching tasks.";
            setTasksError(errorMessage);
        } finally {
            setTasksLoading(false);
        }
    };

    const onSignOut = async () => {
        try {
            // Sign out from NextAuth (local session)
            handleSignOut();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (!session) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md backdrop-blur-lg bg-white/90 dark:bg-gray-800/80 p-8 rounded-2xl shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🚀 User Form</h1>
                    <button
                        onClick={onSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && <div className="text-red-500 text-sm text-center animate-pulse">{error}</div>}
                    {success && <div className="text-green-600 text-sm text-center animate-pulse">{success}</div>}

                    {(() => {
                        const nested: NestedSchema | undefined = templates?.schemaJson?.properties as NestedSchema | undefined;
                        if (!nested) return null;
                        return (
                            <>
                                {Object.entries(nested).map(([field, config]: [string, any]) => {
                                    const isRequired = Array.isArray(nested.required) && nested.required.includes(field);

                                    // Select/enum
                                    if (config.enum) {
                                        return (
                                            <div key={field}>
                                                <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{config.label || field}</label>
                                                <select
                                                    id={field}
                                                    value={formData[field] || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                                    required={isRequired}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                >
                                                    <option value="">Select...</option>
                                                    {config.enum.map((option: string) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    // Textarea
                                    if (config.widget === "textarea") {
                                        return (
                                            <div key={field}>
                                                <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{config.label || field}</label>
                                                <textarea
                                                    id={field}
                                                    value={formData[field] || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                                    required={isRequired}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        );
                                    }

                                    // Checkbox
                                    if (config.type === "boolean") {
                                        return (
                                            <div key={field} className="flex items-center gap-2">
                                                <input
                                                    id={field}
                                                    type="checkbox"
                                                    checked={!!formData[field]}
                                                    onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.checked }))}
                                                    disabled={loading}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <label htmlFor={field} className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.label || field}</label>
                                            </div>
                                        );
                                    }

                                    // Number
                                    if (config.type === "integer" || config.type === "number") {
                                        return (
                                            <div key={field}>
                                                <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{config.label || field}</label>
                                                <input
                                                    id={field}
                                                    type="number"
                                                    value={formData[field] || ""}
                                                    onChange={e => setFormData(prev => ({ ...prev, [field]: Number(e.target.value) }))}
                                                    required={isRequired}
                                                    disabled={loading}
                                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        );
                                    }

                                    // Default: text
                                    return (
                                        <div key={field}>
                                            <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{config.label || field}</label>
                                            <input
                                                id={field}
                                                type="text"
                                                value={formData[field] || ""}
                                                onChange={e => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                                required={isRequired}
                                                disabled={loading}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    );
                                })}
                            </>
                        );
                    })()}

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
                            <p className="text-md">🧐 You haven&apos;t submitted any applications yet.</p>
                        </div>
                    )
                )}

            </div>
        </div>

    );
} 