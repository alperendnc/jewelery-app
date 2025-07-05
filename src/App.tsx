import React from "react";
import { AppBar, Toolbar, Typography, CssBaseline, Box } from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";

import MainPage from "./App/MainPage/page";
import SellingPage from "./App/SellingPage/page";
import StockPage from "./App/StockPage/page";
import CustomerPage from "./App/CustomerPage/page";
import TrackingPage from "./App/TrackingPage/page";
import ReportingPage from "./App/ReportingPage/page";

function AppBarHeader() {
  const navigate = useNavigate();
  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #FFD700 0%, #fff 100%)",
        boxShadow: 3,
      }}
    >
      <Toolbar>
        <DiamondIcon sx={{ mr: 2, color: "#bfa100" }} />
        <Typography
          variant="h5"
          sx={{ color: "#333", fontWeight: 700, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Kafkas Kuyumcu
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

const theme = createTheme();

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Router>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <AppBarHeader />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/satis" element={<SellingPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/report" element={<ReportingPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </SnackbarProvider>
  </MuiThemeProvider>
);

export default App;
