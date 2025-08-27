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
    stats: { HP: 100, Attack: 100, Speed: 100 },
    currentHP: 100,
    isBattling: false,
    isDefeated: false,
    element: ["grass"],
  },
  {
    name: "Charizard",
    color: "#ff5733",
    image: "/image/c.png",
    defeatedImage: "/image/c_defeated.png",
    stats: { HP: 100, Attack: 100, Speed: 100 },
    currentHP: 100,
    isBattling: false,
    isDefeated: false,
    element: ["fire"],
  },
  {
    name: "Squirtle",
    color: "#42a5f5",
    image: "/image/s.png",
    defeatedImage: "/image/s_defeated.png",
    stats: { HP: 100, Attack: 100, Speed: 100 },
    currentHP: 100,
    isBattling: false,
    isDefeated: false,
    element: ["water"],
  },
  {
    name: "Pikachu",
    color: "#fdd835",
    image: "/image/p.png",
    defeatedImage: "/image/p_defeated.png",
    stats: { HP: 100, Attack: 100, Speed: 100 },
    currentHP: 100,
    isBattling: false,
    isDefeated: false,
    element: ["electric"],
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

export const cardBackCSS = {
  position: "absolute",
  left: "50%",
  width: { xs: 120, sm: 160, md: 200 },
  height: { xs: 120, sm: 160, md: 180 },
  backgroundImage: `url("/image/Cardback.png")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: 2,
  boxShadow: 0,
  transition: "all 0.3s ease-in-out",
};
export const playgroundCSS = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#f4f4f4",
  p: { xs: 2, sm: 3, md: 4 },
  display: "flex",
  flexWrap: "wrap",
  gap: { xs: 2, sm: 3, md: 4 },
  alignItems: "center",
  justifyContent: "center",
  position: "relative", // Changed from border debugging
};

export const motionCardCSS = {
  p: 2,
  boxShadow: 6,
  background: "linear-gradient(135deg, #fefefe, #e0f7f1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: {
    xs: 180, // <600px
    sm: 220, // 600px–960px
    md: 250, // >960px
  },
  height: {
    xs: 260,
    sm: 320,
    md: 350,
  },
  borderRadius: 4,
  position: "relative",
  userSelect: "none",
};

export const cardStackCSS = {
  position: "fixed",
  bottom: { xs: 50, sm: 50 },
  right: { xs: 20, sm: 30 },
  width: { xs: 80, sm: 100, md: 120 },
  height: { xs: 120, sm: 160, md: 180 },
};

export const pokemonCenterCSS = {
  position: "fixed",
  bottom: { xs: 10, sm: 20 },
  left: { xs: 10, sm: 20 },
  width: { xs: 120, sm: 160, md: 200 },
  height: { xs: 120, sm: 160, md: 180 },
  cursor: "pointer",
  backgroundImage: `url("/image/pokemon_center.png")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export const elementChart = {
  water: {
    strong: ["fire"],
    weak: ["grass", "electric"],
  },
  fire: {
    strong: ["grass"],
    weak: ["water", "electric"],
  },
  grass: {
    strong: ["water", "electric"],
    weak: ["fire"],
  },
  electric: {
    strong: ["water", "flying"],
    weak: ["grass", "ground"],
  },
};
