import { grid, offsets, rooms, type Direction, type RoomId } from "./rooms";

export interface PlayerState {
  roomId: RoomId;
  hasVisitedKitchen: boolean;
}

export interface GameState extends PlayerState {
  previousRoom: RoomId | null;
  transitionId: number;
  message: string;
}

export type GameAction =
  | { type: "move"; direction: Direction; animate: boolean }
  | { type: "finish-fade"; transitionId: number }
  | { type: "reduce-motion" };

export const initialState: GameState = {
  roomId: "rocks",
  hasVisitedKitchen: false,
  previousRoom: null,
  transitionId: 0,
  message: "The tide is coming in. The lighthouse is waiting.",
};

export function destination(roomId: RoomId, direction: Direction): RoomId | undefined {
  const y = grid.findIndex(row => row.includes(roomId));
  const x = grid[y].indexOf(roomId);
  const [dx, dy] = offsets[direction];
  return grid[y + dy]?.[x + dx];
}

// All movement rules live here. No React, animation, DOM, or browser is needed.
export function movePlayer(player: PlayerState, direction: Direction): PlayerState & { message: string } {
  const target = destination(player.roomId, direction);
  if (!target) {
    return {
      roomId: player.roomId,
      hasVisitedKitchen: player.hasVisitedKitchen,
      message: rooms[player.roomId].blocked[direction] ?? "There is no path in that direction.",
    };
  }
  return {
    roomId: target,
    hasVisitedKitchen: player.hasVisitedKitchen || target === "kitchen",
    message: `You go ${direction}.`,
  };
}

export function availableDestination(player: PlayerState, direction: Direction): RoomId | undefined {
  const result = movePlayer(player, direction);
  return result.roomId === player.roomId ? undefined : result.roomId;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "reduce-motion") return { ...state, previousRoom: null };
  if (action.type === "finish-fade") {
    return action.transitionId === state.transitionId ? { ...state, previousRoom: null } : state;
  }
  const result = movePlayer(state, action.direction);
  if (result.roomId === state.roomId) {
    return { ...state, message: result.message };
  }
  return {
    ...result,
    previousRoom: action.animate ? state.roomId : null,
    transitionId: state.transitionId + 1,
  };
}
