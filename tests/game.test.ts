import assert from "node:assert/strict";
import test from "node:test";
import { availableDestination, gameReducer, initialState, movePlayer } from "../src/lib/game";

test("up from the Rocks is locked before visiting the Keeper's Kitchen", () => {
  const result = gameReducer(initialState, { type: "move", direction: "north", animate: true });

  assert.deepEqual(
    { roomId: result.roomId, message: result.message },
    { roomId: "rocks", message: "The lamp room door is locked." },
  );
  assert.equal(result.previousRoom, null, "A locked door must not start a room transition");
});

test("plain movement function unlocks the door and keeps it unlocked", () => {
  const start = Object.freeze({ roomId: "rocks" as const, hasVisitedKitchen: false });
  assert.equal(availableDestination(start, "north"), undefined);
  assert.equal(movePlayer(start, "north").message, "The lamp room door is locked.");

  const kitchen = movePlayer(start, "west");
  const rocks = movePlayer(kitchen, "east");
  assert.equal(availableDestination(rocks, "north"), "lamp");
  const lamp = movePlayer(rocks, "north");
  assert.equal(lamp.roomId, "lamp");
  assert.equal(movePlayer(movePlayer(lamp, "south"), "north").roomId, "lamp");
  assert.deepEqual(start, { roomId: "rocks", hasVisitedKitchen: false });
});

test("the Lamp Room also stays locked when approached from the Spiral Stair", () => {
  const stair = { roomId: "stair" as const, hasVisitedKitchen: false };
  assert.deepEqual(movePlayer(stair, "east"), {
    ...stair,
    message: "The lamp room door is locked.",
  });
});

test("an ordinary blocked direction neither moves the player nor unlocks the door", () => {
  const result = movePlayer(initialState, "south");
  assert.deepEqual(result, {
    roomId: "rocks",
    hasVisitedKitchen: false,
    message: "The rising sea cuts off the way south.",
  });
});

test("visiting the Keeper's Kitchen unlocks up from the Rocks", () => {
  const kitchen = gameReducer(initialState, { type: "move", direction: "west", animate: false });
  assert.equal(kitchen.roomId, "kitchen");

  const rocks = gameReducer(kitchen, { type: "move", direction: "east", animate: false });
  assert.equal(rocks.roomId, "rocks");

  const lamp = gameReducer(rocks, { type: "move", direction: "north", animate: false });
  assert.equal(lamp.roomId, "lamp");
  assert.equal(lamp.message, "You go north.");
});
