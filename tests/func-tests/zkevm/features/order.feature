Feature: orderbook

    Creating listings and fulifilling orders

    Scenario: creating and fulfilling a listing
        Given I have have a funded offerer account with a minted NFT
        And I have have a funded fulfiller account
        When I create a listing
        Then the listing should be active
        And when I fulfill the listing 
        Then the listing should be filled
        And the NFT should be transferred to the fulfiller
        And the trade data should be available
