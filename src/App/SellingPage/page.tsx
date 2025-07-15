import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

function SellingPage() {
  const { addSale, addPurchases, getProducts } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerTC, setCustomerTC] = useState("");
  const [product, setProduct] = useState("");
  const [ayar, setAyar] = useState("");
  const [hasFiyat, setHasFiyat] = useState("");
  const [gram, setGram] = useState("");
  const [total, setTotal] = useState("");
  const [sellMultiplier, setSellMultiplier] = useState(945);
  const [paymentMethod, setPaymentMethod] = useState<"Nakit" | "IBAN" | "Post">(
    "Nakit"
  );

  const [buyCustomerName, setBuyCustomerName] = useState("");
  const [buyCustomerTC, setBuyCustomerTC] = useState("");
  const [buyProduct, setBuyProduct] = useState("");
  const [buyAyar, setBuyAyar] = useState("");
  const [buyHasFiyat, setBuyHasFiyat] = useState("");
  const [buyGram, setBuyGram] = useState("");
  const [buyTotal, setBuyTotal] = useState("");
  const [buyMultiplier, setBuyMultiplier] = useState(905);
  const [buyPaymentMethod, setBuyPaymentMethod] = useState<
    "Nakit" | "IBAN" | "Post"
  >("Nakit");

  useEffect(() => {
    async function fetchStockProducts() {
      try {
        const prods = await getProducts();
        setProducts(prods.map((p) => ({ id: p.id || "", name: p.name })));
      } catch (error) {
        console.error("Ürünler yüklenemedi", error);
      }
    }
    fetchStockProducts();
  }, [getProducts]);

  useEffect(() => {
    const fiyat = parseFloat(hasFiyat) || 0;
    const miktar = parseFloat(gram) || 0;
    setTotal(
      fiyat * sellMultiplier * miktar > 0
        ? (fiyat * sellMultiplier * miktar).toFixed(2)
        : ""
    );
  }, [hasFiyat, gram, sellMultiplier]);

  useEffect(() => {
    const fiyat = parseFloat(buyHasFiyat) || 0;
    const miktar = parseFloat(buyGram) || 0;
    setBuyTotal(
      fiyat * buyMultiplier * miktar > 0
        ? (fiyat * buyMultiplier * miktar).toFixed(2)
        : ""
    );
  }, [buyHasFiyat, buyGram, buyMultiplier]);

  const getLocalDateTime = () => {
    const now = new Date();
    return now
      .toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\./g, "-")
      .replace(/ /g, "T");
  };

  const handleSell = async () => {
    try {
      await addSale({
        productId: product,
        productName: products.find((p) => p.id === product)?.name || "",
        customerId: "",
        customerName: customerName,
        quantity: parseFloat(gram),
        total: parseFloat(total),
        date: getLocalDateTime(),
        customer: {
          name: customerName,
          tc: customerTC,
          phone: "",
          soldItem: products.find((p) => p.id === product)?.name || "",
        },
        paymentMethod,
      });
      enqueueSnackbar("Satış başarıyla kaydedildi!", { variant: "success" });

      setCustomerName("");
      setCustomerTC("");
      setProduct("");
      setAyar("");
      setHasFiyat("");
      setGram("");
      setTotal("");
      setPaymentMethod("Nakit");
    } catch (error) {
      enqueueSnackbar("Satış kaydedilirken hata oluştu.", { variant: "error" });
      console.error(error);
    }
  };

  const handleBuy = async () => {
    try {
      await addPurchases({
        supplierName: buyCustomerName,
        productName: products.find((p) => p.id === buyProduct)?.name || "",
        quantity: parseFloat(buyGram),
        total: parseFloat(buyTotal),
        paid: parseFloat(buyTotal),
        date: getLocalDateTime(),
      });

      enqueueSnackbar("Alış başarıyla kaydedildi!", {
        variant: "success",
      });

      setBuyCustomerName("");
      setBuyCustomerTC("");
      setBuyProduct("");
      setBuyAyar("");
      setBuyHasFiyat("");
      setBuyGram("");
      setBuyTotal("");
      setBuyPaymentMethod("Nakit");
    } catch (error) {
      enqueueSnackbar("Alış kaydedilirken hata oluştu.", { variant: "error" });
      console.error(error);
    }
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="stretch"
        sx={{ maxWidth: 1200, flexWrap: { xs: "wrap", md: "nowrap" } }}
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
                <FormControl fullWidth>
                  <InputLabel id="product-select-label">Ürün</InputLabel>
                  <Select
                    labelId="product-select-label"
                    id="product-select"
                    value={product}
                    label="Ürün"
                    onChange={(e: SelectChangeEvent<string>) =>
                      setProduct(e.target.value)
                    }
                  >
                    {products.map((prod) => (
                      <MenuItem key={prod.id} value={prod.id}>
                        {prod.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      <InputAdornment position="end">
                        <select
                          value={sellMultiplier}
                          onChange={(e) =>
                            setSellMultiplier(Number(e.target.value))
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "14px",
                            padding: "0 4px",
                          }}
                        >
                          <option value={945}>945</option>
                          <option value={8820}>8820</option>
                          <option value={1007}>1007</option>
                          <option value={100}>100</option>
                        </select>
                      </InputAdornment>
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
                <FormControl fullWidth>
                  <InputLabel id="payment-method-label">
                    Ödeme Yöntemi
                  </InputLabel>
                  <Select
                    labelId="payment-method-label"
                    value={paymentMethod}
                    label="Ödeme Yöntemi"
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as "Nakit" | "IBAN" | "Post"
                      )
                    }
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="IBAN">IBAN</MenuItem>
                    <MenuItem value="Post">Post</MenuItem>
                  </Select>
                </FormControl>
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
                  label="Toptancı Adı"
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
                <FormControl fullWidth>
                  <InputLabel id="buy-product-select-label">Ürün</InputLabel>
                  <Select
                    labelId="buy-product-select-label"
                    id="buy-product-select"
                    value={buyProduct}
                    label="Ürün"
                    onChange={(e: SelectChangeEvent<string>) =>
                      setBuyProduct(e.target.value)
                    }
                  >
                    {products.map((prod) => (
                      <MenuItem key={prod.id} value={prod.id}>
                        {prod.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      <InputAdornment position="end">
                        <select
                          value={buyMultiplier}
                          onChange={(e) =>
                            setBuyMultiplier(Number(e.target.value))
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "14px",
                            padding: "0 4px",
                          }}
                        >
                          <option value={905}>905</option>
                          <option value={8820}>8820</option>
                          <option value={1007}>1007</option>
                          <option value={100}>100</option>
                        </select>
                      </InputAdornment>
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
                <FormControl fullWidth>
                  <InputLabel id="buy-payment-method-label">
                    Ödeme Yöntemi
                  </InputLabel>
                  <Select
                    labelId="buy-payment-method-label"
                    value={buyPaymentMethod}
                    label="Ödeme Yöntemi"
                    onChange={(e) =>
                      setBuyPaymentMethod(
                        e.target.value as "Nakit" | "IBAN" | "Post"
                      )
                    }
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="IBAN">IBAN</MenuItem>
                    <MenuItem value="Post">Post</MenuItem>
                  </Select>
                </FormControl>
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
                  color="primary"
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
                  Alışı Kaydet
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
