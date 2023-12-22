Feature: Registration

  @registration @core-sdk
  Scenario: Registration
    Given A new Eth wallet "owner"
    And "owner" is registered
    Then user "owner" should be available through api
