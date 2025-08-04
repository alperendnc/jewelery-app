import React from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "Stok ve Ürün Yönetimi",
    icon: <DiamondIcon color="primary" sx={{ fontSize: 40 }} />,
    items: ["Ürün Ekle", "Ürün Güncelle", "Ürün Sil"],
    button: { text: "Ürün Ekle", color: "primary" },
    onClick: "/stock",
  },
  {
    title: "Satış ve Fatura Takibi",
    icon: <ReceiptIcon color="secondary" sx={{ fontSize: 40 }} />,
    items: ["Satış Yap", "Alış Yap", "Müşteri Oluştur"],
    button: { text: "Satış Yap", color: "secondary" },
    onClick: "/satis",
  },
  {
    title: "Müşteri Yönetimi",
    icon: <PeopleIcon color="success" sx={{ fontSize: 40 }} />,
    items: ["Müşteri Güncelle", "Müşteri Sil"],
    button: { text: "Müşteri Ekle", color: "success" },
    onClick: "/customer",
  },
  {
    title: "Kasa ve Finans Takibi",
    icon: <MonetizationOnIcon color="warning" sx={{ fontSize: 40 }} />,
    items: ["Kasa Hareketleri", "Tedarikçi Hareketleri", "Döviz Hareketleri"],
    button: { text: "Kasa İşlemleri", color: "warning" },
    onClick: "/track",
  },
  {
    title: "Döviz İşlemleri",
    icon: <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} />,
    items: ["Döviz Alış", "Döviz Satış"],
    button: { text: "Döviz İşlemleri", color: "success" },
    onClick: "/currency",
  },
  {
    title: "Raporlama",
    icon: <AssessmentIcon color="info" sx={{ fontSize: 40 }} />,
    items: ["Stok Raporları", "Satış Raporları ", "Alış Raporları"],
    button: { text: "Raporlar", color: "info" },
    onClick: "/report",
  },
];

const MainPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, sm: 4, md: 6 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 0, sm: 2 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
            justifyContent: "center",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {sections.map((section) => (
            <Paper
              key={section.title}
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                flex: "1 1 240px",
                minWidth: "260px",
                height: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fff",
                justifyContent: "flex-start",
                flexShrink: 0,
              }}
            >
              {section.icon}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: 18, sm: 20, md: 22 },
                  textAlign: "center",
                }}
              >
                {section.title}
              </Typography>
              <List sx={{ width: "100%", flexGrow: 0 }}>
                {section.items.map((item) => (
                  <ListItem key={item} disablePadding>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        fontSize: { xs: 14, sm: 15, md: 16 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  width: "90%",
                  fontSize: { xs: 13, sm: 15 },
                  mt: 2,
                  alignSelf: "center",
                }}
                onClick={
                  section.onClick ? () => navigate(section.onClick) : undefined
                }
              >
                {section.button.text}
              </Button>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;
