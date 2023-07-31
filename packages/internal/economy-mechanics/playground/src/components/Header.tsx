import React from "react";
import { AppHeaderBar, Button } from "@biom3/react";
import { UserProfile } from "@imtbl/passport";
import { usePassportProvider } from "../context/PassportProvider";

function Header() {
  const { connect, getUserInfo, logout } = usePassportProvider();
  const [userProfile, setUserProfile] = React.useState<UserProfile | undefined>(
    undefined
  );

  React.useEffect(() => {
    getUserInfoAsync();
  }, []);

  const getUserInfoAsync = async () => {
    const userInfo = await getUserInfo();
    console.log(userInfo);
    setUserProfile(userInfo);
  };

  const onLoginClick = async () => {
    await connect();
    await getUserInfoAsync();
  };

  const onLogoutClick = async () => {
    logout();
    await getUserInfoAsync();
  };

  const renderRightSide = () => {
    if (userProfile !== undefined) {
      return (
        <Button onClick={onLogoutClick}>
          <Button.Logo
            logo="PassportSymbolOutlined"
            sx={{
              mr: "base.spacing.x1",
              ml: "0",
              width: "base.icon.size.400",
            }}
          />
          {userProfile.email}, Logout
        </Button>
      );
    }
    return (
      <Button onClick={onLoginClick}>
        <Button.Logo
          logo="PassportSymbolOutlined"
          sx={{
            mr: "base.spacing.x1",
            ml: "0",
            width: "base.icon.size.400",
          }}
        />
        Login with Passport
      </Button>
    );
  };

  return (
    <AppHeaderBar size="small" contentAlign="left">
      <AppHeaderBar.LeftLogo logo="ImmutableSymbol" />
      <AppHeaderBar.Title>Economy Mechanics Playground</AppHeaderBar.Title>
      <AppHeaderBar.RightHandButtons>
        {renderRightSide()}
      </AppHeaderBar.RightHandButtons>
    </AppHeaderBar>
  );
}

export default Header;
