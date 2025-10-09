import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid as MuiGrid,
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

type TransactionType = "Satış" | "Alış";

interface ProductItem {
  id: string;
  name: string;
}

function SellingPage() {
  const Grid: any = MuiGrid;

  const { addSale, addPurchases, getProducts, addCustomer } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("Satış");

  const [customerName, setCustomerName] = useState("");
  const [customerTC, setCustomerTC] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [product, setProduct] = useState("");
  const [hasFiyat, setHasFiyat] = useState("");
  const [gram, setGram] = useState("");
  const [carpanDegeri, setCarpanDegeri] = useState("1");
  const [total, setTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Nakit" | "IBAN" | "Pos">(
    "Nakit"
  );
  const [paidAmount, setPaidAmount] = useState("0");
  const [isPaidInFull, setIsPaidInFull] = useState(false);

  useEffect(() => {
    async function fetchStockProducts() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(
          fetchedProducts.map((p) => ({
            id: p.id!,
            name: p.name,
          }))
        );
      } catch (error) {
        console.error("Ürünler çekilemedi:", error);
        enqueueSnackbar("Ürün listesi yüklenirken bir hata oluştu.", {
          variant: "error",
        });
      }
    }
    fetchStockProducts();
  }, [getProducts, enqueueSnackbar]);

  useEffect(() => {
    const fiyat = parseFloat(hasFiyat) || 0;
    const miktar = parseFloat(gram) || 0;
    const carpan = parseFloat(carpanDegeri) || 1;

    const calculatedTotal = fiyat * carpan * miktar;
    setTotal(calculatedTotal > 0 ? calculatedTotal.toFixed(2) : "");
  }, [hasFiyat, gram, carpanDegeri]);

  useEffect(() => {
    if (isPaidInFull) {
      setPaidAmount(total);
    } else if (paidAmount === total && total !== "") {
      setIsPaidInFull(true);
    } else if (isPaidInFull && paidAmount !== total) {
      setPaidAmount(total);
    }
  }, [total, isPaidInFull, paidAmount]);

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
      .replace(/, /g, "T");
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerTC("");
    setCustomerPhone("");
    setProduct("");
    setHasFiyat("");
    setGram("");
    setCarpanDegeri("1");
    setTotal("");
    setPaymentMethod("Nakit");
    setPaidAmount("0");
    setIsPaidInFull(false);
  };

  const changeTransactionType = (type: TransactionType) => {
    setTransactionType(type);
    resetForm();
  };

  const handleTransaction = async () => {
    const productName = products.find((p) => p.id === product)?.name || "";

    const paid = parseFloat(paidAmount);
    const totalAmount = parseFloat(total);
    const quantity = parseFloat(gram);

    if (totalAmount <= 0) {
      enqueueSnackbar("Toplam tutar 0'dan büyük olmalıdır.", {
        variant: "warning",
      });
      return;
    }

    if (paid > totalAmount) {
      enqueueSnackbar("Ödenen tutar, toplam tutardan fazla olamaz.", {
        variant: "warning",
      });
      return;
    }

    try {
      if (transactionType === "Satış") {
        await addSale({
          productId: product,
          productName: productName,
          customerId: "",
          customerName: customerName || "-",
          quantity,
          total: totalAmount,
          paid,
          date: getLocalDateTime(),
          paymentMethod,
          customer: {
            name: customerName || "-",
            tc: customerTC || "-",
            phone: customerPhone || "",
          },
        });
        enqueueSnackbar("Satış başarıyla kaydedildi!", { variant: "success" });
      } else if (transactionType === "Alış") {
        await addPurchases({
          productName: productName,
          customerName: customerName || "-",
          quantity,
          total: totalAmount,
          paid,
          date: getLocalDateTime(),
          paymentMethod,
          boughtItem: productName,
          customer: {
            name: customerName || "-",
            tc: customerTC || "-",
            phone: customerPhone || "",
          },
        });
        enqueueSnackbar("Alış başarıyla kaydedildi!", { variant: "success" });
      }

      resetForm();
    } catch (error) {
      enqueueSnackbar(
        `${transactionType} kaydedilirken hata oluştu. ${
          error instanceof Error ? error.message : ""
        }`,
        {
          variant: "error",
        }
      );
      console.error(`${transactionType} hatası:`, error);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "");
    setCustomerPhone(input);
  };

  return (
    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ maxWidth: 1000 }}
      >
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
            <Typography
              variant="h4"
              fontWeight={600}
              mb={4}
              align="center"
              color="primary"
            >
              Altın {transactionType} İşlemi 🪙
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: { md: "100%" },
                    justifyContent: "right",
                  }}
                >
                  <Button
                    variant={
                      transactionType === "Satış" ? "contained" : "outlined"
                    }
                    color="primary"
                    fullWidth
                    size="medium"
                    onClick={() => changeTransactionType("Satış")}
                    sx={{ mb: 2 }}
                  >
                    Satış (Müşteriye Sat)
                  </Button>
                  <Button
                    variant={
                      transactionType === "Alış" ? "contained" : "outlined"
                    }
                    color="secondary"
                    fullWidth
                    size="medium"
                    onClick={() => changeTransactionType("Alış")}
                  >
                    Alış (Müşteriden Al)
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, height: "100%", position: "relative" }}
                    >
                      <Typography variant="h6" mb={3} color="text.secondary">
                        1. Müşteri Bilgileri
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Müşteri Adı"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12}>
                          <TextField
                            label="Telefon Numarası (Opsiyonel)"
                            value={customerPhone}
                            onChange={handlePhoneChange}
                            inputProps={{ maxLength: 11 }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" mb={3} color="text.secondary">
                    2. Ürün ve Finans
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        {" "}
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

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Has Fiyatı"
                        value={hasFiyat}
                        onChange={(e) =>
                          setHasFiyat(e.target.value.replace(/[^0-9.]/g, ""))
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">TL</InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="İşçilik Çarpanı"
                        value={carpanDegeri}
                        onChange={(e) =>
                          setCarpanDegeri(
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        fullWidth
                        helperText="Toplam fiyatı etkileyen işçilik/kar çarpanı"
                      />
                    </Grid>

                    <Grid item xs={12}>
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
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, height: "100%", bgcolor: "action.hover" }}
                >
                  <Typography variant="h6" mb={3} color="text.secondary">
                    3. Ödeme ve Sonuç
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Toplam Tutar"
                        value={total}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">TL</InputAdornment>
                          ),
                        }}
                        fullWidth
                        variant="filled"
                        color="success"
                        focused
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
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
                              e.target.value as "Nakit" | "IBAN" | "Pos"
                            )
                          }
                        >
                          <MenuItem value="Nakit">Nakit</MenuItem>
                          <MenuItem value="IBAN">IBAN</MenuItem>
                          <MenuItem value="Pos">Pos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        "& > div": { flexGrow: 1 },
                      }}
                    >
                      <TextField
                        label="Ödenen Tutar"
                        type="number"
                        value={paidAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          setPaidAmount(value);
                          if (value !== total) {
                            setIsPaidInFull(false);
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">TL</InputAdornment>
                          ),
                        }}
                        fullWidth
                        color={
                          paidAmount === total && total !== ""
                            ? "success"
                            : "primary"
                        }
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPaidInFull}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setIsPaidInFull(checked);
                              if (checked) {
                                setPaidAmount(total);
                              } else if (paidAmount === total) {
                                setPaidAmount("0");
                              }
                            }}
                          />
                        }
                        label="Tamamı Ödendi"
                        sx={{ ml: 1, minWidth: "120px" }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={handleTransaction}
                        disabled={parseFloat(total) <= 0}
                        sx={{ mt: 2 }}
                      >
                        {transactionType} İşlemini Kaydet
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SellingPage;
