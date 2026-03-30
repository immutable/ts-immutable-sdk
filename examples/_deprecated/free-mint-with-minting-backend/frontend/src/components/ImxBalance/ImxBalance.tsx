import { useImxBalance } from "../../hooks/useImxBalance";
import { shortenAddress } from "../../utils/walletAddress";
import config, { applicationEnvironment } from "../../config/config";
import { Flex, Image, Text, IconButton, useClipboard, useToast, Link } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { useContext, useEffect } from 'react';
import PassportSymbol from '../../assets/passport_logo_32px.svg?react';
import { EIP1193Context } from "../../contexts/EIP1193Context";

function ImxBalance() {
  const {walletAddress, provider, isPassportProvider} = useContext(EIP1193Context);
  const { loading, formattedBalance } = useImxBalance(provider!, walletAddress);
  const { onCopy, hasCopied } = useClipboard(walletAddress.toLowerCase());
  const toast = useToast();

  useEffect(() => {
    // Only trigger the toast if the copy action has occurred
    if (hasCopied) {
      toast({
        title: "Address copied!",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [hasCopied, toast]); // Add toast to dependency array to avoid exhaustive-deps warning

  function goToExplorer() {
    window.open(`${config[applicationEnvironment].explorerUrl}/address/${walletAddress}`, "_blank");
  }

  function handleCopy() {
    onCopy();
  }

  if (loading) return null;  // Render nothing if loading

  return (
    <Flex flexDir={"column"} gap="2" paddingX={3}>
      <Flex gap={2} alignItems={"center"}>
        <Image src="https://checkout-cdn.immutable.com/v1/blob/img/tokens/imx.svg" height="20px" width={"20px"} />
        <Text fontWeight="bold">{formattedBalance.substring(0, 10)}</Text>
      </Flex>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Flex gap={2}>
          {isPassportProvider && <PassportSymbol height={"20px"} width={"20px"} />}
          <Link cursor="pointer" onClick={goToExplorer}>
            {shortenAddress(walletAddress)}
          </Link>
        </Flex>
          <IconButton
          icon={<CopyIcon />}
          size="xs"
          aria-label="Copy address"
          onClick={handleCopy}
        />
      </Flex>
    </Flex>
  );
}

export default ImxBalance;
