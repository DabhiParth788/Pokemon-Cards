"use client";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import DragComponent from "../components/DragComponent";

const theme = createTheme();

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DragComponent />
    </ThemeProvider>
  );
}
