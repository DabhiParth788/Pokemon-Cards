"use client";

import React, { Fragment, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  LinearProgress,
  Button,
  Divider,
} from "@mui/material";
import CommonModal from "./CommonModel";
import { battlefieldCSS, pokemonCenterCSS } from "./Common"; // you already defined those

const PokemonCenter = ({
  centerRef,
  centerCards = [],
  healedCards = [],
  setCards,
  setCenterCards,
  setHealedCards,
}) => {
  const [openModel, setOpenModel] = useState(false);

  const handleShowAllCard = () => setOpenModel(true);

  const healingContent = (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {centerCards.length === 0 ? (
        <Grid item xs={12}>
          <Box sx={{ p: 2, textAlign: "center", color: "#666" }}>
            No Pokémon healing right now.
          </Box>
        </Grid>
      ) : (
        centerCards.map((p) => {
          const maxHP = p.stats?.HP ?? 100;
          const cur = p.currentHP ?? 0;
          const percent = Math.round((cur / maxHP) * 100);
          return (
            <Grid item xs={12} sm={6} md={4} key={p.name}>
              <Card
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <CardMedia
                  component="img"
                  image={p.image}
                  alt={p.name}
                  sx={{ height: 120, objectFit: "contain" }}
                />
                <CardContent sx={{ textAlign: "center", p: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {p.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Healing — {cur}/{maxHP} HP
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{ mt: 1, height: 8, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })
      )}
    </Grid>
  );

  const healedContent = (
    <Grid container spacing={2}>
      {healedCards.length === 0 ? (
        <Grid item xs={12}>
          <Box sx={{ p: 2, textAlign: "center", color: "#666" }}>
            No healed Pokémon yet.
          </Box>
        </Grid>
      ) : (
        healedCards.map((p) => (
          <Grid item xs={6} sm={4} md={3} key={p.name}>
            <Card
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CardMedia
                component="img"
                image={p.image}
                alt={p.name}
                sx={{ height: 120, objectFit: "contain" }}
              />
              <CardContent sx={{ textAlign: "center", p: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {p.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{ mt: 1, height: 8, borderRadius: 5 }}
                />
                <Button
                  sx={{ mt: 1 }}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // send to battlefield (creates a card instance)
                    setCards((prev) => [
                      ...prev,
                      {
                        ...p,
                        currentHP: p.stats.HP,
                        isDefeated: false,
                        isBattling: false,
                        isHealing: false,
                      },
                    ]);
                    // remove from healedCards
                    setHealedCards((prev) =>
                      prev.filter((x) => x.name !== p.name)
                    );
                    setOpenModel(false);
                  }}
                >
                  Send to Field
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  const content = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Healing (Pokémon Center)
      </Typography>
      {healingContent}
      {/* <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Healed (Ready)
      </Typography>
      {healedContent} */}
    </Box>
  );

  // Also add animation when valid card enter this box
  const pokemonCenterCSS = {
    position: "fixed",
    bottom: { xs: 10, sm: 20 },
    left: { xs: 10, sm: 20 },
    width: { xs: 120, sm: 160, md: 200 },
    height: { xs: 120, sm: 160, md: 180 },
    cursor: "pointer",
    backgroundImage: `url("/image/pokemon_center.png")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 1000,
    border: "1px solid #ccc",
    transition: "transform 0.3s ease-in-out", // apply transition globally
    "&:hover": {
      transform: "scale(1.1)",
    },
    "&:active": {
      transform: "scale(0.95)", // click/press animation
    },
  };

  return (
    <Fragment>
      <Box
        sx={{ ...pokemonCenterCSS }}
        onClick={handleShowAllCard}
        ref={centerRef}
      ></Box>

      <CommonModal
        handleClose={() => setOpenModel(false)}
        open={openModel}
        title={"Pokémon Center"}
        content={content}
        size="lg"
        titlePosition="left"
        manageNewUi={true}
        maxWidth={"100vw"}
        newBodyCss={{ padding: "0 !important" }}
        sx={{ height: "100vh", border: "1px solid red" }}
      />
    </Fragment>
  );
};

export default PokemonCenter;
