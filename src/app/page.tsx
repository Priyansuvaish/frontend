"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";
import { Session } from "next-auth";

interface DecodedToken {
  realm_access?: {
    roles?: string[];
  };
}

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if ((session as Session)?.accessToken) {
      const accessToken = (session as Session).accessToken;
      const decoded: DecodedToken = jwtDecode(accessToken!);
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
      else if (roles.includes("Head")) {
        router.replace("/Head");
      }
    } else if (session === null) {
      // If not signed in, automatically trigger signIn
      signIn("keycloak");
    }
  }, [session, router]);

  // No content is shown while redirecting or signing in
  return null;
}
