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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

function SellingPage() {
  const { addSale, addPurchases, getProducts, addCustomer } = useAuth();
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
  const [paidAmount, setPaidAmount] = useState("0");
  const [isPaidInFull, setIsPaidInFull] = useState(false);
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
  const [buyPaidAmount, setBuyPaidAmount] = useState("0");
  const [isBuyPaidInFull, setIsBuyPaidInFull] = useState(false);

  const productMultipliers: Record<string, number> = {
    "22 Bilezik": 945,
    "Ata Altın": 8820,
    "Reşat Altın": 1007,
    "14 Takı": 670,
    "24 Ayar": 950,
    "22 Ayar": 945,
    "22 Takı": 680,
  };

  const buyProductMultipliers: Record<string, number> = {
    "22 Bilezik": 905,
    "Ata Altın": 8820,
    "Reşat Altın": 997,
    "14 Takı": 655,
    "24 Ayar": 910,
    "22 Ayar": 905,
    "22 Takı": 680,
  };

  useEffect(() => {
    async function fetchStockProducts() {
      try {
        const prods = await getProducts();
        setProducts(prods.map((p) => ({ id: p.id || "", name: p.name })));
      } catch (error) {
        console.error("Ürünler yüklenemedi", error);
        enqueueSnackbar("Ürünler yüklenirken bir hata oluştu.", {
          variant: "error",
        });
      }
    }
    fetchStockProducts();
  }, [getProducts, enqueueSnackbar]);

  useEffect(() => {
    const fiyat = parseFloat(hasFiyat) || 0;
    const miktar = parseFloat(gram) || 0;
    const calculatedTotal = fiyat * sellMultiplier * miktar;
    setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : "");
  }, [hasFiyat, gram, sellMultiplier]);

  useEffect(() => {
    if (isPaidInFull) {
      setPaidAmount(total);
    }
  }, [total, isPaidInFull]);

  useEffect(() => {
    const fiyat = parseFloat(buyHasFiyat) || 0;
    const miktar = parseFloat(buyGram) || 0;
    const calculatedBuyTotal = fiyat * buyMultiplier * miktar;
    setBuyTotal(calculatedBuyTotal > 0 ? calculatedBuyTotal.toFixed(2) : "");
  }, [buyHasFiyat, buyGram, buyMultiplier]);

  useEffect(() => {
    if (isBuyPaidInFull) {
      setBuyPaidAmount(buyTotal);
    }
  }, [buyTotal, isBuyPaidInFull]);

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
      if (
        !customerName ||
        !customerTC ||
        !product ||
        !hasFiyat ||
        !gram ||
        !total ||
        !paidAmount
      ) {
        enqueueSnackbar("Lütfen tüm satış alanlarını doldurun.", {
          variant: "warning",
        });
        return;
      }
      if (parseFloat(paidAmount) > parseFloat(total)) {
        enqueueSnackbar("Ödenen tutar, toplam tutardan fazla olamaz.", {
          variant: "warning",
        });
        return;
      }

      await addCustomer({
        name: customerName,
        tc: customerTC,
        phone: "",
        soldItem: products.find((p) => p.id === product)?.name || "",
        total: parseFloat(total),
        quantity: parseFloat(gram),
        paid: parseFloat(paidAmount),
        date: getLocalDateTime(),
      });

      await addSale({
        productId: product,
        productName: products.find((p) => p.id === product)?.name || "",
        customerId: "",
        customerName,
        quantity: parseFloat(gram),
        total: parseFloat(total),
        paid: parseFloat(paidAmount),
        date: getLocalDateTime(),
        paymentMethod,
        customer: {
          name: customerName,
          tc: customerTC,
          phone: "",
          soldItem: products.find((p) => p.id === product)?.name || "",
          total: parseFloat(total),
          quantity: parseFloat(gram),
          paid: parseFloat(paidAmount),
          date: getLocalDateTime(),
        },
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
      setPaidAmount("0");
      setIsPaidInFull(false);
    } catch (error) {
      enqueueSnackbar("Satış kaydedilirken hata oluştu.", { variant: "error" });
      console.error("Satış hatası:", error);
    }
  };

  const handleBuy = async () => {
    try {
      if (
        !buyCustomerName ||
        !buyCustomerTC ||
        !buyProduct ||
        !buyHasFiyat ||
        !buyGram ||
        !buyTotal ||
        !buyPaidAmount
      ) {
        enqueueSnackbar("Lütfen tüm alış alanlarını doldurun.", {
          variant: "warning",
        });
        return;
      }
      if (parseFloat(buyPaidAmount) > parseFloat(buyTotal)) {
        enqueueSnackbar("Ödenen tutar, toplam tutardan fazla olamaz.", {
          variant: "warning",
        });
        return;
      }

      await addCustomer({
        name: buyCustomerName,
        tc: buyCustomerTC,
        total: parseFloat(buyTotal),
        quantity: parseFloat(buyGram),
        paid: parseFloat(buyPaidAmount),
        date: getLocalDateTime(),
      });

      await addPurchases({
        productName: products.find((p) => p.id === buyProduct)?.name || "",
        customerName: buyCustomerName,
        quantity: parseFloat(buyGram),
        total: parseFloat(buyTotal),
        paid: parseFloat(buyPaidAmount),
        date: getLocalDateTime(),
        paymentMethod: buyPaymentMethod,
      });

      enqueueSnackbar("Alış başarıyla kaydedildi!", { variant: "success" });

      setBuyCustomerName("");
      setBuyCustomerTC("");
      setBuyProduct("");
      setBuyAyar("");
      setBuyHasFiyat("");
      setBuyGram("");
      setBuyTotal("");
      setBuyPaymentMethod("Nakit");
      setBuyPaidAmount("0");
      setIsBuyPaidInFull(false);
    } catch (error) {
      enqueueSnackbar("Alış kaydedilirken hata oluştu.", { variant: "error" });
      console.error("Alış hatası:", error);
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
          {" "}
          <Paper sx={{ p: 4, borderRadius: 4, width: "100%", flex: 1 }}>
            <Typography variant="h6" fontWeight={600} mb={2} align="center">
              Satış
            </Typography>
            <Grid container spacing={2}>
              <Grid>
                {" "}
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
                    onChange={(e: SelectChangeEvent<string>) => {
                      const selectedProductId = e.target.value;
                      setProduct(selectedProductId);
                      const productName = products.find(
                        (p) => p.id === selectedProductId
                      )?.name;
                      if (productName && productMultipliers[productName]) {
                        setSellMultiplier(productMultipliers[productName]);
                      }
                    }}
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
                        {sellMultiplier}
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
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  label="Ödenen Tutar"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => {
                    setPaidAmount(e.target.value.replace(/[^0-9.]/g, ""));
                    setIsPaidInFull(false);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">TL</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isPaidInFull}
                      onChange={(e) => {
                        setIsPaidInFull(e.target.checked);
                        if (e.target.checked) {
                          setPaidAmount(total);
                        }
                      }}
                    />
                  }
                  label="Ödendi"
                  sx={{ ml: 1 }}
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="medium"
                  onClick={handleSell}
                  disabled={
                    !customerName ||
                    !customerTC ||
                    !product ||
                    !ayar ||
                    !hasFiyat ||
                    !gram ||
                    !paidAmount
                  }
                >
                  Satışı Kaydet
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid sx={{ display: "flex" }}>
          {" "}
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
                <FormControl fullWidth>
                  <InputLabel id="buy-product-select-label">Ürün</InputLabel>
                  <Select
                    labelId="buy-product-select-label"
                    id="buy-product-select"
                    value={buyProduct}
                    label="Ürün"
                    onChange={(e: SelectChangeEvent<string>) => {
                      const selectedProductId = e.target.value;
                      setBuyProduct(selectedProductId);
                      const productName = products.find(
                        (p) => p.id === selectedProductId
                      )?.name;
                      if (productName && buyProductMultipliers[productName]) {
                        setBuyMultiplier(buyProductMultipliers[productName]);
                      }
                    }}
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
                        {buyMultiplier}
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
              <Grid sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  label="Ödenen Tutar"
                  type="number"
                  value={buyPaidAmount}
                  onChange={(e) => {
                    setBuyPaidAmount(e.target.value.replace(/[^0-9.]/g, ""));
                    setIsBuyPaidInFull(false);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">TL</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isBuyPaidInFull}
                      onChange={(e) => {
                        setIsBuyPaidInFull(e.target.checked);
                        if (e.target.checked) {
                          setBuyPaidAmount(buyTotal);
                        }
                      }}
                    />
                  }
                  label="Ödendi"
                  sx={{ ml: 1 }}
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="medium"
                  onClick={handleBuy}
                  disabled={
                    !buyCustomerName ||
                    !buyCustomerTC ||
                    !buyProduct ||
                    !buyAyar ||
                    !buyHasFiyat ||
                    !buyGram ||
                    !buyPaidAmount
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
