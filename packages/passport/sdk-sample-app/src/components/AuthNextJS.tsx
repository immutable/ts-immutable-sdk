import { useCallback } from "react";
import { Stack } from "react-bootstrap";
import { Body } from "@biom3/react";
import { useImmutableAuth } from "@imtbl/auth-nextjs/client";
import CardStack from "@/components/CardStack";
import WorkflowButton from "@/components/WorkflowButton";
import { useStatusProvider } from "@/context/StatusProvider";
import { useImmutableProvider } from "@/context/ImmutableProvider";
import { usePassportProvider } from "@/context/PassportProvider";

/**
 * Example component demonstrating @imtbl/auth-nextjs usage
 * Uses useImmutableAuth hook from the provider (which handles hydration automatically)
 */
export default function AuthNextJS() {
  const { addMessage } = useStatusProvider();
  const { environment } = useImmutableProvider();
  const { logout: passportLogout } = usePassportProvider();
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  } = useImmutableAuth();

  const handleSignIn = useCallback(async () => {
    try {
      await signIn();
      addMessage("Auth NextJS", `Login successful (${environment})`);
    } catch (error) {
      addMessage("Auth NextJS", error);
    }
  }, [signIn, environment, addMessage]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      // Also logout from Passport
      await passportLogout();
      addMessage("Auth NextJS", "Logout successful");
    } catch (error) {
      addMessage("Auth NextJS", error);
    }
  }, [signOut, passportLogout, addMessage]);

  const handleGetUserInfo = useCallback(() => {
    if (user) {
      addMessage("Auth NextJS - User Info", {
        sub: user.sub,
        email: user.email,
        nickname: user.nickname,
      });
    } else {
      addMessage("Auth NextJS", "Not authenticated");
    }
  }, [user, addMessage]);

  const handleGetSessionInfo = useCallback(() => {
    if (session) {
      addMessage("Auth NextJS - Session Info", {
        environment,
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
        tokenExpires: session.accessTokenExpires
          ? new Date(session.accessTokenExpires).toLocaleString()
          : "N/A",
        zkEvm: session.zkEvm || null,
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
        <WorkflowButton disabled={isLoading || isAuthenticated} onClick={handleSignIn}>
          Login
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || !isAuthenticated} onClick={handleSignOut}>
          Logout
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || !isAuthenticated} onClick={handleGetUserInfo}>
          Get User Info
        </WorkflowButton>
        <WorkflowButton disabled={isLoading || !isAuthenticated} onClick={handleGetSessionInfo}>
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

