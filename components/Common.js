"use client";

// Draggable cards
/**
{
  name: string,
  image: string,
  defeatedImage: string, // NEW
  color: string,
  stats: {
    HP: number, Attack: number, Speed: number,
  },
  currentHP: number, // NEW
  isBattling: boolean, // NEW
  isDefeated: boolean, // NEW
}

 */
export const pokemons = [
  {
    name: "Bulbasaur",
    color: "#00ff88",
    image: "/image/b.png",
    defeatedImage: "/image/b_defeated.png",
    stats: { HP: 60, Attack: 62, Speed: 45 },
    currentHP: 60,
    isBattling: false,
    isDefeated: false,
  },
  {
    name: "Charizard",
    color: "#ff5733",
    image: "/image/c.png",
    defeatedImage: "/image/c_defeated.png",
    stats: { HP: 78, Attack: 84, Speed: 100 },
    currentHP: 78,
    isBattling: false,
    isDefeated: false,
  },
  {
    name: "Squirtle",
    color: "#42a5f5",
    image: "/image/s.png",
    defeatedImage: "/image/s_defeated.png",
    stats: { HP: 44, Attack: 48, Speed: 43 },
    currentHP: 44,
    isBattling: false,
    isDefeated: false,
  },
  {
    name: "Pikachu",
    color: "#fdd835",
    image: "/image/p.png",
    defeatedImage: "/image/p_defeated.png",
    stats: { HP: 35, Attack: 55, Speed: 90 },
    currentHP: 35,
    isBattling: false,
    isDefeated: false,
  },
];

export function isOverlapping(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
