Feature: Refresh

  @refresh @skip
  Scenario: Refresh Collection Metadata
    Then sdk should refresh collection metadata
    And sdk should queue a refresh for multiple token metadata
    And sdk should fetch refreshed token with a refreshed result
    And sdk should queue a refresh for multiple token metadata
    And sdk should fetch refreshed token with a refreshed result
