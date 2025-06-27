"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Session on home page:", session);
    if (session?.accessToken) {
      const decoded: any = jwtDecode(session.accessToken);
      const roles: string[] = decoded?.realm_access?.roles || [];
      if (roles.includes("User")) {
        router.replace("/User");
      } else if (roles.includes("Employee")) {
        router.replace("/Employee");
      } else if (roles.includes("Manager")) {
        router.replace("/Manager");
      } else if (roles.includes("HR")) {
        router.replace("/HR");
      }
    } else if (session === null) {
      // If not signed in, automatically trigger signIn
      signIn("keycloak");
    }
  }, [session, router]);

  // No content is shown while redirecting or signing in
  return null;
}
