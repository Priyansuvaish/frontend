// Utility functions for handling authentication tokens
import { signOut, getSession } from "next-auth/react";
import { Session } from "next-auth";

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("access_token");
  }
  return null;
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("access_token", token);
  }
};

export const clearStoredToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("access_token");
    console.log("Cleared stored token from localStorage");
  }
};

export const getAuthHeaders = (token?: string): HeadersInit => {
  const authToken = token || getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

export const handleSignOut = async () => {
  console.log("Starting signout process...");
  
  // Clear any stored tokens first
  clearStoredToken();
  
  // Clear any other potential stored data
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
    // Clear any other auth-related items
    localStorage.removeItem("next-auth.session-token");
    localStorage.removeItem("next-auth.csrf-token");
    localStorage.removeItem("next-auth.callback-url");
    console.log("Cleared all stored data");
  }
  
  console.log("Calling NextAuth signOut...");
  
  const session = await getSession();

  const idToken = (session as Session)?.id_token;

  if (!idToken) {
    console.error("id_token not available.");
    return;
  }

  // First sign out from NextAuth
  await signOut({ redirect: false });

  // Then redirect to Keycloak logout with id_token_hint
  window.location.href = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent("http://localhost:3000")}`;

};
