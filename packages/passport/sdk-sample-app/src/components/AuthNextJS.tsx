import { useCallback } from "react";
import { Stack } from "react-bootstrap";
import { Body } from "@biom3/react";
import { useLogin, useImmutableSession, type LoginConfig } from "@imtbl/auth-next-client";
import { signOut } from "next-auth/react";
import { getAuthConfig } from "@/lib/immutable-auth";
import CardStack from "@/components/CardStack";
import WorkflowButton from "@/components/WorkflowButton";
import { useStatusProvider } from "@/context/StatusProvider";
import { useImmutableProvider } from "@/context/ImmutableProvider";
import { usePassportProvider } from "@/context/PassportProvider";

/**
 * Example component demonstrating @imtbl/auth-next-client usage
 */
export default function AuthNextJS() {
  const { addMessage } = useStatusProvider();
  const { environment } = useImmutableProvider();
  const { logout: passportLogout } = usePassportProvider();
  const { session, isLoading, isAuthenticated } = useImmutableSession();
  const { loginWithEmbedded, isLoggingIn } = useLogin();
  const user = session?.user;

  const handleSignIn = useCallback(async () => {
    try {
      // Get the auth config for the current environment
      const authConfig = getAuthConfig(environment);
      const loginConfig: LoginConfig = {
        clientId: authConfig.clientId,
        redirectUri: authConfig.redirectUri,
        audience: authConfig.audience,
        scope: authConfig.scope,
        authenticationDomain: authConfig.authenticationDomain,
      };

      // Use loginWithEmbedded to show iframe modal, get tokens, and sign in to NextAuth
      await loginWithEmbedded(loginConfig);

      addMessage("Auth NextJS", `Login successful (${environment})`);
    } catch (error) {
      addMessage("Auth NextJS", error);
    }
  }, [environment, addMessage, loginWithEmbedded]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      // Also logout from Passport
      await passportLogout();
      addMessage("Auth NextJS", "Logout successful");
    } catch (error) {
      addMessage("Auth NextJS", error);
    }
  }, [passportLogout, addMessage]);

  const handleGetUserInfo = useCallback(() => {
    if (user) {
      addMessage("Auth NextJS - User Info", {
        sub: user.sub ?? user.id,
        email: user.email,
        nickname: user.nickname ?? user.name,
      });
    } else {
      addMessage("Auth NextJS", "Not authenticated");
    }
  }, [user, addMessage]);

  const handleGetSessionInfo = useCallback(() => {
    if (session) {
      addMessage("Auth NextJS - Session Info", {
        environment,
        session: session,
      });
    } else {
      addMessage("Auth NextJS", "No session");
    }
  }, [session, environment, addMessage]);

  return (
    <CardStack title="Auth NextJS SSR">
      <Body size="xSmall" sx={{ marginBottom: "base.spacing.x2", color: "base.color.text.body.secondary" }}>
        ⚠️ This section is only testable when running the sample app locally with: pnpm run dev-with-sdk
      </Body>
      <Stack direction="horizontal" style={{ flexWrap: "wrap" }} gap={3}>
        <WorkflowButton disabled={isLoading || isLoggingIn || isAuthenticated} onClick={handleSignIn}>
          {isLoggingIn ? "Signing in..." : "Login"}
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || isLoggingIn || !isAuthenticated} onClick={handleSignOut}>
          Logout
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || isLoggingIn || !isAuthenticated} onClick={handleGetUserInfo}>
          Get User Info
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || isLoggingIn || !isAuthenticated} onClick={handleGetSessionInfo}>
          Get Session Info
        </WorkflowButton>
      </Stack>
      {isAuthenticated && (
        <Body size="xSmall" sx={{ marginTop: "base.spacing.x2", color: "base.color.text.body.secondary" }}>
          Logged in as: {user?.email || user?.sub} ({environment})
        </Body>
      )}
    </CardStack>
  );
}

