Feature: Sale

  # @sale @orderbook
  # Scenario: Index a sale activity
  #  Given "buyer" has at least "0.000000000001" IMX
  #  When an order is fulfilled for "0.000000000001" IMX
  #  Then the fulfilled order is indexed as a sale activity

  @sale
  Scenario: Check for indexed sales
    Then sdk should list sale activities
    And sdk should fetch a sale activity
