import { Link } from "@biom3/react";

interface EtherscanLinkProps {
    hash: string
}

export const EtherscanLink = (props: EtherscanLinkProps) => {
  const { hash } = props;

  return (
    <Link
      testId='etherscan-link'
      href={`https://etherscan.io/tx/${hash}`}
      target='_blank'
    >
      View your transaction on Etherscan
    </Link>
  )
}
