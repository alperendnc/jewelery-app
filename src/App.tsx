import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import Navbar from "./components/Navbar";
import MainPage from "./App/MainPage/page";
import SellingPage from "./App/SellingPage/page";
import StockPage from "./App/StockPage/page";
import CurrencyPage from "./App/CurrencyPage/page";
import CustomerPage from "./App/CustomerPage/page";
import TrackingPage from "./App/TrackingPage/page";
import ReportingPage from "./App/ReportingPage/page";
import LoginPage from "./components/modals/SignUpModal/index";
import SignUpPage from "./components/modals/LoginModal/Sign/index";

import { CssBaseline, Box } from "@mui/material";

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
            background: "linear-gradient(135deg, #fffbe6 0%, #f0e6ff 100%)",
          }}
        >
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/SignUp" element={<SignUpPage />} />
              <Route path="/" element={<MainPage />} />
              <Route path="/satis" element={<SellingPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/currency" element={<CurrencyPage />} />
              <Route path="/report" element={<ReportingPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </SnackbarProvider>
  </MuiThemeProvider>
);

export default App;
