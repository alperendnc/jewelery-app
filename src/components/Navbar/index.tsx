import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import { useNavigate } from "react-router-dom";
import { useAuth } from "src/contexts/UseAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #FFD700 0%, #fff 100%)",
        boxShadow: 3,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DiamondIcon sx={{ mr: 2, color: "#bfa100" }} />
          <Typography
            variant="h5"
            sx={{ color: "#333", fontWeight: 700, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Kafkas Kuyumcu
          </Typography>
        </Box>

        <Box>
          {currentUser ? (
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                borderColor: "#bfa100",
                color: "#bfa100",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#bfa100",
                  color: "#fff",
                  borderColor: "#bfa100",
                },
              }}
            >
              Çıkış Yap
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  mr: 1,
                  backgroundColor: "#bfa100",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#a78f00" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Giriş Yap
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#bfa100",
                  color: "#bfa100",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "#bfa100",
                    color: "#fff",
                    borderColor: "#bfa100",
                  },
                }}
              >
                Üye Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
