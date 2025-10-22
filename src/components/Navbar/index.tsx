import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "src/contexts/UseAuth";

const navItems = [
  { label: "Ana Sayfa", path: "/", icon: <HomeIcon /> },
  { label: "Stok", path: "/stock", icon: <InventoryIcon /> },
  { label: "Satış", path: "/satis", icon: <MonetizationOnIcon /> },
  { label: "Müşteriler", path: "/customer", icon: <PeopleIcon /> },
  { label: "Kasa", path: "/track", icon: <MonetizationOnIcon /> },
];

type NavBarProps = {
  title?: string;
};

const NavBar: React.FC<NavBarProps> = ({ title = "Yönetim Paneli" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const { currentUser, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    localStorage.getItem("app_theme_mode");
  }, []);

  const handleDrawerToggle = () => setMobileOpen((v) => !v);

  const handleOpenUserMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const drawer = (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setMobileOpen(false)}
    >
      <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {currentUser?.email?.charAt(0).toUpperCase() ?? "U"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser?.email ?? "Misafir"}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate("/report")}
        >
          Raporlar
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={3}>
        <Toolbar>
          {isSm && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            <Avatar sx={{ bgcolor: "primary.main", mr: 1 }}>⌾</Avatar>
            <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Hesap">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar>
                  {currentUser?.email?.charAt(0).toUpperCase() ?? "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem disabled>{currentUser?.email ?? "Misafir"}</MenuItem>

        <Divider />
        <MenuItem
          onClick={() => {
            handleCloseUserMenu();
            handleLogout();
          }}
        >
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
};

export default NavBar;
