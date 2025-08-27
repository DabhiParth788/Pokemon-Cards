"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import {
  cardBackCSS,
  cardStackCSS,
  isOverlapping,
  playgroundCSS,
  pokemons,
} from "./Common";
import PokemonCenter from "./PokemonCenter";
import PokemonCard from "./PokemonCard";

const MotionCard = motion(PokemonCard);

// CardsStack: draws from pokemons that are not in battlefield, not healing, not healed
const CardsStack = ({
  setCards,
  battlefieldCards,
  centerCards,
  healedCards,
  setHealedCards,
}) => {
  // this will show all cards except which are in battlefield
  const available = pokemons.filter(
    (p) =>
      !battlefieldCards.some((c) => c.name === p.name) &&
      !centerCards.some((c) => c.name === p.name)
    // &&!healedCards.some((c) => c.name === p.name)
  );

  const handleDraw = () => {
    if (available.length === 0) return;
    const randomPokemon =
      available[Math.floor(Math.random() * available.length)];

    setCards((prev) => [
      ...prev,
      {
        ...randomPokemon,
        currentHP: randomPokemon.stats.HP,
        isBattling: false,
        isDefeated: false,
        isHealing: false,
      },
    ]);
  };

  return (
    <Box sx={cardStackCSS} onClick={handleDraw}>
      {available.slice(0, 5).map((_, i, arr) => {
        const offsetY = i * -10;
        const rotation = (i - arr.length / 2) * 5;
        return (
          <Box
            key={i}
            sx={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              bottom: offsetY,
              zIndex: i,
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
  const centerRef = useRef(null);

  // Pools
  const [cards, setCards] = useState([]); // battlefield cards
  const [centerCards, setCenterCards] = useState([]); // healing
  const [healedCards, setHealedCards] = useState([]); // healed bench

  const [stackOrder, setStackOrder] = useState([]);
  const [battlingPairs, setBattlingPairs] = useState([]);

  const cardRefs = useRef({});
  const [cardBounds, setCardBounds] = useState({});

  // update bounds (alive on battlefield only)
  const updateCardBounds = useCallback(() => {
    const bounds = {};
    cards.forEach((card) => {
      if (!card?.isDefeated) {
        const el = cardRefs.current[card.name];
        if (el?.getBoundingClientRect)
          bounds[card.name] = el.getBoundingClientRect();
      }
    });
    setCardBounds(bounds);
  }, [cards]);

  // overlap detection among battlefield alive cards
  const detectOverlapsEdges = useCallback(() => {
    const names = Object.keys(cardBounds);
    const edges = [];
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i],
          b = names[j];
        const rectA = cardBounds[a],
          rectB = cardBounds[b];
        if (!rectA || !rectB) continue;
        if (isOverlapping(rectA, rectB)) {
          const ca = cards.find((c) => c.name === a);
          const cb = cards.find((c) => c.name === b);
          if (ca && cb && !ca.isDefeated && !cb.isDefeated) edges.push([a, b]);
        }
      }
    }
    return edges;
  }, [cardBounds, cards]);

  // choose disjoint pairs (greedy)
  const choosePairs = useCallback((edges) => {
    const used = new Set();
    const pairs = [];
    for (const [a, b] of edges) {
      if (used.has(a) || used.has(b)) continue;
      used.add(a);
      used.add(b);
      pairs.push([a, b]);
    }
    return pairs;
  }, []);

  // Recompute pairs & update isBattling flags — only when something changed
  useEffect(() => {
    const edges = detectOverlapsEdges();
    const pairs = choosePairs(edges);

    // update battlingPairs only if changed (by key)
    setBattlingPairs((prev) => {
      const prevKey = prev
        .map((p) => p.slice().sort().join("|"))
        .sort()
        .join(",");
      const nextKey = pairs
        .map((p) => p.slice().sort().join("|"))
        .sort()
        .join(",");
      return prevKey === nextKey ? prev : pairs;
    });

    // update isBattling flags only if needed
    setCards((prev) => {
      let changed = false;
      const namesInPairs = new Set(pairs.flat());
      const next = prev.map((c) => {
        if (c.isDefeated) return c;
        const should = namesInPairs.has(c.name);
        if (c.isBattling === should) return c;
        changed = true;
        return { ...c, isBattling: should };
      });
      return changed ? next : prev;
    });
  }, [detectOverlapsEdges, choosePairs]);

  // battle damage loop (500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (battlingPairs.length === 0) return;
      setCards((prev) => {
        const byName = new Map(prev.map((c) => [c.name, c]));
        const next = prev.map((c) => ({ ...c }));
        let changed = false;

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
            card.isBattling = false;
            changed = true;
          }
        };

        for (const [a, b] of battlingPairs) {
          const ca = byName.get(a),
            cb = byName.get(b);
          if (!ca || !cb) continue;
          if (ca.isDefeated || cb.isDefeated) continue;
          const dmgToA = (cb.stats.Attack + cb.stats.Speed) * 0.1;
          const dmgToB = (ca.stats.Attack + ca.stats.Speed) * 0.1;
          applyDamage(a, dmgToA);
          applyDamage(b, dmgToB);
        }

        return changed ? next : prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [battlingPairs]);

  // handle drag end -> check drop to centerRef
  const handleCardDrop = useCallback(
    (name) => {
      const el = cardRefs.current[name];
      const centerEl = centerRef.current;
      if (!el || !centerEl) return;

      const rectCard = el.getBoundingClientRect();
      const rectCenter = centerEl.getBoundingClientRect();
      const dragged = cards.find((c) => c.name === name);
      if (!dragged) return;

      const maxHP = dragged.stats.HP;
      if ((dragged.currentHP ?? 0) >= maxHP) return; // full HP skip

      if (isOverlapping(rectCard, rectCenter)) {
        // remove from battlefield and add to center
        setCards((prev) => prev.filter((c) => c.name !== name));
        setCenterCards((prev) => {
          if (prev.some((c) => c.name === name)) return prev;
          return [...prev, { ...dragged, isHealing: true }];
        });
      }
    },
    [cards]
  );

  // healing loop for center cards (1s)
  useEffect(() => {
    if (centerCards.length === 0) return;
    const interval = setInterval(() => {
      setCenterCards((prev) => {
        let changed = false;
        const next = prev.map((c) => {
          const maxHP = c.stats.HP;
          const heal = Math.max(1, Math.floor(maxHP * 0.05));
          const nextHP = Math.min(maxHP, (c.currentHP ?? 0) + heal);
          if (nextHP !== c.currentHP) {
            changed = true;
            return { ...c, currentHP: nextHP };
          }
          return c;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [centerCards.length]);

  // when fully healed: move from center -> healedCards (bench)
  useEffect(() => {
    const fully = centerCards.filter((c) => (c.currentHP ?? 0) >= c.stats.HP);
    if (fully.length === 0) return;
    setCenterCards((prev) =>
      prev.filter((c) => (c.currentHP ?? 0) < c.stats.HP)
    );
    // To put the pokemon to healed stage

    // setHealedCards((prev) => {
    //   const names = new Set(prev.map((p) => p.name));
    //   const toAdd = fully
    //     .filter((p) => !names.has(p.name))
    //     .map((p) => ({ ...p, isHealing: false, isDefeated: false }));
    //   return [...prev, ...toAdd];
    // });
  }, [centerCards]);

  // z-index click
  const handleClick = (name) =>
    setStackOrder((prev) => {
      const filtered = prev.filter((n) => n !== name);
      return [...filtered, name];
    });

  // keep bounds updated
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
            drag
            ref={(el) => (cardRefs.current[p.name] = el)}
            onDrag={() => updateCardBounds()}
            onDragEnd={() => {
              updateCardBounds();
              handleCardDrop(p.name);
            }}
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            sx={{
              zIndex: p.isDefeated ? 0 : zIndex,
              filter: p.isDefeated ? "grayscale(100%)" : "none",
            }}
            onClick={() => handleClick(p.name)}
          >
            {p}
          </MotionCard>
        );
      })}

      <CardsStack
        setCards={setCards}
        battlefieldCards={cards}
        centerCards={centerCards}
        healedCards={healedCards}
        setHealedCards={setHealedCards}
      />

      <PokemonCenter
        centerRef={centerRef}
        centerCards={centerCards}
        healedCards={healedCards}
        setCenterCards={setCenterCards}
        setHealedCards={setHealedCards}
        setCards={setCards}
      />
    </Box>
  );
}
