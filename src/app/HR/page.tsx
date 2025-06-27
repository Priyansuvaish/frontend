"use client";
import { useState, useEffect } from "react";

export default function HRPage() {
    const [view, setView] = useState<"assigned" | "unassigned">("assigned");
    const [assignedData, setassignedData] = useState<any[]>([]);
    const [unassignedData, setUnassignedData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem("access_token");
    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = () => {
        if (view === "unassigned") {
            setIsLoading(true);
            fetch("http://localhost:8082/api/workflow-instances/tasks", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then((data) => {
                    // Format the response as needed. Here assuming data is an array.
                    const formatted = data.map((item: any) => ({
                        id: item.id || item.taskId || "N/A",
                        name: item.name || item.taskName || "Unnamed Task",
                        status: "Unassigned",
                    }));
                    setUnassignedData(formatted);
                })
                .catch((err) => {
                    console.error("Error fetching unassigned tasks:", err);
                })
                .finally(() => setIsLoading(false));
        }
        else if (view === "assigned") {
            setIsLoading(true);
            fetch("http://localhost:8082/api/workflow-instances/assignedtasks", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then((data) => {
                    // Format the response as needed. Here assuming data is an array.
                    const formatted = data.map((item: any) => ({
                        id: item.id || item.taskId || "N/A",
                        name: item.name || item.taskName || "Unnamed Task",
                    }));
                    setassignedData(formatted);
                })
                .catch((err) => {
                    console.error("Error fetching unassigned tasks:", err);
                })
                .finally(() => setIsLoading(false));
        }
    }

    const dataToDisplay = view === "assigned" ? assignedData : unassignedData;

    const handleApprove = (id: number) => {
        console.log(`Approved task with ID: ${id}`);
        // Implement your API call or state update logic here

        setIsLoading(true);
        fetch(`http://localhost:8082/api/workflow-instances/approve/${id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                HR:true
            }),
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                let data;
                if (!res.ok) {
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
            })
            .finally(() => setIsLoading(false));
    };

    const handleAssign = (id: number) => {
        console.log(`Assigned task with ID: ${id}`);
        // Implement your API call or state update logic here

        setIsLoading(true);
        fetch(`http://localhost:8082/api/workflow-instances/assign/${id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                let data;
                if (!res.ok) {
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
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                    HR Page
                </h1>
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
                                <td className="border-b p-2 text-gray-800 dark:text-gray-100">{item.id}</td>
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
