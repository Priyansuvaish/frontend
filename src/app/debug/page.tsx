"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getStoredToken, clearStoredToken, handleSignOut, handleKeycloakSignOut } from "../utils/auth";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [localToken, setLocalToken] = useState<string | null>(null);

  useEffect(() => {
    setLocalToken(getStoredToken());
  }, []);

  const testSignOut = () => {
    console.log("=== DEBUG: Starting NextAuth signout test ===");
    console.log("Session before signout:", session);
    console.log("Local token before signout:", localToken);
    
    handleSignOut(signOut);
  };

  const testKeycloakSignOut = () => {
    console.log("=== DEBUG: Starting Keycloak signout test ===");
    console.log("Session before signout:", session);
    console.log("Local token before signout:", localToken);
    
    handleKeycloakSignOut();
  };

  const clearLocalToken = () => {
    clearStoredToken();
    setLocalToken(null);
    console.log("Local token cleared");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Has Session:</strong> {session ? "Yes" : "No"}</p>
          <p><strong>Access Token:</strong> {session?.accessToken ? "Present" : "Missing"}</p>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Local Storage</h2>
          <p><strong>Local Token:</strong> {localToken ? "Present" : "Missing"}</p>
          <p><strong>Token Value:</strong> {localToken ? `${localToken.substring(0, 20)}...` : "None"}</p>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={clearLocalToken}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Clear Local Token
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Signout Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testSignOut}
            className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test NextAuth Signout
          </button>
          <button
            onClick={testKeycloakSignOut}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Keycloak Signout
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Check the browser console for detailed logs during signout.
        </p>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">All Local Storage Items</h2>
        <div className="space-y-2">
          {typeof window !== 'undefined' && Object.keys(localStorage).map(key => (
            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-sm">{key}</span>
              <span className="text-xs text-gray-500">
                {localStorage.getItem(key)?.substring(0, 30)}...
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 