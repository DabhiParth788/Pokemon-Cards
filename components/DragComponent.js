"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { isOverlapping, pokemons } from "./Common";

// Style
const cardBackCSS = {
  position: "absolute",
  left: "50%",
  width: 100,
  height: 140,
  backgroundImage: `url("/image/Cardback.png")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: 2,
  boxShadow: 0,
  transition: "all 0.3s ease-in-out",
};
const playgroundCSS = {
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

const motionCardCSS = {
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
  cursor: "pointer",
  userSelect: "none",
};

const cardStackCSS = {
  position: "fixed",
  bottom: { xs: 10, sm: 20 },
  right: { xs: 10, sm: 20 },
  width: { xs: 80, sm: 100, md: 120 },
  height: { xs: 120, sm: 160, md: 180 },
  cursor: "pointer",
};

// styles above

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
        {/* Also i would like to add two sword image ->public/sword.png while is in fighting and show defated image based on which pokemon like i have image for normal and defeatedImage when its defeated */}
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
              width: "20%", // Responsive
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
        sx={{
          fontWeight: "bold",
          color: "#333",
        }}
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
  const [battlingPairs, setBattlingPairs] = useState([]);

  const theme = useTheme();
  const isXS = useMediaQuery(theme.breakpoints.down("sm"));

  const [stackOrder, setStackOrder] = useState([]);

  const cardRefs = useRef({});
  const [cardBounds, setCardBounds] = useState({});
  const updateCardBounds = useCallback(() => {
    const bounds = {};
    cards.forEach((card) => {
      const ref = cardRefs.current[card.name];
      if (ref) {
        bounds[card.name] = ref.getBoundingClientRect();
      }
    });
    setCardBounds(bounds);
  }, [cards]);

  const detectOverlaps = useCallback(() => {
    const overlappingPairs = [];

    const names = Object.keys(cardBounds);

    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const cardA = names[i];
        const cardB = names[j];

        const rectA = cardBounds[cardA];
        const rectB = cardBounds[cardB];

        if (rectA && rectB && isOverlapping(rectA, rectB)) {
          overlappingPairs.push([cardA, cardB]);
        }
      }
    }

    return overlappingPairs;
  }, [cardBounds]);

  // 🆕 Update bounds when cards change or on drag
  useEffect(() => {
    const overlapping = detectOverlaps();
    setBattlingPairs(overlapping);
  }, [cardBounds, detectOverlaps]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const updated = [...prevCards];

        battlingPairs.forEach(([a, b]) => {
          const cardA = updated.find((c) => c.name === a);
          const cardB = updated.find((c) => c.name === b);

          if (!cardA || !cardB || cardA.isDefeated || cardB.isDefeated) return;

          // Battle formula
          const damageToA = (cardB.stats.Attack + cardB.stats.Speed) * 0.1;
          const damageToB = (cardA.stats.Attack + cardA.stats.Speed) * 0.1;

          cardA.currentHP = Math.max(0, cardA.currentHP - damageToA);
          cardB.currentHP = Math.max(0, cardB.currentHP - damageToB);

          // Check for defeat
          if (cardA.currentHP === 0) cardA.isDefeated = true;
          if (cardB.currentHP === 0) cardB.isDefeated = true;

          cardA.isBattling = true;
          cardB.isBattling = true;
        });

        return updated;
      });
    }, 1000); // 1 second tick

    return () => clearInterval(interval);
  }, [battlingPairs]);

  const handleClick = (clickedName) => {
    setStackOrder((prevOrder) => {
      const filtered = prevOrder.filter((name) => name !== clickedName);
      return [...filtered, clickedName];
    });
  };

  useEffect(() => {
    const overlapping = detectOverlaps();
    if (overlapping.length > 0) {
      console.log("Overlapping pairs:", overlapping);
    }
  }, [cardBounds, detectOverlaps]);

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
