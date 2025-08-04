import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { useAuth } from "src/contexts/UseAuth";
import { db } from "src/config";
import { useSnackbar } from "notistack";
import { SupplierTransaction } from "src/contexts/UseAuth";
import formDate from "src/components/formDate";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";

type StockItem = {
  id: string;
  name: string;
  adet: number;
};

const initialCategories: string[] = [];

const StockPage = () => {
  const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSupplierTransactions,
    addSupplierTransaction,
  } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [stock, setStock] = useState<StockItem[]>([]);
  const [inputAdetleri, setInputAdetleri] = useState<{
    [name: string]: string;
  }>({});
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", stock: "" });
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const [supplierTransactions, setSupplierTransactions] = useState<
    SupplierTransaction[]
  >([]);
  const [addSupplierDialogOpen, setAddSupplierDialogOpen] = useState(false);
  const [newSupplierTransaction, setNewSupplierTransaction] = useState<
    Omit<SupplierTransaction, "id">
  >({
    supplierName: "",
    productName: "",
    quantity: 0,
    total: 0,
    paid: 0,
    date: formDate(Date()),
  });
  const [showSupplier, setShowSupplier] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    supplierName: "",
    hasPrice: "",
    gram: "",
    product: "",
    paid: "",
    quantity: "",
  });
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);

  const [confirmDeleteTransactionOpen, setConfirmDeleteTransactionOpen] =
    useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();

      const productNamesFromFetched = products.map((p: any) => p.name);

      setCategories((prev) =>
        Array.from(new Set([...prev, ...productNamesFromFetched]))
      );

      const cleanedProducts = products.filter((p: any) => p.name !== "");

      const mapped = cleanedProducts.map((p: any) => ({
        id: p.id || "",
        name: p.name,
        adet: p.stock,
      }));
      setStock(mapped);

      const adetObj: { [name: string]: string } = {};
      cleanedProducts.forEach((item) => {
        adetObj[item.name] = item.name.toString();
      });
      setInputAdetleri(adetObj);
    }
    fetchProducts();
  }, [getProducts]);

  useEffect(() => {
    async function fetchSupplierTransactions() {
      const fetchedSupplierTransactions = await getSupplierTransactions();
      setSupplierTransactions(fetchedSupplierTransactions);
    }
    fetchSupplierTransactions();
  }, [getSupplierTransactions]);

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      const productNames = products.map((p: any) => p.name);
      setProductOptions(productNames);
    }
    fetchProducts();
  }, [getProducts]);

  useEffect(() => {
    async function fetchSupplierTransactionsFromFirebase() {
      const querySnapshot = await getDocs(
        collection(db, "supplierTransactions")
      );
      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          supplierName: data.supplierName || "",
          productName: data.productName || "",
          quantity: data.quantity || 0,
          total: data.total || 0,
          paid: data.paid || 0,
          date: data.date || "",
        } as SupplierTransaction;
      });
      setSupplierTransactions(transactions);
    }
    fetchSupplierTransactionsFromFirebase();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setInputAdetleri((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (name: string) => {
    const value = inputAdetleri[name];
    if (value === undefined || value === "" || isNaN(Number(value))) return;

    const existing = stock.find((item) => item.name === name);

    if (existing) {
      const newStock = Number(value);
      await updateProduct(existing.id, { stock: newStock });
    } else {
      await addProduct({
        name: name,
        gram: 0,
        price: 0,
        stock: Number(value),
      });
    }

    const updated = await getProducts();
    const filtered = updated.filter((p: any) => categories.includes(p.name));
    const mapped = filtered.map((p: any) => ({
      id: p.id || "",
      name: p.name,
      adet: p.stock,
    }));
    setStock(mapped);
    enqueueSnackbar(`${name} stoğu güncellendi.`, { variant: "success" });
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.stock ||
      isNaN(Number(newProduct.stock))
    )
      return;

    await addProduct({
      name: newProduct.name,
      gram: 0,
      price: 0,
      stock: Number(newProduct.stock),
    });

    const updatedProducts = await getProducts();
    const productNamesFromUpdated = updatedProducts.map((p: any) => p.name);
    setCategories(Array.from(new Set(productNamesFromUpdated)));

    const mapped = updatedProducts.map((p: any) => ({
      id: p.id || "",
      name: p.name,
      adet: p.stock,
    }));
    setStock(mapped);

    setOpenAddDialog(false);
    setNewProduct({ name: "", stock: "" });

    enqueueSnackbar(`${newProduct.name} başarıyla eklendi.`, {
      variant: "success",
    });
  };

  const handleDeleteProduct = async (name: string) => {
    const productToDelete = stock.find((item) => item.name === name);
    if (!productToDelete) {
      enqueueSnackbar(`Ürün bulunamadı: ${name}`, { variant: "error" });
      return;
    }

    try {
      await deleteProduct(productToDelete.id);

      setCategories((prev) => prev.filter((cat) => cat !== name));
      setStock((prev) => prev.filter((item) => item.name !== name));

      enqueueSnackbar(`${name} başarıyla silindi.`, { variant: "info" });
    } catch (error) {
      console.error("Error deleting product:", error);
      enqueueSnackbar(`Ürün silinirken bir hata oluştu: ${name}`, {
        variant: "error",
      });
    }
  };

  const handleDeleteSupplierTransaction = async (transactionId: string) => {
    try {
      await deleteDoc(doc(db, "supplierTransactions", transactionId));
      setSupplierTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== transactionId)
      );
      enqueueSnackbar("Toptancı alışverişi başarıyla silindi.", {
        variant: "info",
      });
    } catch (error) {
      console.error("Error deleting supplier transaction:", error);
      enqueueSnackbar("Toptancı alışverişi silinirken bir hata oluştu.", {
        variant: "error",
      });
    } finally {
      setConfirmDeleteTransactionOpen(false);
      setTransactionToDeleteId(null);
    }
  };

  const handleAddSupplierTransaction = async () => {
    try {
      await addSupplierTransaction(newSupplierTransaction);

      const querySnapshot = await getDocs(
        collection(db, "supplierTransactions")
      );
      const transactions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          supplierName: data.supplierName || "",
          productName: data.productName || "",
          quantity: data.quantity || 0,
          total: data.total || 0,
          paid: data.paid || 0,
          date: data.date || "",
        } as SupplierTransaction;
      });

      setSupplierTransactions(transactions);

      setAddSupplierDialogOpen(false);

      setNewSupplierTransaction({
        supplierName: "",
        productName: "",
        quantity: 0,
        total: 0,
        paid: 0,
        date: formDate(new Date().toISOString()),
      });

      enqueueSnackbar("Toptancı başarıyla eklendi.", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Toptancı eklenirken bir hata oluştu.", {
        variant: "error",
      });
    }
  };

  const handleToggleView = () => {
    setShowSupplier((prev) => !prev);
  };

  const handlePurchaseInputChange = (field: string, value: string) => {
    setNewPurchase((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPurchase = async () => {
    if (
      !newPurchase.supplierName ||
      !newPurchase.hasPrice ||
      !newPurchase.gram ||
      !newPurchase.product
    ) {
      enqueueSnackbar("Lütfen tüm alanları doldurun.", { variant: "warning" });
      return;
    }

    const existingProduct = stock.find(
      (item) => item.name === newPurchase.product
    );

    if (existingProduct) {
      await updateProduct(existingProduct.id, {
        stock: existingProduct.adet + Number(newPurchase.quantity || 0),
      });
    } else {
      await addProduct({
        name: newPurchase.product,
        gram: 0,
        price: 0,
        stock: Number(newPurchase.quantity || 0),
      });

      const updatedProducts = await getProducts();
      setCategories(Array.from(new Set(updatedProducts.map((p) => p.name))));
      setProductOptions(updatedProducts.map((p) => p.name));

      setStock(
        updatedProducts.map((p) => ({
          id: p.id || "",
          name: p.name,
          adet: p.stock,
        }))
      );
    }

    const newTransaction = {
      supplierName: newPurchase.supplierName,
      productName: newPurchase.product,
      quantity: Number(newPurchase.quantity || 0),
      total: Number(newPurchase.gram) * Number(newPurchase.hasPrice),
      paid: Number(newPurchase.paid || 0),
      date: formDate(new Date().toISOString()),
    };

    await addDoc(collection(db, "supplierTransactions"), newTransaction);

    const querySnapshot = await getDocs(collection(db, "supplierTransactions"));
    const transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        supplierName: data.supplierName || "",
        productName: data.productName || "",
        quantity: data.quantity || 0,
        total: data.total || 0,
        paid: data.paid || 0,
        date: data.date || "",
      } as SupplierTransaction;
    });
    setSupplierTransactions(transactions);

    enqueueSnackbar("Toptancı alış başarıyla eklendi.", { variant: "success" });
    setNewPurchase({
      supplierName: "",
      hasPrice: "",
      gram: "",
      product: "",
      paid: "",
      quantity: "",
    });
    setOpenPurchaseDialog(false);
  };

  return (
    <Box
      sx={{
        mt: 4,
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
          perspective: "1000px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: showSupplier ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s",
          }}
        >
          <Paper
            sx={{
              backfaceVisibility: "hidden",
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Button
                  variant="contained"
                  onClick={handleToggleView}
                  sx={{ mr: 2 }}
                >
                  Toptancı
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setOpenAddDialog(true)}
                >
                  Ürün Ekle
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {categories.map((cat) => {
                      const currentStock = stock.find(
                        (item) => item.name === cat
                      );
                      return (
                        <TableRow key={cat}>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {cat}
                          </TableCell>
                          <TableCell>
                            Mevcut: {currentStock ? currentStock.adet : 0}
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={inputAdetleri[cat] || ""}
                              onChange={(e) =>
                                handleInputChange(cat, e.target.value)
                              }
                              inputProps={{ min: 0 }}
                              placeholder="Adet gir"
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleSave(cat)}
                            >
                              Kaydet / Güncelle
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteProduct(cat)}
                            >
                              Sil
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>

          <Paper
            sx={{
              backfaceVisibility: "hidden",
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: "rotateY(180deg)",
              overflow: "auto",
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Button
                  variant="contained"
                  onClick={handleToggleView}
                  sx={{ mr: 2 }}
                >
                  Stok
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setOpenPurchaseDialog(true)}
                  sx={{ mb: 2 }}
                >
                  Yeni Toptancı Alış
                </Button>
              </Box>

              <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                Toptancı Alışları
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              ></Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Toptancı</TableCell>
                      <TableCell align="center">Gram</TableCell>
                      <TableCell align="right">Ödenen (TL)</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.supplierName}</TableCell>
                        <TableCell align="center">
                          {transaction.quantity}
                        </TableCell>
                        <TableCell align="right">
                          {transaction.paid.toFixed(2)}
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setTransactionToDeleteId(transaction.id);
                              setConfirmDeleteTransactionOpen(true);
                            }}
                            sx={{ minWidth: "32px" }}
                          >
                            <DeleteIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Yeni Ürün Ekle</DialogTitle>
        <DialogContent>
          <TextField
            label="Ürün Adı"
            fullWidth
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Stok"
            fullWidth
            type="number"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddProduct}>
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteTransactionOpen}
        onClose={() => setConfirmDeleteTransactionOpen(false)}
      >
        <DialogTitle>İşlemi Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            Bu toptancı alışverişini silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteTransactionOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              transactionToDeleteId &&
              handleDeleteSupplierTransaction(transactionToDeleteId)
            }
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addSupplierDialogOpen}
        onClose={() => setAddSupplierDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Toptancı Alışı Ekle</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Toptancı Adı"
            value={newSupplierTransaction.supplierName}
            onChange={(e) =>
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                supplierName: e.target.value,
              })
            }
          />
          <Autocomplete
            freeSolo
            options={productOptions}
            value={newSupplierTransaction.productName}
            onChange={(_, newValue) => {
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                productName: newValue || "",
              });
            }}
            onInputChange={(_, newInputValue) => {
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                productName: newInputValue,
              });
            }}
            renderInput={(params) => <TextField {...params} label="Ürün Adı" />}
          />
          <TextField
            label="Adet"
            type="number"
            value={
              newSupplierTransaction.quantity === 0
                ? ""
                : newSupplierTransaction.quantity
            }
            onChange={(e) =>
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                quantity: Number(e.target.value),
              })
            }
          />
          <TextField
            label="Toplam Tutar"
            type="number"
            value={
              newSupplierTransaction.total === 0
                ? ""
                : newSupplierTransaction.total
            }
            onChange={(e) =>
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                total: Number(e.target.value),
              })
            }
          />
          <TextField
            label="Ödenen Tutar"
            type="number"
            value={
              newSupplierTransaction.paid === 0
                ? ""
                : newSupplierTransaction.paid
            }
            onChange={(e) =>
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                paid: Number(e.target.value),
              })
            }
          />
          <TextField
            label="Tarih"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newSupplierTransaction.date}
            onChange={(e) =>
              setNewSupplierTransaction({
                ...newSupplierTransaction,
                date: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSupplierDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddSupplierTransaction}>
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPurchaseDialog}
        onClose={() => setOpenPurchaseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yeni Toptancı Alış</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Toptancı İsmi"
            value={newPurchase.supplierName}
            onChange={(e) =>
              handlePurchaseInputChange("supplierName", e.target.value)
            }
          />
          <TextField
            label="Has Fiyat"
            type="number"
            value={newPurchase.hasPrice}
            onChange={(e) => {
              handlePurchaseInputChange("hasPrice", e.target.value);
              handlePurchaseInputChange(
                "total",
                (Number(newPurchase.gram) * Number(e.target.value)).toFixed(2)
              );
            }}
          />
          <TextField
            label="Gram"
            type="number"
            value={newPurchase.gram}
            onChange={(e) => {
              handlePurchaseInputChange("gram", e.target.value);
              handlePurchaseInputChange(
                "total",
                (Number(e.target.value) * Number(newPurchase.hasPrice)).toFixed(
                  2
                )
              );
            }}
          />
          <TextField
            label="Ödenen Tutar"
            type="number"
            value={newPurchase.paid || ""}
            onChange={(e) => handlePurchaseInputChange("paid", e.target.value)}
          />

          <Autocomplete
            freeSolo
            options={productOptions}
            value={newPurchase.product}
            onChange={(_, newValue) =>
              handlePurchaseInputChange("product", newValue || "")
            }
            onInputChange={(_, newInputValue) =>
              handlePurchaseInputChange("product", newInputValue)
            }
            renderInput={(params) => <TextField {...params} label="Ürün" />}
          />

          <TextField
            label="Adet (Opsiyonel - Stok Güncelleme İçin)"
            type="number"
            value={newPurchase.quantity || ""}
            onChange={(e) =>
              handlePurchaseInputChange("quantity", e.target.value)
            }
          />

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
          ></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPurchaseDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={handleAddPurchase}>
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockPage;
