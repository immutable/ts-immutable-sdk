Feature: Minting

  @minting @core-sdk @only
  Scenario: Minting
    Given A new Eth wallet "wallet"
    And "wallet" is registered
    Then user "wallet" should be available through api
    # TODO(shineli): We assume a contract has been registered and it"s address minter and its private key (PRIVATE_KEY1) have been set in the .env file
    # well need to cover that as test as well later on.
    When randomly L2 mint to "wallet" of "minted"
    Then NFT "minted" should be available through api
