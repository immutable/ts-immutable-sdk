Feature: orderbook

    Creating listings and fulifilling orders

    Scenario: creating and fulfilling a ERC721 listing
        Given I have a funded offerer account
        And the offerer account has 1 ERC721 token
        And I have a funded fulfiller account
        When I create a listing to sell 1 ERC721 token
        Then the listing should be of status active
        When I fulfill the listing to buy 1 token
        Then the listing should be of status filled
        And 1 ERC721 token should be transferred to the fulfiller
        And 1 trade should be available

    Scenario: create and completely fill a ERC1155 listing
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 ERC1155 tokens
        Then the listing should be of status active
        When I fulfill the listing to buy 100 tokens
        Then the listing should be of status filled
        And 100 ERC1155 tokens should be transferred to the fulfiller
        And 1 trade should be available

    Scenario: create and partially fill a ERC1155 listing
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 ERC1155 tokens
        Then the listing should be of status active
        When I fulfill the listing to buy 90 tokens
        Then the listing should be of status active
        And 90 ERC1155 tokens should be transferred to the fulfiller
        And 1 trade should be available
        When I fulfill the listing to buy 10 tokens
        Then the listing should be of status filled
        # Checks for the total amount of tokens transferred - 100 = 90 from first fulfilment + 10 from second fulfilment
        And 100 ERC1155 tokens should be transferred to the fulfiller
        And 2 trades should be available

    Scenario: create and bulk fill multiple listings
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And the offerer account has 1 ERC721 token
        And I have a funded fulfiller account
        When I create a listing to sell 100 ERC1155 tokens
        When I create a listing to sell 1 ERC721 token
        Then the listings should be of status active
        When I bulk fulfill the listings with a partial fill of 90 units for the ERC1155 listing
        # Assert only the ERC721 is filled
        Then the listing should be of status filled
        And 90 ERC1155 tokens should be transferred to the fulfiller
        # Assert only the ERC1155 is still active
        Then the listing should be of status active
        # Assert only the ERC1155 trade in this scenario
        And 1 trade should be available

    Scenario: create and fully fill a ERC1155 listing without an explicit fulfill amount
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 ERC1155 tokens
        Then the listing should be of status active
        When I fulfill the listing to buy tokens
        Then the listing should be of status filled
        And 100 ERC1155 tokens should be transferred to the fulfiller
        And 1 trade should be available

    Scenario: create and partially fill a ERC1155 listing, second fill without explicit amount
        Given I have a funded offerer account
        And the offerer account has 100 ERC1155 tokens
        And I have a funded fulfiller account
        When I create a listing to sell 100 ERC1155 tokens
        Then the listing should be of status active
        When I fulfill the listing to buy 90 tokens
        Then the listing should be of status active
        And 90 ERC1155 tokens should be transferred to the fulfiller
        And 1 trade should be available
        When I fulfill the listing to buy tokens
        Then the listing should be of status filled
        # Checks for the total amount of tokens transferred - 100 = 90 from first fulfilment + 10 from second fulfilment
        And 100 ERC1155 tokens should be transferred to the fulfiller
        And 2 trades should be available