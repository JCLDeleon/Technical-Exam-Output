describe("on load of the front end", () => {

  beforeEach("Visit baseURL", () => {
    cy.visit("/");
  });

  it("should verify the beginning balance", () => {
    var balance = 1000

    //Check Total Balance Text if it contains 1000
    cy.contains("USD Balance").should("contain.text", balance);
  });

  it("should verify the total number of coins", () => {
    var total_coin_options = 4

    //Check total length of Inventory Coins if it is equal to 4
    cy.get(".inventory-item").should('have.lengthOf', total_coin_options);

    //Check total length of Coin Options if it is equal to 4
    cy.get(".ticket-name").should('have.lengthOf', total_coin_options);
  });

});


describe("after buying three coins", () => {
  var coins_index = 2
  var coins_purchased = 3

  function onlyNumbers(text){
    return text.replace(/\D/g, "");
  }

  beforeEach("Visit baseURL and purchase 3 coins", () => {
    cy.visit("/")
    
    //command to buy coins
    cy.buy_coins(coins_index, coins_purchased)
  });

  it("checks the coins owned", () => {
    //Assert that the inventory coins owned is equal to purchased coins.
    cy.get(".inventory-item").eq(coins_index).contains("Coins owned:").should('contain.text', coins_purchased)
  });

  it("checks that the Market value correctly reflects the cost per coin", () => {
    //Added wait to assure that the values changes
    cy.wait(5000)

    //Get the inventory market value price
    cy.get(".inventory-item").eq(coins_index).contains("Market").invoke('text')
    .then((text) => {
      //Divide market value price by coins purchased
      cy.wrap(parseInt(onlyNumbers(text))/coins_purchased).as("market_val")
    })

    cy.get('@market_val').then((value) => {
      //Assert that the market value price divided by coins purchased is equal to price per coin in the options.
      cy.get(".ticket-price").eq(coins_index).should('contain.text', value)
    })
  });
  
});

