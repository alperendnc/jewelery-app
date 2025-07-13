import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth, Purchase } from "src/contexts/UseAuth";

type Transaction = {
  id: string;
  type: "Giriş" | "Çıkış";
  description: string;
  amount: number;
  date: string;
  method: "Nakit" | "Kredi Kartı" | "Post";
};

const TrackingPage = () => {
  const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addPurchases,
    getPurchases,
  } = useAuth();

  const [tabIndex, setTabIndex] = useState(0);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchaseList, setPurchaseList] = useState<Purchase[]>([]);

  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, "id">>(
    {
      type: "Giriş",
      description: "",
      amount: 0,
      date: "",
      method: "Nakit",
    }
  );

  const [editId, setEditId] = useState<string | null>(null);
  const [editTransaction, setEditTransaction] = useState<
    Omit<Transaction, "id">
  >({
    type: "Giriş",
    description: "",
    amount: 0,
    date: "",
    method: "Nakit",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [supplierName, setSupplierName] = useState("");
  const [supplierProduct, setSupplierProduct] = useState("");
  const [supplierQuantity, setSupplierQuantity] = useState("");
  const [supplierTotal, setSupplierTotal] = useState("");
  const [supplierPaid, setSupplierPaid] = useState("");
  const [supplierDate, setSupplierDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    async function fetchData() {
      const trx = await getTransactions();
      const purchases = await getPurchases();
      setTransactions(trx);
      setPurchaseList(purchases);
    }
    fetchData();
  }, [getTransactions, getPurchases]);

  const handleAdd = async () => {
    if (
      !newTransaction.description ||
      newTransaction.amount <= 0 ||
      !newTransaction.date
    )
      return;
    await addTransaction(newTransaction);
    setNewTransaction({
      type: "Giriş",
      description: "",
      amount: 0,
      date: "",
      method: "Nakit",
    });
    setTransactions(await getTransactions());
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setDeleteId(null);
    setTransactions(await getTransactions());
  };

  const handleEdit = (transaction: Transaction) => {
    setEditId(transaction.id);
    setEditTransaction({ ...transaction });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateTransaction(editId, editTransaction);
    setEditId(null);
    setTransactions(await getTransactions());
  };

  const handleSupplier = async () => {
    await addPurchases({
      supplierName,
      productName: supplierProduct,
      quantity: parseFloat(supplierQuantity),
      total: parseFloat(supplierTotal),
      paid: parseFloat(supplierPaid),
      date: supplierDate,
    });
    setSupplierName("");
    setSupplierProduct("");
    setSupplierQuantity("");
    setSupplierTotal("");
    setSupplierPaid("");
    setSupplierDate(new Date().toISOString().slice(0, 10));
    setPurchaseList(await getPurchases());
  };

  const totalIn = transactions
    .filter((t) => t.type === "Giriş")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === "Çıkış")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, borderRadius: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newVal) => setTabIndex(newVal)}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Kasa ve Finans Takibi" />
          <Tab label="Toptancı İşlemleri" />
        </Tabs>

        {/* KASA VE FİNANS TAKİBİ */}
        {tabIndex === 0 && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <MonetizationOnIcon
                sx={{ fontSize: 40, color: "#ff9800", mr: 2 }}
              />
              <Typography variant="h5" fontWeight={600}>
                Kasa ve Finans Takibi
              </Typography>
            </Box>

            <Grid container spacing={2} mb={3}>
              <Grid>
                <TextField
                  select
                  label="Tip"
                  SelectProps={{ native: true }}
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value as "Giriş" | "Çıkış",
                    })
                  }
                  fullWidth
                >
                  <option value="Giriş">Giriş</option>
                  <option value="Çıkış">Çıkış</option>
                </TextField>
              </Grid>
              <Grid>
                <TextField
                  label="Açıklama"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Tutar"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: Number(e.target.value),
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Tarih"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      date: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  select
                  label="Yöntem"
                  SelectProps={{ native: true }}
                  value={newTransaction.method}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      method: e.target.value as any,
                    })
                  }
                  fullWidth
                >
                  <option value="Nakit">Nakit</option>
                  <option value="Kredi Kartı">Kredi Kartı</option>
                  <option value="Post">Post</option>
                </TextField>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAdd}
                  sx={{ height: "100%" }}
                >
                  Ekle
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Typography color="success.main" fontWeight={600}>
                Toplam Giriş: {totalIn} TL
              </Typography>
              <Typography color="error.main" fontWeight={600}>
                Toplam Çıkış: {totalOut} TL
              </Typography>
              <Typography color="primary.main" fontWeight={600}>
                Kasa Bakiyesi: {totalIn - totalOut} TL
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tip</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell>Tutar</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Yöntem</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {editId === t.id ? (
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            value={editTransaction.type}
                            onChange={(e) =>
                              setEditTransaction({
                                ...editTransaction,
                                type: e.target.value as any,
                              })
                            }
                            size="small"
                          >
                            <option value="Giriş">Giriş</option>
                            <option value="Çıkış">Çıkış</option>
                          </TextField>
                        ) : (
                          t.type
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === t.id ? (
                          <TextField
                            value={editTransaction.description}
                            onChange={(e) =>
                              setEditTransaction({
                                ...editTransaction,
                                description: e.target.value,
                              })
                            }
                            size="small"
                          />
                        ) : (
                          t.description
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === t.id ? (
                          <TextField
                            type="number"
                            value={editTransaction.amount}
                            onChange={(e) =>
                              setEditTransaction({
                                ...editTransaction,
                                amount: Number(e.target.value),
                              })
                            }
                            size="small"
                          />
                        ) : (
                          t.amount
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === t.id ? (
                          <TextField
                            type="date"
                            value={editTransaction.date}
                            onChange={(e) =>
                              setEditTransaction({
                                ...editTransaction,
                                date: e.target.value,
                              })
                            }
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          t.date
                        )}
                      </TableCell>
                      <TableCell>
                        {editId === t.id ? (
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            value={editTransaction.method}
                            onChange={(e) =>
                              setEditTransaction({
                                ...editTransaction,
                                method: e.target.value as any,
                              })
                            }
                            size="small"
                          >
                            <option value="Nakit">Nakit</option>
                            <option value="Kredi Kartı">Kredi Kartı</option>
                            <option value="Post">Post</option>
                          </TextField>
                        ) : (
                          t.method
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editId === t.id ? (
                          <>
                            <Button
                              color="success"
                              size="small"
                              onClick={handleUpdate}
                              sx={{ mr: 1 }}
                            >
                              Kaydet
                            </Button>
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => setEditId(null)}
                            >
                              İptal
                            </Button>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => handleEdit(t)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setDeleteId(t.id)}
                              size="small"
                            >
                              <DeleteIcon color="error" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
              <DialogTitle>İşlemi Sil</DialogTitle>
              <DialogContent>
                <Typography>
                  Bu işlemi silmek istediğinize emin misiniz?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteId(null)} color="inherit">
                  İptal
                </Button>
                <Button
                  onClick={() => deleteId && handleDelete(deleteId)}
                  color="error"
                >
                  Sil
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* TOPTANCI */}
        {tabIndex === 1 && (
          <>
            <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
              Toptancı İşlemleri
            </Typography>
            <Grid container spacing={2}>
              <Grid>
                <TextField
                  label="Toptancı Adı"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ürün"
                  value={supplierProduct}
                  onChange={(e) => setSupplierProduct(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Adet"
                  value={supplierQuantity}
                  onChange={(e) => setSupplierQuantity(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Toplam (TL)"
                  value={supplierTotal}
                  onChange={(e) => setSupplierTotal(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Ödenen (TL)"
                  value={supplierPaid}
                  onChange={(e) => setSupplierPaid(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  label="Tarih"
                  type="date"
                  value={supplierDate}
                  onChange={(e) => setSupplierDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleSupplier}
                  sx={{ height: "100%" }}
                  disabled={
                    !supplierName ||
                    !supplierProduct ||
                    !supplierQuantity ||
                    !supplierTotal ||
                    !supplierPaid
                  }
                >
                  Kaydet
                </Button>
              </Grid>
            </Grid>

            <Typography variant="h6" mt={4} mb={2}>
              Toptancı Kayıtları
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Toptancı</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Adet</TableCell>
                    <TableCell>Toplam (TL)</TableCell>
                    <TableCell>Ödenen (TL)</TableCell>
                    <TableCell>Kalan (TL)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.supplierName}</TableCell>
                      <TableCell>{p.productName}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.total.toFixed(2)}</TableCell>
                      <TableCell>{p.paid.toFixed(2)}</TableCell>
                      <TableCell>{(p.total - p.paid).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default TrackingPage;
