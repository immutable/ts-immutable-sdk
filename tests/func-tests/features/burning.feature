Feature: Burning

  # requires minting to be setup. should be quick 

  @burning
  Scenario: Burning
    Given A new Eth wallet "owner"
    And "owner" is registered
    And randomly L2 minted to "owner" of "minted"
    And NFT "minted" should be available through api

    When "owner" creates burn "burn1" of "minted" NFT to burn address

    Then burn "burn1" should be available through api
    And api should show that NFT "minted" status is "burned"
