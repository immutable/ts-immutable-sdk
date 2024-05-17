// PassportButton.tsx
import { Button, Box, Text } from '@chakra-ui/react';
import PassportSymbol from '../../assets/passport_logo_32px.svg?react';

interface PassportButtonProps {
  title: string;
  onClick: () => void;
}

export function PassportButton({ title, onClick }: PassportButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      backgroundColor="#F3F3F3"
      height="48px"
      borderRadius="48px"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      color="black"
      paddingX="10px" // shorthand for paddingLeft and paddingRight
      _hover={{ bg: "#e2e2e2" }} // optional hover effect
      _active={{ bg: "#d1d1d1" }} // optional active state effect
    >
      <Box marginRight="12px" height="32px" width="32px" as={PassportSymbol} />
      <Text>{title}</Text>
    </Button>
  );
}

export default PassportButton;