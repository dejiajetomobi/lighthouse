"use strict";
// Rows run north to south; columns run west to east.
const grid = [
    ['stair', 'lamp'],
    ['kitchen', 'rocks'],
];
const rooms = {
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
const directions = ['north', 'east', 'south', 'west'];
const offsets = {
    north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0],
};
const keys = {
    ArrowUp: 'north', ArrowRight: 'east', ArrowDown: 'south', ArrowLeft: 'west',
};
let position = { x: 1, y: 1 };
function element(selector) {
    const found = document.querySelector(selector);
    if (!found)
        throw new Error(`Missing game element: ${selector}`);
    return found;
}
const roomName = element('#room-name');
const description = element('#description');
const exits = element('#exits');
const message = element('#message');
const scene = element('#scene');
const roomImage = element('#room-image');
const mood = element('#mood');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let fade;
let outgoingFade;
let ghost;
// Preload the four local illustrations so movement does not wait on the network.
Object.keys(rooms).forEach(id => { const image = new Image(); image.src = `images/${id}.png`; });
const buttons = document.querySelectorAll('[data-direction]');
const cells = document.querySelectorAll('[data-room]');
function destination(direction) {
    const [dx, dy] = offsets[direction];
    return grid[position.y + dy]?.[position.x + dx];
}
function render() {
    const id = grid[position.y][position.x];
    const room = rooms[id];
    scene.dataset.scene = id;
    roomImage.src = `images/${id}.png`;
    roomImage.alt = room.imageAlt;
    mood.textContent = room.mood;
    roomName.textContent = room.name;
    description.textContent = room.description;
    exits.textContent = directions.filter(direction => destination(direction))
        .map(direction => direction[0].toUpperCase() + direction.slice(1)).join(' · ');
    buttons.forEach(button => {
        const direction = button.dataset.direction;
        const target = destination(direction);
        button.dataset.blocked = String(!target);
        button.setAttribute('aria-label', target
            ? `Go ${direction} to ${rooms[target].name}`
            : `Go ${direction} (blocked)`);
    });
    cells.forEach(cell => {
        const current = cell.dataset.room === id;
        if (current)
            cell.setAttribute('aria-current', 'location');
        else
            cell.removeAttribute('aria-current');
        cell.querySelector('.map-marker').textContent = current ? '● YOU ARE HERE' : '';
    });
}
function clearTransition() {
    fade?.cancel();
    outgoingFade?.cancel();
    ghost?.remove();
    fade = undefined;
    outgoingFade = undefined;
    ghost = undefined;
}
function transitionRoom() {
    clearTransition();
    if (reducedMotion.matches) {
        render();
        return;
    }
    // Keep the old room visible while the new one fades in. State updates remain
    // synchronous, so rapid arrow presses never drop a move or revive an old room.
    const outgoing = scene.cloneNode(true);
    outgoing.removeAttribute('id');
    outgoing.removeAttribute('aria-live');
    outgoing.removeAttribute('aria-atomic');
    outgoing.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    outgoing.classList.add('scene-ghost');
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.inert = true;
    scene.parentElement.append(outgoing);
    ghost = outgoing;
    render();
    const options = { duration: 320, easing: 'ease-in-out' };
    outgoingFade = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], options);
    fade = scene.animate([{ opacity: 0 }, { opacity: 1 }], options);
    outgoingFade.onfinish = () => {
        outgoing.remove();
        if (ghost === outgoing)
            ghost = undefined;
    };
}
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches)
    clearTransition(); });
function move(direction) {
    const target = destination(direction);
    if (!target) {
        const room = rooms[grid[position.y][position.x]];
        message.textContent = room.blocked[direction] ?? 'There is no path in that direction.';
        return;
    }
    const [dx, dy] = offsets[direction];
    position = { x: position.x + dx, y: position.y + dy };
    transitionRoom();
    message.textContent = `You go ${direction}.`;
}
document.addEventListener('keydown', event => {
    const direction = keys[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey)
        return;
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]'))
        return;
    event.preventDefault();
    if (!event.repeat)
        move(direction);
});
buttons.forEach(button => button.addEventListener('click', () => move(button.dataset.direction)));
render();
