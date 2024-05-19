// UserInfo.tsx
import { Box, Flex, Text } from '@chakra-ui/react';

interface UserInfoProps {
  id: string;
  email: string;
  walletAddress: string;
}

function UserInfo({
  id,
  email,
  walletAddress
}: UserInfoProps) {
  return (
    <Box 
      className='user-info' 
      width="550px" 
      padding="12px" 
      borderRadius="12px" 
      border="0.5px solid lightgray" 
      wordBreak="break-all" 
      textAlign="left" 
      fontSize="md"
    >
      <UserInfoRow label="Id:" value={id} />
      <UserInfoRow label="Email:" value={email} />
      {walletAddress && <UserInfoRow label="Wallet:" value={walletAddress} />}
    </Box>
  );
}

interface UserInfoRowProps {
  label: string;
  value: string;
}

function UserInfoRow({ label, value }: UserInfoRowProps) {
  return (
    <Flex 
      direction="row" 
      justify="space-between" 
      align="center" 
      width="100%"
    >
      <Text fontWeight="bold">{label}</Text>
      <Text>{value}</Text>
    </Flex>
  );
}

export default UserInfo;
