import { ImmutableAuth } from "@imtbl/auth-nextjs";
import { getAuthConfig } from "@/lib/auth-nextjs";
import { EnvironmentNames } from "@/types";

// Use sandbox config for the API route (server-side default)
export default ImmutableAuth(getAuthConfig(EnvironmentNames.SANDBOX));

