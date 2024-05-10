Feature: orderbook

    Creating listings and fulifilling orders

    Scenario: creating and fulfilling a ERC721 listing
        Given I have a funded offerer account
        And the offerer account has 1 ERC721 token
        And I have a funded fulfiller account
        When I create a listing to sell 1 token
        Then the listing should be active
        And when I fulfill the listing
        Then the listing should be filled
        And the NFT should be transferred to the fulfiller
        And 1 trade should be available

    Scenario: create and completely fill a ERC1155 listing
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 tokens
        Then the listing should be active
        And when I fulfill the listing to buy 100 tokens
        Then the listing should be filled
        And 100 tokens should be transferred to the fulfiller
        And 1 trade should be available

    Scenario: create and partially fill a ERC1155 listing
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 tokens
        Then the listing should be active
        And when I fulfill the listing to buy 90 tokens
        Then the listing should be active
        And 90 tokens should be transferred to the fulfiller
        And 1 trade should be available
        And when I fulfill the listing to buy 10 tokens
        Then the listing should be filled
        # Checks for the total amount of tokens transferred - 100 = 90 from first fulfilment + 10 from second fulfilment
        And 100 tokens should be transferred to the fulfiller
        And 2 trades should be available
