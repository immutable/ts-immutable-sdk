Feature: Tokens

  @tokens @skip
  Scenario: Deploy an ERC20 contract
    Given "deployer" has at least "0.01" IMX
    When deployer deploys an ERC20 contract "TSTCoin" with symbol "TST"
    Then deployed erc20 contract should be indexed correctly

  @tokens @skip
  Scenario: List tokens
    Then sdk should list tokens
