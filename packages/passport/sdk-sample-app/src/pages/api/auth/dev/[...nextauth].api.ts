import { ImmutableAuth } from "@imtbl/auth-nextjs";
import { getAuthConfig } from "@/lib/auth-nextjs";
import { EnvironmentNames } from "@/types";

export default ImmutableAuth(getAuthConfig(EnvironmentNames.DEV));
