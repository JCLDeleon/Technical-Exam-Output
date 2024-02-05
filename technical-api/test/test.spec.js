import request from "superwstest";
import expect from "expect.js";

const server = "http://localhost:3100";
const purchase_input = { coinId: 2, amount: 3 };

const purchase_coin = () => {
  request(server)
    .post("/purchase-coin")
    .send(purchase_input)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .expect(200)
    .then((data) => {
      var response = JSON.parse(data.text);
      expect(response["success"]).to.be(true);
    });
};

describe("when testing the endpoints", () => {
  afterEach(() => {
    request.closeAll(); // recommended when using remote servers
  });

  it("POST /purchase-coin", async () => {
    purchase_coin();
  });

  it("GET /get-coins", async () => {
    request(server).post("/get-coins").expect(200);
  });

  it("GET /get-inventory", async () => {
    request(server).post("/get-inventory").expect(200);
  });
});

describe("when testing the websocket", () => {
  afterEach(() => {
    request.closeAll(); // recommended when using remote servers
  });

  it("tests that CoinB increments by one dollar with each message over a period of time", async () => {
    await request(server)
      .ws("/")
      .expectJson()
      .wait(6000)
      .expectJson()
      .wait(6000)
      .expectJson()
      .wait(6000)
      .expectJson((data) => {
        //Assert that the price of CoinB will be equal to 100 + time
        var assert_price = data.time + 100;
        var CoinB = data.coins[2].price;

        expect(CoinB).to.be.equal(assert_price);
      });
  });

  it("tests that `inventory.<coinId>.amountOwned` correctly reflects your owned inventory following a `purchase-coin` execution.F", async () => {
    var p_coins_owned = 0;
    var coin_index = purchase_input.coinId - 1;

    await request(server)
      .ws("/")
      .expectJson((data) => {
        p_coins_owned = data.inventory[coin_index].amountOwned;
      })
      .exec(() => {
        purchase_coin();
      })
      .wait(6000)
      .expectJson((data) => {
        var total_coin = p_coins_owned + purchase_input.amount;
        expect(data.inventory[coin_index].amountOwned).to.be.equal(total_coin);
      });
  });
});
