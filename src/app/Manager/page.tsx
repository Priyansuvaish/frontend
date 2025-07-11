"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, handleSignOut } from "../utils/auth";
import { Session } from "next-auth";

interface TaskItem {
    id: string | number;
    name: string;
    status?: string;
    processInstanceId?: string | number;
}

export default function ManagerPage() {
    const [view, setView] = useState<"assigned" | "unassigned">("assigned");
    const [assignedData, setassignedData] = useState<TaskItem[]>([]);
    const [unassignedData, setUnassignedData] = useState<TaskItem[]>([]);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session) {
            router.replace("/");
        }
    }, [session, router]);

    const fetchData = useCallback(() => {
        if (view === "unassigned") {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workflow-instances/tasks`, {
                method: "GET",
                headers: getAuthHeaders((session as Session)?.accessToken),
            })
                .then((res) => {
                    if (!res.ok) 
                    {
                        if (res.status === 401) {
                            handleSignOut();
                        }
                        throw new Error("Failed to fetch");
                    }
                    return res.json();
                })
                .then((data) => {
                    // Format the response as needed. Here assuming data is an array.
                    const formatted = data.map((item: TaskItem) => ({
                        id: item.id || "N/A",
                        processInstanceId: item.processInstanceId || "N/A",
                        name: item.name || "Unnamed Task",
                        status: "Unassigned",
                    }));
                    setUnassignedData(formatted);
                })
                .catch((err) => {
                    console.error("Error fetching unassigned tasks:", err);
                });
        }
        else if (view === "assigned") {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workflow-instances/assignedtasks`, {
                method: "GET",
                headers: getAuthHeaders((session as Session)?.accessToken),
            })
                .then((res) => {
                    if (!res.ok) {
                        if (res.status === 401) {
                            handleSignOut();
                        }
                        throw new Error("Failed to fetch");
                    }
                    return res.json();
                })
                .then((data) => {
                    // Format the response as needed. Here assuming data is an array.
                    const formatted = data.map((item: TaskItem) => ({
                        id: item.id || "N/A",
                        processInstanceId: item.processInstanceId || "N/A",
                        name: item.name || "Unnamed Task",
                    }));
                    setassignedData(formatted);
                })
                .catch((err) => {
                    console.error("Error fetching unassigned tasks:", err);
                });
        }
    }, [view, session]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dataToDisplay = view === "assigned" ? assignedData : unassignedData;

    const handleApprove = (id: string | number) => {

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workflow-instances/approve/${id}`, {
            method: "POST",
            headers: getAuthHeaders((session as Session)?.accessToken),
            body: JSON.stringify({
                Manager:true
            }),
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                let data;
                if (!res.ok) {
                    if (res.status === 401) {
                        handleSignOut();
                    }
                    const error = contentType?.includes("application/json")
                        ? await res.json()
                        : await res.text();
                    throw new Error(error?.message || "Something went wrong");
                }
                if (contentType?.includes("application/json")) {
                    data = await res.json();
                } else {
                    data = await res.text();
                }
                alert("✅ Task approved successfully");
                fetchData();
                return data;
            })
            .catch((err) => {
                console.error("Error fetching unassigned tasks:", err);
            });
    };

    const handleAssign = (id: string | number) => {

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/workflow-instances/assign/${id}`, {
            method: "POST",
            headers: getAuthHeaders((session as Session)?.accessToken),
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                let data;
                if (!res.ok) {
                    if (res.status === 401) {
                        handleSignOut();
                    }
                    const error = contentType?.includes("application/json")
                        ? await res.json()
                        : await res.text();
                    throw new Error(error?.message || "Something went wrong");
                }
                if (contentType?.includes("application/json")) {
                    data = await res.json();
                } else {
                    data = await res.text();
                }
                alert("✅ Task assigned successfully");
                fetchData();
                return data;
            })  
            .catch((err) => {
                console.error("Error fetching unassigned tasks:", err);
            });
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Manager Page
                    </h1>
                    <button 
                        onClick={onSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
                <div className="flex justify-center mb-4 space-x-4">
                    <button
                        className={`px-4 py-2 rounded ${view === "assigned"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                            }`}
                        onClick={() => setView("assigned")}
                    >
                        Assigned
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${view === "unassigned"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                            }`}
                        onClick={() => setView("unassigned")}
                    >
                        Unassigned
                    </button>
                </div>

                <table className="w-full text-left border-collapse mt-4">
                    <thead>
                        <tr>
                            <th className="border-b p-2 dark:text-white">ID</th>
                            <th className="border-b p-2 dark:text-white">Name</th>
                            {view === "unassigned" && <th className="border-b p-2 dark:text-white">Status</th>}
                            <th className="border-b p-2 dark:text-white">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataToDisplay.map((item) => (
                            <tr key={item.id}>
                                <td className="border-b p-2 text-gray-800 dark:text-gray-100">{item.processInstanceId}</td>
                                <td className="border-b p-2 text-gray-800 dark:text-gray-100">{item.name}</td>
                                {view === "unassigned" && <td className="border-b p-2 text-gray-800 dark:text-gray-100">{item.status}</td>}
                                <td className="border-b p-2">
                                    {view === "assigned" ? (
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAssign(item.id)}
                                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Assign
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
