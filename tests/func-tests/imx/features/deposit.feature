Feature: Deposit

  # Port across ETH tests 

  # This test can take up to 10 minutes, so skip it on CI
  @deposit @onchain @core-sdk @slow
  Scenario: Deposit Eth
    Given banker has at least "1" eth balance on L1
    And banker has L2 balance of "bankerBalance"
    When banker deposits "0.00001" eth
    Then banker should have balance "bankerBalance" increased by "0.00001" eth

  # @onchain @core-sdk @erc20
  # Scenario: Deposit ERC20
  #   Given banker has at least "1" "IMX" balance on L1
  #   And banker has L2 balance of "bankerBalance" "IMX"
  #   When banker deposits "10000000000000" "IMX"
  #   Then banker should have balance "bankerBalance" increased by "0.00001" "IMX"

  # @onchain @core-sdk @erc721
  # Scenario: Deposit ERC721
  #   Given banker owns token "802381618" from collection "0x8c7bff9bbc01296ae974d725eeeeed9657a285b0" on L1
  #   When banker deposits token "802381618" from collection "0x8c7bff9bbc01296ae974d725eeeeed9657a285b0"

