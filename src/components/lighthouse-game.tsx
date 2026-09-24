"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, type Ref } from "react";
import { availableDestination, gameReducer, initialState } from "@/lib/game";
import { directions, grid, keys, rooms, type Direction, type RoomId } from "@/lib/rooms";

const motionQuery = "(prefers-reduced-motion: reduce)";
const buttonOrder: Direction[] = ["north", "west", "south", "east"];
const arrows: Record<Direction, string> = { north: "↑", west: "←", south: "↓", east: "→" };

function RoomScene({ roomId, hasVisitedKitchen, ghost = false, sceneRef }: {
  roomId: RoomId;
  hasVisitedKitchen: boolean;
  ghost?: boolean;
  sceneRef: Ref<HTMLDivElement>;
}) {
  const room = rooms[roomId];
  const exits = directions.filter(direction => availableDestination({ roomId, hasVisitedKitchen }, direction))
    .map(direction => direction[0].toUpperCase() + direction.slice(1)).join(" · ");

  return (
    <div ref={sceneRef} id={ghost ? undefined : "scene"} className={ghost ? "scene-ghost" : undefined}
      data-scene={roomId} aria-live={ghost ? undefined : "polite"} aria-atomic={ghost ? undefined : true}
      aria-hidden={ghost || undefined} inert={ghost || undefined}>
      <span className="eyebrow">You are here</span>
      <div className="room-heading">
        <h2 id={ghost ? undefined : "room-name"}>{room.name}</h2>
        <p id={ghost ? undefined : "mood"} className="eyebrow mood">{room.mood}</p>
      </div>
      <figure className="room-art">
        <Image id={ghost ? undefined : "room-image"} src={`/images/${roomId}.png`} width={1536} height={1024}
          alt={room.imageAlt} unoptimized loading="eager" />
      </figure>
      <p id={ghost ? undefined : "description"} className="description">{room.description}</p>
      <div className="exits meta">You can go <span id={ghost ? undefined : "exits"} className="exit-list">{exits}</span></div>
    </div>
  );
}

export default function LighthouseGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const sceneRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: "move", direction, animate: !window.matchMedia(motionQuery).matches });
  }, []);

  useEffect(() => {
    Object.keys(rooms).forEach(id => { const image = new window.Image(); image.src = `/images/${id}.png`; });
    const media = window.matchMedia(motionQuery);
    const handleMotion = () => { if (media.matches) dispatch({ type: "reduce-motion" }); };
    const handleKey = (event: KeyboardEvent) => {
      const direction = keys[event.key];
      if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      if (!event.repeat) move(direction);
    };
    document.addEventListener("keydown", handleKey);
    media.addEventListener("change", handleMotion);
    return () => {
      document.removeEventListener("keydown", handleKey);
      media.removeEventListener("change", handleMotion);
    };
  }, [move]);

  useLayoutEffect(() => {
    if (!state.previousRoom || !sceneRef.current || !ghostRef.current) return;
    const options: KeyframeAnimationOptions = { duration: 320, easing: "ease-in-out" };
    const outgoing = ghostRef.current.animate([{ opacity: 1 }, { opacity: 0 }], options);
    const incoming = sceneRef.current.animate([{ opacity: 0 }, { opacity: 1 }], options);
    outgoing.onfinish = () => dispatch({ type: "finish-fade", transitionId: state.transitionId });
    return () => { outgoing.onfinish = null; outgoing.cancel(); incoming.cancel(); };
  }, [state.previousRoom, state.transitionId]);

  return (
    <div className="shell">
      <header>
        <span className="beacon" aria-hidden="true" />
        <span className="label">Field notes / The lighthouse</span>
        <span className="label edition">A small adventure · No. 01</span>
      </header>
      <div className="intro">
        <span className="eyebrow">Four rooms. One light in the dark.</span>
        <h1>The Last Light</h1>
        <p>A quiet place at the edge of the sea. Find your way around.</p>
      </div>
      <main>
        <section className="room" aria-label="Your surroundings">
          <div className="scene-stage">
            <RoomScene roomId={state.roomId} hasVisitedKitchen={state.hasVisitedKitchen} sceneRef={sceneRef} />
            {state.previousRoom && <RoomScene roomId={state.previousRoom} hasVisitedKitchen={state.hasVisitedKitchen} ghost sceneRef={ghostRef} />}
          </div>
          <div className="navigation">
            <div className="compass" role="group" aria-label="Move around the lighthouse">
              {buttonOrder.map(direction => {
                const target = availableDestination(state, direction);
                return <button key={direction} type="button" data-direction={direction} data-blocked={String(!target)}
                  aria-label={target ? `Go ${direction} to ${rooms[target].name}` : `Go ${direction} (blocked)`}
                  onClick={() => move(direction)}>{arrows[direction]}</button>;
              })}
            </div>
            <p className="meta">Use the arrow keys<br />or tap a direction.</p>
          </div>
          <p id="message" role="status" aria-live="polite" aria-atomic="true">{state.message}</p>
          <noscript>This adventure needs JavaScript enabled to move between rooms.</noscript>
        </section>
        <aside className="chart" aria-label="Lighthouse map: two rows and two columns">
          <div className="chart-heading"><span className="label">The lay of the land</span><span className="north" aria-label="North is up">↑ N</span></div>
          <div className="map">
            {grid.flat().map((id, index) => (
              <div key={id} className="map-cell" data-room={id} aria-current={state.roomId === id ? "location" : undefined}>
                <span className="map-number">0{index + 1}</span>
                <span className="map-name">{rooms[id].name}</span>
                <span className="map-marker">{state.roomId === id ? "● YOU ARE HERE" : ""}</span>
              </div>
            ))}
          </div>
          <p className="chart-note meta"><span className="dot" aria-hidden="true" />Your current location</p>
        </aside>
      </main>
      <footer><span>A small prototype · Next.js</span><span>A reference for the proper app</span></footer>
    </div>
  );
}
