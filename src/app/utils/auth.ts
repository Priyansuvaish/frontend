// Utility functions for handling authentication tokens

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

export const handleSignOut = (signOut: any) => {
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
  
  // Call NextAuth signOut with a simple callback URL
  signOut({ 
    callbackUrl: "/",
    redirect: true 
  }).catch((error: any) => {
    console.error("Error during signout:", error);
    // Fallback: force redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
  });
};

// Alternative signout function that directly handles Keycloak logout
export const handleKeycloakSignOut = () => {
  console.log("Starting Keycloak signout process...");
  
  // Clear all stored data
  clearStoredToken();
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
    localStorage.removeItem("next-auth.session-token");
    localStorage.removeItem("next-auth.csrf-token");
    localStorage.removeItem("next-auth.callback-url");
    console.log("Cleared all stored data");
  }
  
  // Redirect to Keycloak logout endpoint
  const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
  
  console.log("Redirecting to Keycloak logout:", keycloakLogoutUrl);
  window.location.href = keycloakLogoutUrl;
}; 