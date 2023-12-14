Feature: Transfer

  # @transfer @ethSignature @core-sdk @transferNFT
  # Scenario: Transfer NFT
  #   Given A new Eth wallet "owner"
  #   And A new Eth wallet "receiver"
  #   And "owner" is registered
  #   And "receiver" is registered
  #   And randomly L2 minted to "owner" of "minted"
  #   And NFT "minted" should be available through api

  #   When "owner" creates transfer "transfer1" of "minted" NFT to "receiver"

  #   Then transfer "transfer1" should be available through api
  #   And api should show that "receiver" owns the NFT "minted"

  # @transfer @ethSignature @transferNFT
  # Scenario: Transfer Batch NFT
  #   Given A new Eth wallet "owner"
  #   And A new Eth wallet "receiver"
  #   And "owner" is registered
  #   And "receiver" is registered
  #   And banker is registered
  #   And banker has L2 balance "bankerBalance" of at least "0.00001"
  #   And banker transfer "0.00001" eth to "owner"
  #   And randomly L2 minted to "owner" of "minted"
  #   And NFT "minted" should be available through api

  #   When "owner" creates batch transfer "transfer1" of "minted" NFT to "receiver"

  #   Then batch transfer "transfer1" should be available through api
  #   And api should show that "receiver" owns the NFT "minted"
  #   And "owner" transfer "0.00001" eth to banker

  # @transfer @ethSignature @transferNFT
  # Scenario: Transfer Batch NFTs
  #   Given A new Eth wallet "owner"
  #   And A new Eth wallet "receiver1"
  #   And "owner" is registered
  #   And "receiver1" is registered
  #   And banker is registered
  #   And banker has L2 balance "bankerBalance" of at least "0.00001"
  #   And banker transfer "0.00001" eth to "owner"
  #   And randomly L2 minted to "owner" of "minted1"
  #   And randomly L2 minted to "owner" of "minted2"
  #   And NFT "minted1" should be available through api
  #   And NFT "minted2" should be available through api

  #   When "owner" creates batch transfer "transfer1" of "minted1" NFT to "receiver1" and "minted2" NFT to "receiver1"

  #   Then batch transfer "transfer1" should be available through api
  #   And api should show that "receiver1" owns the NFT "minted1"
  #   And api should show that "receiver1" owns the NFT "minted2"
  #   And "owner" transfer "0.00001" eth to banker

  # @transfer @ethSignature @transferNFT
  # Scenario: Transfer Batch NFT to 2 users
  #   Given A new Eth wallet "owner"
  #   And A new Eth wallet "receiver1"
  #   And A new Eth wallet "receiver2"
  #   And "owner" is registered
  #   And "receiver1" is registered
  #   And "receiver2" is registered
  #   And banker is registered
  #   And banker has L2 balance "bankerBalance" of at least "0.00001"
  #   And banker transfer "0.00001" eth to "owner"
  #   And randomly L2 minted to "owner" of "minted1"
  #   And randomly L2 minted to "owner" of "minted2"
  #   And NFT "minted1" should be available through api
  #   And NFT "minted2" should be available through api

  #   When "owner" creates batch transfer "transfer1" of "minted1" NFT to "receiver1" and "minted2" NFT to "receiver2"

  #   Then batch transfer "transfer1" should be available through api
  #   And api should show that "receiver1" owns the NFT "minted1"
  #   And api should show that "receiver2" owns the NFT "minted2"
  #   And "owner" transfer "0.00001" eth to banker

  @transfer  @ethSignature @transferETH @skip
  Scenario: Transfer ETH
    Given A new Eth wallet "owner"
    And A new Eth wallet "receiver"
    And "owner" is registered
    And "receiver" is registered
    And banker is registered
    And banker has L2 balance "bankerBalance" of at least "0.00001"
    And banker transfer "0.00001" eth to "owner"

    When "owner" creates transfer "transfer1" of "0.00001" ETH to "receiver"

    Then transfer "transfer1" should be available through api
    And api should show that "receiver" balance is "0.00001" ETH
    # cleanup
    And "receiver" transfer "0.00001" eth to banker
