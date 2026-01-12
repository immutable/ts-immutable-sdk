import { sandboxAuth } from "@/lib/auth-nextjs";

export const { GET, POST } = sandboxAuth.handlers;
