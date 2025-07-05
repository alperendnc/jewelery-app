import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

function SellingPage() {
  const { addSale } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [customerName, setCustomerName] = useState("");
  const [customerTC, setCustomerTC] = useState("");
  const [product, setProduct] = useState("");
  const [ayar, setAyar] = useState("");
  const [hasFiyat, setHasFiyat] = useState("");
  const [gram, setGram] = useState("");
  const [total, setTotal] = useState("");

  const [buyCustomerName, setBuyCustomerName] = useState("");
  const [buyCustomerTC, setBuyCustomerTC] = useState("");
  const [buyProduct, setBuyProduct] = useState("");
  const [buyAyar, setBuyAyar] = useState("");
  const [buyHasFiyat, setBuyHasFiyat] = useState("");
  const [buyGram, setBuyGram] = useState("");
  const [buyTotal, setBuyTotal] = useState("");

  useEffect(() => {
    const fiyat = parseFloat(hasFiyat) || 0;
    const miktar = parseFloat(gram) || 0;
    setTotal(fiyat * 945 * miktar > 0 ? (fiyat * 945 * miktar).toFixed(2) : "");
  }, [hasFiyat, gram]);

  useEffect(() => {
    const fiyat = parseFloat(buyHasFiyat) || 0;
    const miktar = parseFloat(buyGram) || 0;
    setBuyTotal(
      fiyat * 905 * miktar > 0 ? (fiyat * 905 * miktar).toFixed(2) : ""
    );
  }, [buyHasFiyat, buyGram]);

  const handleSell = async () => {
    await addSale({
      productId: "",
      productName: product,
      customerId: "",
      customerName: customerName,
      quantity: parseFloat(gram),
      total: parseFloat(total),
      date: new Date().toISOString().slice(0, 10),
    });
    enqueueSnackbar("Satış başarıyla kaydedildi!", { variant: "success" });
  };

  const handleBuy = async () => {
    await addSale({
      productId: "",
      productName: buyProduct,
      customerId: "",
      customerName: buyCustomerName,
      quantity: parseFloat(buyGram),
      total: parseFloat(buyTotal),
      date: new Date().toISOString().slice(0, 10),
    });
    enqueueSnackbar("Alış başarıyla kaydedildi!", { variant: "success" });
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="stretch"
        sx={{
          maxWidth: 1200,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Grid sx={{ display: "flex" }}>
          <Paper sx={{ p: 4, borderRadius: 4, width: "100%", flex: 1 }}>
            <Typography variant="h6" fontWeight={600} mb={2} align="center">
              Satış
            </Typography>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Müşteri Adı"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="T.C."
                  value={customerTC}
                  onChange={(e) =>
                    setCustomerTC(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{ maxLength: 11 }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ürün"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ayar"
                  value={ayar}
                  onChange={(e) => setAyar(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Has Fiyatı"
                  value={hasFiyat}
                  onChange={(e) =>
                    setHasFiyat(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">TL x 945</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Gram"
                  value={gram}
                  onChange={(e) =>
                    setGram(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">gr</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Toplam"
                  value={total}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">TL</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSell}
                  disabled={
                    !customerName ||
                    !customerTC ||
                    !product ||
                    !ayar ||
                    !hasFiyat ||
                    !gram
                  }
                >
                  Satışı Tamamla
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid sx={{ display: "flex" }}>
          <Paper sx={{ p: 4, borderRadius: 4, width: "100%", flex: 1 }}>
            <Typography variant="h6" fontWeight={600} mb={2} align="center">
              Alış
            </Typography>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Müşteri Adı"
                  value={buyCustomerName}
                  onChange={(e) => setBuyCustomerName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="T.C."
                  value={buyCustomerTC}
                  onChange={(e) =>
                    setBuyCustomerTC(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{ maxLength: 11 }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ürün"
                  value={buyProduct}
                  onChange={(e) => setBuyProduct(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ayar"
                  value={buyAyar}
                  onChange={(e) => setBuyAyar(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Has Fiyatı"
                  value={buyHasFiyat}
                  onChange={(e) =>
                    setBuyHasFiyat(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">TL x 905</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Gram"
                  value={buyGram}
                  onChange={(e) =>
                    setBuyGram(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">gr</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Toplam"
                  value={buyTotal}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">TL</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  onClick={handleBuy}
                  disabled={
                    !buyCustomerName ||
                    !buyCustomerTC ||
                    !buyProduct ||
                    !buyAyar ||
                    !buyHasFiyat ||
                    !buyGram
                  }
                >
                  Alışı Tamamla
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SellingPage;
