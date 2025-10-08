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
import {
  useAuth,
  Transaction,
  SupplierTransaction,
  CurrencyTransaction,
} from "src/contexts/UseAuth";
import formDate from "src/components/formDate";

type EditTransactionData = Partial<Omit<Transaction, "id">>;
type EditSupplierTransactionData = Partial<Omit<SupplierTransaction, "id">>;
type EditCurrencyTransactionData = Partial<Omit<CurrencyTransaction, "id">>;

const TrackingPage = () => {
  const [tab, setTab] = useState(0);
  const {
    getTransactions,
    updateTransaction,
    deleteTransaction,
    getSupplierTransactions,
    updateSupplierTransaction,
    deleteSupplierTransaction,
    getCurrencyTransactions,
    updateCurrencyTransaction,
    deleteCurrencyTransaction,
  } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [supplierTransactions, setSupplierTransactions] = useState<
    SupplierTransaction[]
  >([]);
  const [currencyTransactions, setCurrencyTransactions] = useState<
    CurrencyTransaction[]
  >([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<
    "transaction" | "supplierTransaction" | "currencyTransaction" | null
  >(null);
  const [editData, setEditData] = useState<
    | EditTransactionData
    | EditSupplierTransactionData
    | EditCurrencyTransactionData
  >({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "transaction" | "supplierTransaction" | "currencyTransaction" | null
  >(null);

  useEffect(() => {
    async function fetchData() {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
      const fetchedSupplierTransactions = await getSupplierTransactions();
      setSupplierTransactions(fetchedSupplierTransactions);
      const fetchedCurrencyTransactions = await getCurrencyTransactions();
      setCurrencyTransactions(fetchedCurrencyTransactions);

      console.log("--- Firebase'den Çekilen Veriler ---");
      console.log("Transactions (Kasa İşlemleri):", fetchedTransactions);
      console.log(
        "Supplier Transactions (Toptancı İşlemleri):",
        fetchedSupplierTransactions
      );
      console.log(
        "Currency Transactions (Döviz İşlemleri):",
        fetchedCurrencyTransactions
      );
      console.log("-------------------------------------");
    }
    fetchData();
  }, [getTransactions, getSupplierTransactions, getCurrencyTransactions]);

  const safeFormDate = (date: string | undefined): string => {
    return date ? formDate(date) : "";
  };

  const filteredTransactions = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filterValue = filterDate || filterMonth;

    return transactions.filter((t) => {
      const transactionDate = safeFormDate(t.date);

      let matchesDateOrMonth = true;

      if (filterValue) {
        if (filterDate) {
          matchesDateOrMonth = transactionDate === filterValue;
        } else if (filterMonth) {
          matchesDateOrMonth = transactionDate.startsWith(filterValue);
        }
      }

      const matchesSearch =
        t.description.toLowerCase().includes(lowerCaseQuery) ||
        t.type.toLowerCase().includes(lowerCaseQuery) ||
        t.amount.toString().includes(lowerCaseQuery) ||
        t.method.toLowerCase().includes(lowerCaseQuery);

      return matchesDateOrMonth && matchesSearch;
    });
  }, [transactions, filterDate, filterMonth, searchQuery]);

  const filteredSupplierTransactions = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filterValue = filterDate || filterMonth;

    return supplierTransactions.filter((s) => {
      const transactionDate = safeFormDate(s.date);

      let matchesDateOrMonth = true;

      if (filterValue) {
        if (filterDate) {
          matchesDateOrMonth = transactionDate === filterValue;
        } else if (filterMonth) {
          matchesDateOrMonth = transactionDate.startsWith(filterValue);
        }
      }

      const matchesSearch =
        s.supplierName.toLowerCase().includes(lowerCaseQuery) ||
        s.productName.toLowerCase().includes(lowerCaseQuery) ||
        s.quantity.toString().includes(lowerCaseQuery) ||
        s.total.toString().includes(lowerCaseQuery) ||
        s.paid.toString().includes(lowerCaseQuery) ||
        (s.paymentMethod &&
          s.paymentMethod.toLowerCase().includes(lowerCaseQuery));

      return matchesDateOrMonth && matchesSearch;
    });
  }, [supplierTransactions, filterDate, filterMonth, searchQuery]);

  const filteredCurrencyTransactions = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filterValue = filterDate || filterMonth;

    return currencyTransactions.filter((c) => {
      const transactionDate = safeFormDate(c.date);

      let matchesDateOrMonth = true;

      if (filterValue) {
        if (filterDate) {
          matchesDateOrMonth = transactionDate === filterValue;
        } else if (filterMonth) {
          matchesDateOrMonth = transactionDate.startsWith(filterValue);
        }
      }

      const matchesSearch =
        c.name.toLowerCase().includes(lowerCaseQuery) ||
        c.tc.toLowerCase().includes(lowerCaseQuery) ||
        c.type.toLowerCase().includes(lowerCaseQuery) ||
        c.amount.toString().includes(lowerCaseQuery) ||
        c.rate.toString().includes(lowerCaseQuery) ||
        c.total.toString().includes(lowerCaseQuery);

      return matchesDateOrMonth && matchesSearch;
    });
  }, [currencyTransactions, filterDate, filterMonth, searchQuery]);

  const dailySalesTotal = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "Satış")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const dailyTotalExpensesForCashTracking = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === "Alış")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const dailyProfit = useMemo(() => {
    return dailySalesTotal - dailyTotalExpensesForCashTracking;
  }, [dailySalesTotal, dailyTotalExpensesForCashTracking]);

  const monthlySalesTotal = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) => safeFormDate(t.date).startsWith(filterMonth))
      .filter((t) => t.type === "Satış")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyTotalExpensesForCashTracking = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) => safeFormDate(t.date).startsWith(filterMonth))
      .filter((t) => t.type === "Alış")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyProfit = useMemo(() => {
    return monthlySalesTotal - monthlyTotalExpensesForCashTracking;
  }, [monthlySalesTotal, monthlyTotalExpensesForCashTracking]);

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

  const currencyTotals = useMemo(() => {
    const totalAmount = filteredCurrencyTransactions.reduce(
      (sum, c) => sum + c.amount,
      0
    );
    const totalTL = filteredCurrencyTransactions.reduce(
      (sum, c) => sum + c.total,
      0
    );
    return { totalAmount, totalTL };
  }, [filteredCurrencyTransactions]);

  const handleEdit = (
    type: "transaction" | "supplierTransaction" | "currencyTransaction",
    data: any
  ) => {
    setEditType(type);
    setEditId(data.id);
    setEditData({ ...data, date: data.date ? formDate(data.date) : "" });
  };

  const handleUpdate = async () => {
    if (!editId || !editType) return;

    try {
      if (editType === "transaction") {
        await updateTransaction(editId, editData as Omit<Transaction, "id">);
        setTransactions(await getTransactions());
      } else if (editType === "supplierTransaction") {
        await updateSupplierTransaction(
          editId,
          editData as Omit<SupplierTransaction, "id">
        );
        setSupplierTransactions(await getSupplierTransactions());
      } else if (editType === "currencyTransaction") {
        await updateCurrencyTransaction(
          editId,
          editData as Omit<CurrencyTransaction, "id">
        );
        setCurrencyTransactions(await getCurrencyTransactions());
      }
      alert("Kayıt başarıyla güncellendi!");
    } catch (error) {
      console.error("Kayıt güncellenirken hata:", error);
    } finally {
      setEditId(null);
      setEditType(null);
      setEditData({});
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "transaction") {
        await deleteTransaction(deleteId);
        setTransactions(await getTransactions());
      } else if (deleteType === "supplierTransaction") {
        await deleteSupplierTransaction(deleteId);
        setSupplierTransactions(await getSupplierTransactions());
      } else if (deleteType === "currencyTransaction") {
        await deleteCurrencyTransaction(deleteId);
        setCurrencyTransactions(await getCurrencyTransactions());
      }
      alert("Kayıt başarıyla silindi!");
    } catch (error) {
      console.error("Kayıt silinirken hata:", error);
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
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
          <Tab label="Döviz İşlemleri" />
        </Tabs>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Gün Filtrele"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              if (e.target.value) {
                setFilterMonth("");
              }
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
              if (e.target.value) {
                setFilterDate("");
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Ara..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 1 }}
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
                Günlük Toplam Gider:{" "}
                {dailyTotalExpensesForCashTracking.toFixed(2)} TL
              </Typography>
              <Typography color="primary.main" fontWeight={600}>
                Günlük Kâr/Zarar: {dailyProfit.toFixed(2)} TL
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
                  Aylık Toplam Gider:{" "}
                  {monthlyTotalExpensesForCashTracking.toFixed(2)} TL
                </Typography>
                <Typography color="primary.main" fontWeight={600}>
                  Aylık Kâr/Zarar: {monthlyProfit.toFixed(2)} TL
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
                      <TableCell align="center">
                        {safeFormDate(r.date)}
                      </TableCell>
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
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSupplierTransactions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{safeFormDate(r.date)}</TableCell>
                      <TableCell>{r.supplierName}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                      <TableCell align="right">{r.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {(r.total - r.paid).toFixed(2)}
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
        {tab === 2 && (
          <>
            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Typography color="primary.main" fontWeight={600}>
                Toplam Döviz Miktarı: {currencyTotals.totalAmount.toFixed(2)}
              </Typography>
              <Typography color="success.main" fontWeight={600}>
                Toplam TL Karşılığı: {currencyTotals.totalTL.toFixed(2)} TL
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Adı</TableCell>
                    <TableCell>TC</TableCell>
                    <TableCell>Döviz Tipi</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell align="right">Kur</TableCell>
                    <TableCell align="right">Toplam TL</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCurrencyTransactions.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{safeFormDate(r.date)}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.tc}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
                      <TableCell align="right">{r.rate.toFixed(4)}</TableCell>
                      <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit("currencyTransaction", r)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteType("currencyTransaction");
                            setDeleteId(r.id as string);
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
              : editType === "supplierTransaction"
              ? "Toptancı İşlemi Kaydını Düzenle"
              : "Döviz İşlemi Kaydını Düzenle"}{" "}
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
                        type: e.target.value as "Satış" | "Alış",
                      })
                    }
                  >
                    <MenuItem value="Alış">Alış</MenuItem>
                    <MenuItem value="Satış">Satış</MenuItem>
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
                          | "Pos",
                      })
                    }
                  >
                    <MenuItem value="Nakit">Nakit</MenuItem>
                    <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                    <MenuItem value="Pos">Pos</MenuItem>
                  </Select>
                </FormControl>
              </>
            ) : editType === "supplierTransaction" ? (
              <>
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
              </>
            ) : (
              <>
                <TextField
                  label="Adı"
                  value={(editData as EditCurrencyTransactionData).name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
                <TextField
                  label="TC"
                  value={(editData as EditCurrencyTransactionData).tc || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, tc: e.target.value })
                  }
                />
                <TextField
                  label="Miktar"
                  type="number"
                  value={(editData as EditCurrencyTransactionData).amount ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, amount: Number(e.target.value) })
                  }
                />
                <TextField
                  label="Kur"
                  type="number"
                  value={(editData as EditCurrencyTransactionData).rate ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, rate: Number(e.target.value) })
                  }
                />
                <TextField
                  label="Tip"
                  value={(editData as EditCurrencyTransactionData).type || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, type: e.target.value })
                  }
                />
                <TextField
                  label="Tarih"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={(editData as EditCurrencyTransactionData).date || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                />
                <TextField
                  label="Toplam TL"
                  type="number"
                  value={(editData as EditCurrencyTransactionData).total ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, total: Number(e.target.value) })
                  }
                />
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
      </Paper>
    </Box>
  );
};

export default TrackingPage;
