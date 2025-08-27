"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  cardBackCSS,
  cardStackCSS,
  isOverlapping,
  motionCardCSS,
  playgroundCSS,
  pokemons,
  /* 
  {
  name: string,
  image: string,
  defeatedImage: string, 
  color: string,
  stats: {
    HP: number, Attack: number, Speed: number,
  },
  currentHP: number, 
  isBattling: boolean,
  isDefeated: boolean, 
} 
*/
} from "./Common";

const PokemonCard = ({ children, sx, ...rest }) => {
  const {
    image,
    name,
    stats = {},
    currentHP,
    isBattling,
    isDefeated,
    defeatedImage,
  } = children;

  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredStats = isXS
    ? Object.entries(stats).filter(([label]) => label === "HP")
    : Object.entries(stats);

  return (
    <Box
      sx={{ ...motionCardCSS, opacity: isDefeated ? 0.5 : 1, ...sx }}
      {...rest}
    >
      <Box
        sx={{
          height: 140,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={isDefeated ? defeatedImage : image}
          alt={name}
          style={{ maxHeight: "100%", maxWidth: "100%" }}
          draggable={false}
        />

        {isBattling && !isDefeated && (
          <img
            src="/image/sword.png"
            alt="battle"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "20%",
              maxWidth: 32,
              height: "auto",
            }}
          />
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        {name}
      </Typography>

      <Box sx={{ mt: 1 }}>
        {filteredStats.map(([label, value]) => (
          <Box key={label} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {label.toUpperCase()}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={label === "HP" ? (currentHP / stats.HP) * 100 : value}
              sx={{
                height: 8,
                borderRadius: 5,
                backgroundColor: "#eee",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    label === "HP"
                      ? currentHP > 30
                        ? "#4caf50"
                        : "#f44336"
                      : "#4caf50",
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
const MotionCard = motion(PokemonCard);

// Stack: draw new unique Pokémon
const CardsStack = ({ setCards, cards }) => {
  const availablePokemons = pokemons.filter(
    (pokemon) => !cards.some((card) => card.name === pokemon.name)
  );

  const handleDraw = () => {
    if (availablePokemons.length === 0) return;
    const randomPokemon =
      availablePokemons[Math.floor(Math.random() * availablePokemons.length)];
    setCards((prevCards) => [
      ...prevCards,
      {
        ...randomPokemon,
        currentHP: randomPokemon.stats.HP,
        isBattling: false,
        isDefeated: false,
      },
    ]);
  };

  return (
    <Box sx={cardStackCSS} onClick={handleDraw}>
      {availablePokemons.slice(0, 5).map((_, index, arr) => {
        const offsetY = index * -10;
        const rotation = (index - arr.length / 2) * 5;
        return (
          <Box
            key={index}
            sx={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              bottom: offsetY,
              zIndex: index,
              ...cardBackCSS,
            }}
          />
        );
      })}
    </Box>
  );
};

export default function DragComponent() {
  const constraintsRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [battlingPairs, setBattlingPairs] = useState([]); // [["A","B"], ["C","D"]]
  const [stackOrder, setStackOrder] = useState([]);

  const cardRefs = useRef({});
  const [cardBounds, setCardBounds] = useState({});

  // --- Helpers ---
  const aliveNames = useMemo(
    () => cards.filter((c) => !c.isDefeated).map((c) => c.name),
    [cards]
  );

  const nameToCard = useCallback(
    (name) => cards.find((c) => c.name === name),
    [cards]
  );

  // Update bounds (alive only) on drag/resize/layout
  const updateCardBounds = useCallback(() => {
    const bounds = {};
    cards.forEach((card) => {
      if (!card?.isDefeated) {
        const ref = cardRefs.current[card.name];
        if (ref) bounds[card.name] = ref.getBoundingClientRect();
      }
    });
    setCardBounds(bounds);
  }, [cards]);

  // Build overlapping edges among ALIVE cards
  const detectOverlapsEdges = useCallback(() => {
    const edges = [];
    const names = Object.keys(cardBounds);

    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i];
        const b = names[j];
        const rectA = cardBounds[a];
        const rectB = cardBounds[b];
        if (!rectA || !rectB) continue;
        if (isOverlapping(rectA, rectB)) {
          const ca = nameToCard(a);
          const cb = nameToCard(b);
          // Ignore defeated just in case
          if (!ca?.isDefeated && !cb?.isDefeated) {
            edges.push([a, b]);
          }
        }
      }
    }
    return edges;
  }, [cardBounds, nameToCard]);

  // From overlap edges, choose disjoint 1v1 pairs (greedy)
  const choosePairs = useCallback(
    (edges) => {
      const used = new Set();
      const pairs = [];
      for (const [a, b] of edges) {
        if (used.has(a) || used.has(b)) continue; // already in a pair
        // both must be alive and not already paired
        if (aliveNames.includes(a) && aliveNames.includes(b)) {
          used.add(a);
          used.add(b);
          pairs.push([a, b]);
        }
      }
      return pairs;
    },
    [aliveNames]
  );

  // Recompute pairs whenever bounds change (dragging), or cards change (defeats)
  useEffect(() => {
    const edges = detectOverlapsEdges();
    const pairs = choosePairs(edges);
    setBattlingPairs((prev) => {
      // If set actually changed, update isBattling flags in cards
      const prevKey = prev
        .map((p) => p.slice().sort().join("|"))
        .sort()
        .join(",");
      const nextKey = pairs
        .map((p) => p.slice().sort().join("|"))
        .sort()
        .join(",");
      if (prevKey === nextKey) return prev;
      // Set isBattling true for pair members, false for others (alive)
      const namesInPairs = new Set(pairs.flat());
      setCards((prevCards) =>
        prevCards.map((c) =>
          c.isDefeated ? c : { ...c, isBattling: namesInPairs.has(c.name) }
        )
      );
      return pairs;
    });
  }, [detectOverlapsEdges, choosePairs]);

  // Apply damage every 500ms ONLY to current pairs
  useEffect(() => {
    const interval = setInterval(() => {
      if (battlingPairs.length === 0) return;

      setCards((prevCards) => {
        // Build a quick index
        const byName = new Map(prevCards.map((c) => [c.name, c]));
        let changed = false;

        // Compute next state immutably
        const next = prevCards.map((c) => ({ ...c }));

        const applyDamage = (name, dmg) => {
          const idx = next.findIndex((x) => x.name === name);
          if (idx === -1) return;
          const card = next[idx];
          if (card.isDefeated) return;
          const newHP = Math.max(0, card.currentHP - dmg);
          if (newHP !== card.currentHP) {
            card.currentHP = newHP;
            changed = true;
          }
          if (newHP === 0 && !card.isDefeated) {
            card.isDefeated = true;
            card.isBattling = false; // defeated can't be battling
            changed = true;
          }
        };

        for (const [a, b] of battlingPairs) {
          const ca = byName.get(a);
          const cb = byName.get(b);
          if (!ca || !cb) continue;
          if (ca.isDefeated || cb.isDefeated) continue;

          const damageToA = (cb.stats.Attack + cb.stats.Speed) * 0.1;
          const damageToB = (ca.stats.Attack + ca.stats.Speed) * 0.1;

          applyDamage(a, damageToA);
          applyDamage(b, damageToB);
        }

        return changed ? next : prevCards;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [battlingPairs]);

  // If a card becomes defeated, ensure it’s removed from pairs on next bounds recompute
  // Also: defeated cards shouldn't be interactive (already in your sx)
  useEffect(() => {
    // When defeat happens, pairs will be recomputed naturally on next drag or interval tick,
    // but also trigger a bounds recalculation to speed it up.
    updateCardBounds();
  }, [cards, updateCardBounds]);

  // z-index click handling
  const handleClick = (clickedName) => {
    setStackOrder((prevOrder) => {
      const filtered = prevOrder.filter((name) => name !== clickedName);
      return [...filtered, clickedName];
    });
  };

  // Keep bounds fresh on mount and on window resize
  useEffect(() => {
    updateCardBounds();
    const onResize = () => updateCardBounds();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateCardBounds]);

  return (
    <Box ref={constraintsRef} sx={playgroundCSS}>
      {cards.map((p) => {
        const zIndex = stackOrder.indexOf(p.name) + 1;
        return (
          <MotionCard
            key={p.name}
            drag={!p.isDefeated}
            ref={(el) => (cardRefs.current[p.name] = el)}
            onDrag={updateCardBounds}
            onDragEnd={updateCardBounds}
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
              zIndex: p.isDefeated ? 0 : zIndex,
              pointerEvents: p.isDefeated ? "none" : "auto",
              filter: p.isDefeated ? "grayscale(100%)" : "none",
            }}
            onClick={() => handleClick(p.name)}
          >
            {p}
          </MotionCard>
        );
      })}

      <CardsStack setCards={setCards} cards={cards} />
    </Box>
  );
}
