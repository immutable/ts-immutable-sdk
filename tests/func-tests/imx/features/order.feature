Feature: Order
  # skip because the test is failing
  @order @sellorder @ethSignature
  Scenario: Create Sell Order without existing sell order
    Given A new Eth wallet "seller"
    And "seller" is registered
    And randomly L2 mint to "seller" of "minted"
    And NFT "minted" should be available through api

    When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.00001" eth using v3 api
    Then api should show that order "sellOrder" status is "active"

  # @order @sellorder @ethSignature
  # Scenario: Create Sell Order with 2% seller marketplace fee
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.00001" eth using v3 api with 2% marketplace fee
  #   Then api should show that order "sellOrder" status is "active"
  #   Then api should show that order "sellOrder" has total fee of "0.0000002" unquantized amount

  # @order @sellorder @ethSignature
  # Scenario: Create Sell Order with 100% seller marketplace fee
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.00001" eth using v3 api with 100% marketplace fee
  #   Then api should show that order "sellOrder" status is "active"
  #   Then api should show that order "sellOrder" has net maker quantity with fees of 0 unquantized amount

  # @order @sellorder @ethSignature
  # Scenario: Create Sell Order replaces existing sell order
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.00001" eth using v3 api
  #   Then api should show that order "sellOrder" status is "active"

  #   When "seller" creates sell order "sellOrder2" of "minted" NFT to sell for "0.00002" eth using v3 api
  #   Then api should show that order "sellOrder2" status is "active"
  #   Then api should show that order "sellOrder" status is "cancelled"

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) - without sell order should fail
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   And banker transfer "0.000011" eth to "buyer"

  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'not allowed to create a buy order for an asset without a matching listing'

  @order @buyorder @ethSignature
  Scenario: Create Buy Order (V3) - Asset with sell order
    # setup seller
    Given A new Eth wallet "seller"
    And "seller" is registered
    And randomly L2 mint to "seller" of "minted"
    And NFT "minted" should be available through api
    # setup 'potential buyer'
    And A new Eth wallet "buyer"
    And "buyer" is registered
    And banker is registered
    And banker transfer "0.000022" eth to "buyer"

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.0002" eth using v3 api
  #   # neeeds to be at least 10% of the sell order
  #   And "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.000020" eth using v3 api
  #   Then api should show that order "buyOrder" status is "active"
  #   And api should show that order "sellOrder" status is "active"

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) - with amount less than 10% of matching sell order should fail
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   And banker transfer "0.000011" eth to "buyer"

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.0002" eth using v3 api
  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'amount too low'

  # @order @buyorder @ethSignature @v3_fees
  # Scenario: Create Buy Order (V3) with royalty and buyer marketplace fee
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint with 1% royalty to "seller" of "minted"
  #   And NFT "minted" should be available through api with royalty of 1
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   # bids required to be at least 10% of available sell orders 0.0002 + 0.00002
  #   And banker transfer "0.0000225" eth to "buyer"

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.0002" eth using v3 api
  #   And "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00002" eth using v3 api with 2% marketplace fee
  #   Then api should show that order "buyOrder" status is "active"
  #   # 5 percent fees (2%ecosystem + 2%protocol + 1%royalty)
  #   Then api should show that order "buyOrder" has total fee of "0.000001" unquantized amount
  #   And api should show that order "sellOrder" status is "active"

  # @order @buyorder @ethSignature @v3_fees @fail
  # Scenario: Create Buy Order (V3) with insufficient credit to cover for fees should fail
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint with 1% royalty to "seller" of "minted"
  #   And NFT "minted" should be available through api with royalty of 1
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   # bids required to be at least 10% of available sell orders: buy order of 0.00002
  #   # + additional 0.000001 to cover for marketplace + protocol + royalty fees
  #   And banker transfer "0.00002" eth to "buyer"

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.0002" eth using v3 api
  #   And "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00002" eth using v3 api with 2% marketplace fee should fail with 'insufficient ETH balance'

  # # Note: skipping for now as we don't have an effective way to test obtain no eth currency
  # # @order @buyorder @ethSignature
  # # Scenario: Create Buy Order (V3) - Multiple in different currency
  # #   # setup seller
  # #   Given A new Eth wallet "seller"
  # #   And "seller" is registered
  # #   And randomly L2 mint to "seller" of "minted"
  # #   And NFT "minted" should be available through api
  # #   # setup 'potential buyer'
  # #   And A new Eth wallet "buyer"
  # #   And "buyer" is registered
  # #   And banker is registered
  # #   And banker transfer "0.00001" eth to "buyer"

  # #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api
  # #   Then api should show that order "buyOrder" status is "active"

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) fails - Buyer 0 Balance (no vault)
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered

  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'vault not found for asset'

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) - Buyer not enough balance
  #   # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   And banker transfer "0.000008" eth to "buyer"

  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'has insufficient'

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) fails - Same currency twice
  #  # setup seller
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And banker is registered
  #   And banker transfer "0.000011" eth to "buyer"

  #   # order number 1
  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.0001" eth using v3 api
  #   And "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api
  #   Then api should show that order "buyOrder" status is "active"

  #   # order number 2
  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'with same stark key'

  # @order @buyorder @ethSignature
  # Scenario: Create Buy Order (V3) fails - Buyer owns asset
  #   # setup 'potential buyer'
  #   And A new Eth wallet "buyer"
  #   And "buyer" is registered
  #   And randomly L2 mint to "buyer" of "minted"
  #   And NFT "minted" should be available through api
  #   And banker is registered
  #   And banker transfer "0.000011" eth to "buyer"

  #   When "buyer" creates buy order "buyOrder" of "minted" NFT to buy for "0.00001" eth using v3 api should fail with 'buyer already owns asset'

  # @order @cancelorder @ethSignature
  # Scenario: Cancel V3 should cancel Sell Order V3
  #   Given A new Eth wallet "seller"
  #   And "seller" is registered
  #   And randomly L2 mint to "seller" of "minted"
  #   And NFT "minted" should be available through api

  #   When "seller" creates sell order "sellOrder" of "minted" NFT to sell for "0.00001" eth using v3 api with 2% marketplace fee
  #   Then api should show that order "sellOrder" status is "active"

  #   When "seller" v3_cancels order "sellOrder"
  #   Then api should show that order "sellOrder" status is "cancelled"
