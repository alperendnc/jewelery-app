import React from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Box,
  Avatar,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "Stok ve Ürün Yönetimi",
    icon: <DiamondIcon />,
    items: ["Ürün Ekle", "Ürün Güncelle", "Ürün Sil"],
    button: { text: "Ürün Ekle", color: "primary" },
    onClick: "/stock",
    description: "Ürünleri ve stokları kolayca yönetin.",
  },
  {
    title: "Satış ve Fatura Takibi",
    icon: <ReceiptIcon />,
    items: ["Satış Yap", "Alış Yap", "Müşteri Oluştur"],
    button: { text: "Satış Yap", color: "secondary" },
    onClick: "/satis",
    description: "Satışları, faturaları ve müşteri işlemlerini takip edin.",
  },
  {
    title: "Müşteri Yönetimi",
    icon: <PeopleIcon />,
    items: ["Müşteri Güncelle", "Müşteri Sil"],
    button: { text: "Müşteri Ekle", color: "success" },
    onClick: "/customer",
    description: "Müşteri bilgilerini ekleyin ve düzenleyin.",
  },
  {
    title: "Kasa ve Finans Takibi",
    icon: <MonetizationOnIcon />,
    items: ["Kasa Hareketleri", "Tedarikçi Hareketleri", "Döviz Hareketleri"],
    button: { text: "Kasa İşlemleri", color: "warning" },
    onClick: "/track",
    description: "Nakit akışı, günlük kapanışlar ve finansal özetler.",
  },
  {
    title: "Döviz İşlemleri",
    icon: <MonetizationOnIcon />,
    items: ["Döviz Alış", "Döviz Satış"],
    button: { text: "Döviz İşlemleri", color: "success" },
    onClick: "/currency",
    description: "Döviz alım/satım işlemleri ve kur takibi.",
  },
  {
    title: "Raporlama",
    icon: <AssessmentIcon />,
    items: ["Stok Raporları", "Satış Raporları", "Alış Raporları"],
    button: { text: "Raporlar", color: "info" },
    onClick: "/report",
    description: "Detaylı raporlarla performansınızı analiz edin.",
  },
];

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, sm: 6 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          mb={3}
          align="center"
          color="text.primary"
        >
          Yönetim Paneli
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
            alignItems: "stretch",
            gridAutoRows: "1fr",
          }}
        >
          {sections.map((section) => (
            <Paper
              key={section.title}
              elevation={6}
              role="group"
              aria-label={section.title}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 12,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor:
                      section.button.color === "primary"
                        ? "primary.main"
                        : section.button.color === "secondary"
                        ? "secondary.main"
                        : section.button.color === "success"
                        ? "success.main"
                        : section.button.color === "warning"
                        ? "warning.main"
                        : section.button.color === "info"
                        ? "info.main"
                        : "grey.700",
                    width: 56,
                    height: 56,
                  }}
                  aria-hidden="true"
                >
                  {React.cloneElement(section.icon as React.ReactElement, {})}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} component="h3">
                    {section.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {section.description}
                  </Typography>
                </Box>

                <IconButton
                  aria-label={`${section.title} detay`}
                  onClick={() =>
                    section.onClick ? navigate(section.onClick) : undefined
                  }
                  size="small"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <List dense sx={{ flexGrow: 1 }}>
                {section.items.map((item) => (
                  <ListItem key={item} disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleOutlineIcon
                        color="disabled"
                        fontSize="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color={section.button.color as any}
                  fullWidth
                  onClick={() =>
                    section.onClick ? navigate(section.onClick) : undefined
                  }
                  aria-label={section.button.text}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    px: 2,
                  }}
                >
                  {section.button.text}
                </Button>

                <Button
                  variant="outlined"
                  color={section.button.color as any}
                  onClick={() =>
                    section.onClick ? navigate(section.onClick) : undefined
                  }
                  aria-label={`${section.button.text} - alternatif`}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 1.5,
                    display: { xs: "none", sm: "inline-flex" },
                    minWidth: 96,
                  }}
                >
                  Detaylar
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage;
