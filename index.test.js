const { Ship, Gameboard, Player } = require("./index");

describe("Ship", () => {
  let ship; // This will hold an instance of the Ship class

  // Run before each test case
  beforeEach(() => {
    ship = new Ship(3); // Create a new ship with length 3 before each test
  });

  // Test for hit
  test("hit() should increment the number of hits", () => {
    expect(ship.hits).toBe(0); // initially, no hits

    ship.hit(); // Call hit to increase hits
    expect(ship.hits).toBe(1); // after one hit, it should be 1

    ship.hit(); // Call hit again
    expect(ship.hits).toBe(2); // after two hits, it should be 2
  });

  // Test for isSunk() when ship is not sunk
  test("isSunk() should return false if the ship is not sunk", () => {
    expect(ship.isSunk()).toBe(false); // initially, the ship is not sunk
  });

  // Test for isSunk() when ship is sunk
  test("isSunk() should return true if the ship is sunk", () => {
    ship.hit(); // First hit
    ship.hit(); // Second hit
    expect(ship.isSunk()).toBe(false); // after two hits, it should not be sunk yet

    ship.hit(); // Third hit
    expect(ship.isSunk()).toBe(true); // after 3 hits, it should be sunk
    expect(endOfGame()).toBe(true); // game should end after all ships sunk
  });
});
