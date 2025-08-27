"use client";

import React from "react";
import {
  Box,
  Divider,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { motionCardCSS } from "./Common";

const PokemonCard = ({ children, sx = {}, ...rest }) => {
  const {
    name,
    image,
    defeatedImage,
    stats = {},
    currentHP = 0,
    isBattling = false,
    isDefeated = false,
    element,
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
          height: { sm: 100, xs: 80 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={isDefeated ? defeatedImage || image : image}
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
      <Box
        sx={{
          p: 1,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          {name}
        </Typography>

        <Box
          component="img"
          src={`image/${element}.png`}
          alt={name}
          draggable={false}
          sx={{
            height: { xs: 20, sm: 25, md: 30 },
            width: { xs: 20, sm: 25, md: 30 },
            objectFit: "contain",
          }}
        />
      </Box>

      <Box sx={{ mt: 1 }}>
        {filteredStats.map(([label, value]) => (
          <Box key={label} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {label.toUpperCase()}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                label === "HP"
                  ? ((currentHP ?? 0) / (stats.HP ?? 1)) * 100
                  : value
              }
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

export default motion(PokemonCard);
