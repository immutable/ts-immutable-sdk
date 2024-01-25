Feature: Withdrawal

  # @withdrawal @onchain
  # Scenario: Withdraw NFT
  #   Given A new Eth wallet "user1"
  #   And "user1" is registered
  #   # TODO(shineli): We assume a contract has been registered and it"s address minter and its private key (TEST_WALLET1_PRIVATE_KEY) have been set in the .env file
  #   # well need to cover that as test as well later on.
  #   And randomly L2 mint to "user1" of "minted"
  #   And NFT "minted" should be available through api
  #   When user "user1" prepare withdrawal of NFT "minted"
  #   Then NFT "minted" should be in "preparing_withdrawal" status
  #   When force new batch
  #   Then NFT "minted" should be in "withdrawable" status
  #   When user "user1" completes withdrawal of NFT "minted"
  #   Then NFT "minted" should be in "withdrawn" status

  # @withdrawal @onchain @ethSignature @nftWithdrawal
  # Scenario: Withdraw NFT
  #   Given A new Eth wallet "user1"
  #   And "user1" is registered
  #   # TODO(shineli): We assume a contract has been registered and it"s address minter and its private key (TEST_WALLET1_PRIVATE_KEY) have been set in the .env file
  #   # well need to cover that as test as well later on.
  #   And randomly L2 mint to "user1" of "minted"
  #   And NFT "minted" should be available through api
  #   When user "user1" prepare withdrawal of NFT "minted"
  #   Then NFT "minted" should be in "preparing_withdrawal" status

  # TODO: DX-2598 - skipping this test for now as it keeps randomly failing in CI
  @withdrawal @withdrawalETH @onchain @ethSignature @prepareWithdrawal @skip
  Scenario: Withdraw ETH
    Given A new Eth wallet "user1"
    And "user1" is registered
    And banker is registered
    And banker has L2 balance "bankerBalance" of at least "0.00001"
    And banker transfer "0.00001" eth to "user1"
    When user "user1" prepare withdrawal "withdrawal1" of ETH "0.00001"
    Then ETH withdrawal "withdrawal1" should be in "success" status

  @withdrawal @withdrawalETH @onchain @ethSignature @completeEthWithdrawal @skip
  Scenario: Complete withdraw ETH
    Given A new Eth wallet "user1"
    And "user1" is registered
    Then user "user1" completes withdrawal of ETH


  # @withdrawal @completeWithdrawalNFT
  # Scenario: Complete withdraw ERC721
  #   Given A new Eth wallet "user1"
  #   And "user1" is registered
  #   Then user "user1" completes withdrawal of a withdrawable NFT


  # @withdrawal @completeERC20Withdrawal
  # Scenario: Complete withdraw ERC20
  #   Given A new Eth wallet "user1"
  #   And "user1" is registered
  #   Then user "user1" completes withdrawal of a ERC20
