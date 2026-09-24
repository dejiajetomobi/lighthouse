export type Direction = 'north' | 'east' | 'south' | 'west';
export type RoomId = 'stair' | 'lamp' | 'kitchen' | 'rocks';
interface Room {
  name: string;
  mood: string;
  imageAlt: string;
  description: string;
  blocked: Partial<Record<Direction, string>>;
}

// Rows run north to south; columns run west to east.
export const grid: readonly (readonly RoomId[])[] = [
  ['stair', 'lamp'],
  ['kitchen', 'rocks'],
];
export const rooms: Record<RoomId, Room> = {
  stair: {
    name: 'Spiral Stair',
    mood: 'Hushed & mysterious',
    imageAlt: 'Violet shadows fall across a worn iron spiral stair, with warm light spilling down from above.',
    description: 'An iron staircase curls around a stone pillar, its steps silver with wear. Amber light spills from the Lamp Room to the east, and a doorway opens south into the kitchen.',
    blocked: { north: 'The stone wall closes off the north side.', west: 'A sheer lighthouse wall blocks the way west.' },
  },
  lamp: {
    name: 'Lamp Room',
    mood: 'Radiant & hopeful',
    imageAlt: 'A golden Fresnel lens shines through the lantern windows over a dark sea.',
    description: 'A great glass lens casts a golden beam over the dark water. The spiral stair waits to the west, and an outdoor stair descends south to the rocks.',
    blocked: { north: 'Thick lantern glass bars the way north.', east: 'Beyond the eastern glass is a steep drop to the sea.' },
  },
  kitchen: {
    name: "Keeper's Kitchen",
    mood: 'Warm & sheltered',
    imageAlt: 'A terracotta kitchen with a copper kettle, a glowing stove, bread and an open logbook.',
    description: 'A copper kettle rests on the stove beside a loaf of bread and an open logbook. Through the northern doorway you see the spiral stair, while the eastern door opens onto the rocks.',
    blocked: { south: 'A sturdy kitchen wall blocks the way south.', west: 'The western window is too narrow to climb through.' },
  },
  rocks: {
    name: 'Rocks',
    mood: 'Windy & restless',
    imageAlt: 'Stormy blue waves break over dark rocks beside the lighthouse door and outdoor stair.',
    description: 'Black rocks glisten beneath your feet, and white surf breaks against the shore. A narrow stair climbs north to the lamp, while a weathered kitchen door stands to the west.',
    blocked: { south: 'The rising sea cuts off the way south.', east: 'Crashing waves make the eastern rocks impassable.' },
  },
};
export const directions: readonly Direction[] = ['north', 'east', 'south', 'west'];
export const offsets: Record<Direction, readonly [number, number]> = {
  north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0],
};
export const keys: Record<string, Direction | undefined> = {
  ArrowUp: 'north', ArrowRight: 'east', ArrowDown: 'south', ArrowLeft: 'west',
};
