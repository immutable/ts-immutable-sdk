Feature: Minting

  @minting @core-sdk
  Scenario: Minting
    Given A new Eth wallet "wallet"
    And "wallet" is registered
    Then user "wallet" should be available through api
    # TODO: We assume a contract has been registered and it"s address minter and its private key (TEST_WALLET1_PRIVATE_KEY) have been set in the .env file
    # well need to cover that as test as well later on.
    When randomly L2 mint to "wallet" of "minted"
    Then NFT "minted" should be available through api
