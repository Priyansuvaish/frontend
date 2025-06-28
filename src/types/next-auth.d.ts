declare module "next-auth" {
  interface Session {
    accessToken?: string;
    id_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id_token?: string;
  }
} 