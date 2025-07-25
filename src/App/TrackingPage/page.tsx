import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  useAuth,
  Transaction,
  SupplierTransaction,
} from "src/contexts/UseAuth";
import formDate from "src/components/formDate";

type EditTransactionData = Partial<Omit<Transaction, "id">>;
type EditSupplierTransactionData = Partial<Omit<SupplierTransaction, "id">>;

const TrackingPage = () => {
  const [tab, setTab] = useState(0);
  const {
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getSupplierTransactions,
    updateSupplierTransaction,
    deleteSupplierTransaction,
    addSupplierTransaction,
  } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supplierTransactions, setSupplierTransactions] = useState<
    SupplierTransaction[]
  >([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<
    "transaction" | "supplierTransaction" | null
  >(null);
  const [editData, setEditData] = useState<
    EditTransactionData | EditSupplierTransactionData
  >({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "transaction" | "supplierTransaction" | null
  >(null);

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
    paymentMethod: "Nakit",
  });

  useEffect(() => {
    async function fetchData() {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
      const fetchedSupplierTransactions = await getSupplierTransactions();
      setSupplierTransactions(fetchedSupplierTransactions);
    }
    fetchData();
  }, [getTransactions, getSupplierTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = formDate(t.date);
      if (filterDate) {
        return transactionDate.startsWith(filterDate);
      }
      if (filterMonth) {
        return transactionDate.startsWith(filterMonth);
      }
      return true;
    });
  }, [transactions, filterDate, filterMonth]);

  const filteredSupplierTransactions = useMemo(() => {
    return supplierTransactions.filter((s) => {
      const supplierTransactionDate = formDate(s.date);
      if (filterDate) {
        return supplierTransactionDate.startsWith(filterDate);
      }
      if (filterMonth) {
        return supplierTransactionDate.startsWith(filterMonth);
      }
      return true;
    });
  }, [supplierTransactions, filterDate, filterMonth]);

  const dailySalesTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "Giriş")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const dailyPurchasesTotal = useMemo(() => {
    return filteredTransactions
      .filter(
        (t) =>
          t.type === "Çıkış" && t.description?.toLowerCase().includes("alım")
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const dailyOtherExpensesTotal = useMemo(() => {
    return filteredTransactions
      .filter(
        (t) =>
          t.type === "Çıkış" && !t.description?.toLowerCase().includes("alım")
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const dailyProfit = useMemo(() => {
    return dailySalesTotal - dailyPurchasesTotal - dailyOtherExpensesTotal;
  }, [dailySalesTotal, dailyPurchasesTotal, dailyOtherExpensesTotal]);

  const monthlySalesTotal = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) => formDate(t.date).startsWith(filterMonth))
      .filter((t) => t.type === "Giriş")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyPurchasesTotal = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) => formDate(t.date).startsWith(filterMonth))
      .filter(
        (t) =>
          t.type === "Çıkış" && t.description?.toLowerCase().includes("alım")
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyOtherExpensesTotal = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) => formDate(t.date).startsWith(filterMonth))
      .filter(
        (t) =>
          t.type === "Çıkış" && !t.description?.toLowerCase().includes("alım")
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyProfit = useMemo(() => {
    return (
      monthlySalesTotal - monthlyPurchasesTotal - monthlyOtherExpensesTotal
    );
  }, [monthlySalesTotal, monthlyPurchasesTotal, monthlyOtherExpensesTotal]);

  const supplierTotals = useMemo(() => {
    const total = filteredSupplierTransactions.reduce(
      (sum, p) => sum + p.total,
      0
    );
    const paid = filteredSupplierTransactions.reduce(
      (sum, p) => sum + p.paid,
      0
    );
    return { total, paid, debt: total - paid };
  }, [filteredSupplierTransactions]);

  const handleEdit = (
    type: "transaction" | "supplierTransaction",
    data: any
  ) => {
    setEditType(type);
    setEditId(data.id);
    setEditData({ ...data, date: formDate(data.date) });
  };

  const handleUpdate = async () => {
    if (!editId || !editType) return;

    if (editType === "transaction") {
      await updateTransaction(editId, editData as Omit<Transaction, "id">);
      setTransactions(await getTransactions());
    } else if (editType === "supplierTransaction") {
      await updateSupplierTransaction(
        editId,
        editData as Omit<SupplierTransaction, "id">
      );
      setSupplierTransactions(await getSupplierTransactions());
    }

    setEditId(null);
    setEditType(null);
    setEditData({});
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    if (deleteType === "transaction") {
      await deleteTransaction(deleteId);
      setTransactions(await getTransactions());
    } else if (deleteType === "supplierTransaction") {
      await deleteSupplierTransaction(deleteId);
      setSupplierTransactions(await getSupplierTransactions());
    }

    setDeleteId(null);
    setDeleteType(null);
  };

  const handleAddSupplierTransaction = async () => {
    await addSupplierTransaction(newSupplierTransaction);
    setSupplierTransactions(await getSupplierTransactions());
    setAddSupplierDialogOpen(false);
    setNewSupplierTransaction({
      supplierName: "",
      productName: "",
      quantity: 0,
      total: 0,
      paid: 0,
      date: formDate(Date()),
      paymentMethod: "Nakit",
    });
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1000, borderRadius: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <MoneyIcon sx={{ fontSize: 40, color: "#2196f3", mb: 1 }} />
          <Typography variant="h5" fontWeight={600} mb={2}>
            Kasa ve Finans Takibi
          </Typography>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Kasa ve Finans Takibi" />
          <Tab label="Toptancı İşlemleri" />
        </Tabs>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Gün Filtrele"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterMonth("");
            }}
          />
          <TextField
            label="Ay Filtrele"
            type="month"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterDate("");
            }}
          />
        </Box>

        {tab === 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 4,
                mb: 3,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Typography color="success.main" fontWeight={600}>
                Günlük Satış: {dailySalesTotal.toFixed(2)} TL
              </Typography>
              <Typography color="error.main" fontWeight={600}>
                Günlük Alış: {dailyPurchasesTotal.toFixed(2)} TL
              </Typography>
              <Typography color="primary.main" fontWeight={600}>
                Kâr: {dailyProfit.toFixed(2)} TL
              </Typography>
              <Typography color="warning.main" fontWeight={600}>
                Günlük Diğer Giderler: {dailyOtherExpensesTotal.toFixed(2)} TL
              </Typography>
            </Box>

            {filterMonth && (
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  mb: 3,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  borderTop: "1px solid #eee",
                  pt: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Aylık Özet ({filterMonth})
                </Typography>
                <Typography color="success.main" fontWeight={600}>
                  Aylık Satış: {monthlySalesTotal.toFixed(2)} TL
                </Typography>
                <Typography color="error.main" fontWeight={600}>
                  Aylık Alış: {monthlyPurchasesTotal.toFixed(2)} TL
                </Typography>
                <Typography color="primary.main" fontWeight={600}>
                  Aylık Kâr: {monthlyProfit.toFixed(2)} TL
                </Typography>
                <Typography color="warning.main" fontWeight={600}>
                  Aylık Diğer Giderler: {monthlyOtherExpensesTotal.toFixed(2)}{" "}
                  TL
                </Typography>
              </Box>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tip</TableCell>
                    <TableCell>Açıklama</TableCell>
                    <TableCell align="right">Tutar</TableCell>
                    <TableCell align="center">Tarih</TableCell>
                    <TableCell align="center">Yöntem</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
                      <TableCell align="center">{formDate(r.date)}</TableCell>
                      <TableCell align="center">{r.method}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit("transaction", r)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteType("transaction");
                            setDeleteId(r.id);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tab === 1 && (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddSupplierDialogOpen(true)}
              >
                Yeni Alış Ekle
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Typography color="primary.main" fontWeight={600}>
                Toplam Alış: {supplierTotals.total.toFixed(2)} TL
              </Typography>
              <Typography color="success.main" fontWeight={600}>
                Toplam Ödenen: {supplierTotals.paid.toFixed(2)} TL
              </Typography>
              <Typography color="error.main" fontWeight={600}>
                Kalan Borç: {supplierTotals.debt.toFixed(2)} TL
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Toptancı</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Adet</TableCell>
                    <TableCell align="right">Tutar (TL)</TableCell>
                    <TableCell align="right">Ödenen (TL)</TableCell>
                    <TableCell align="right">Kalan (TL)</TableCell>
                    <TableCell align="center">Ödeme Yöntemi</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSupplierTransactions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formDate(r.date)}</TableCell>
                      <TableCell>{r.supplierName}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                      <TableCell align="right">{r.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {(r.total - r.paid).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {r.paymentMethod || "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit("supplierTransaction", r)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteType("supplierTransaction");
                            setDeleteId(r.id);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Dialog
          open={!!editId}
          onClose={() => {
            setEditId(null);
            setEditType(null);
            setEditData({});
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editType === "transaction"
              ? "İşlem Kaydını Düzenle"
              : "Toptancı İşlemi Kaydını Düzenle"}
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            {editType === "transaction" ? (
              <>
                <FormControl fullWidth>
                  <InputLabel>Tip</InputLabel>
                  <Select
                    label="Tip"
                    value={(editData as EditTransactionData).type || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        type: e.target.value as "Giriş" | "Çıkış",
                      })
                    }
                  >
                    <MenuItem value="Giriş">Giriş</MenuItem>
                    <MenuItem value="Çıkış">Çıkış</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Açıklama"
                  value={(editData as EditTransactionData).description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />
                <TextField
                  label="Tutar"
                  type="number"
                  value={(editData as EditTransactionData).amount ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, amount: Number(e.target.value) })
                  }
                />
                <TextField
                  label="Tarih"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={(editData as EditTransactionData).date || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Yöntem</InputLabel>
                  <Select
                    label="Yöntem"
                    value={(editData as EditTransactionData).method || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        method: e.target.value as
                          | "Nakit"
                          | "Kredi Kartı"
                          | "Post",
                      })
                    }
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                    <MenuItem value="Post">Post</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : (
              <>
                <TextField
                  label="Toptancı"
                  value={
                    (editData as EditSupplierTransactionData).supplierName || ""
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, supplierName: e.target.value })
                  }
                />
                <TextField
                  label="Ürün"
                  value={
                    (editData as EditSupplierTransactionData).productName || ""
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, productName: e.target.value })
                  }
                />
                <TextField
                  label="Adet"
                  type="number"
                  value={
                    (editData as EditSupplierTransactionData).quantity ?? ""
                  }
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
                <TextField
                  label="Tutar"
                  type="number"
                  value={(editData as EditSupplierTransactionData).total ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, total: Number(e.target.value) })
                  }
                />
                <TextField
                  label="Ödenen"
                  type="number"
                  value={(editData as EditSupplierTransactionData).paid ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, paid: Number(e.target.value) })
                  }
                />
                <TextField
                  label="Tarih"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={(editData as EditSupplierTransactionData).date || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Ödeme Yöntemi</InputLabel>
                  <Select
                    label="Ödeme Yöntemi"
                    value={
                      (editData as EditSupplierTransactionData).paymentMethod ||
                      ""
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        paymentMethod: e.target.value as
                          | "Nakit"
                          | "IBAN"
                          | "Post",
                      })
                    }
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="IBAN">IBAN</MenuItem>
                    <MenuItem value="Post">Post</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setEditId(null);
                setEditType(null);
                setEditData({});
              }}
            >
              İptal
            </Button>
            <Button variant="contained" onClick={handleUpdate}>
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!deleteId}
          onClose={() => {
            setDeleteId(null);
            setDeleteType(null);
          }}
        >
          <DialogTitle>Kayıt Sil</DialogTitle>
          <DialogContent>
            <Typography>Bu kaydı silmek istediğinize emin misiniz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setDeleteId(null);
                setDeleteType(null);
              }}
            >
              İptal
            </Button>
            <Button color="error" onClick={handleDelete}>
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
            <TextField
              label="Ürün Adı"
              value={newSupplierTransaction.productName}
              onChange={(e) =>
                setNewSupplierTransaction({
                  ...newSupplierTransaction,
                  productName: e.target.value,
                })
              }
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
            <FormControl fullWidth>
              <InputLabel>Ödeme Yöntemi</InputLabel>
              <Select
                label="Ödeme Yöntemi"
                value={newSupplierTransaction.paymentMethod}
                onChange={(e) =>
                  setNewSupplierTransaction({
                    ...newSupplierTransaction,
                    paymentMethod: e.target.value as "Nakit" | "IBAN" | "Post",
                  })
                }
              >
                <MenuItem value="Nakit">Nakit</MenuItem>
                <MenuItem value="IBAN">IBAN</MenuItem>
                <MenuItem value="Post">Post</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddSupplierDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="contained" onClick={handleAddSupplierTransaction}>
              Ekle
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default TrackingPage;
