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
import { Timestamp } from "firebase/firestore";

type EditTransactionData = Partial<Omit<Transaction, "id">>;
type EditSupplierTransactionData = Partial<Omit<SupplierTransaction, "id">>;
type EditCurrencyTransactionData = Partial<Omit<CurrencyTransaction, "id">>;

type DailyCashRecord = {
  id: string;
  date: string;
  initialCash: number;
  finalCash: number;
  totalMovement: number;
};

const CriticalConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Onayla",
  isDestructive = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          İptal
        </Button>
        <Button
          onClick={onConfirm}
          color={isDestructive ? "error" : "primary"}
          variant="contained"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  type,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "transaction" | "supplierTransaction" | "currencyTransaction" | null;
}) => {
  const typeMap = {
    transaction: "Kasa/Finans İşlemi",
    supplierTransaction: "Toptancı İşlemi",
    currencyTransaction: "Döviz İşlemi",
  };
  const title = type ? typeMap[type] : "Kayıt";

  return (
    <CriticalConfirmationDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Kayıt Silme Onayı"
      message={`**${title}** türündeki bu kaydı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      confirmText="Sil"
      isDestructive={true}
    />
  );
};

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

  const [endDayConfirmOpen, setEndDayConfirmOpen] = useState(false);
  const [dailyCashRecordToDeleteId, setDailyCashRecordToDeleteId] = useState<
    string | null
  >(null);

  const [initialCash, setInitialCash] = useState(0);
  const [newInitialCash, setNewInitialCash] = useState<number | string>("");
  const [dailyCashRecords, setDailyCashRecords] = useState<DailyCashRecord[]>(
    []
  );
  const [endDayModalOpen, setEndDayModalOpen] = useState(false);
  const [endDaySummary, setEndDaySummary] = useState({
    date: "",
    finalCash: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
      const fetchedSupplierTransactions = await getSupplierTransactions();
      setSupplierTransactions(fetchedSupplierTransactions);
      const fetchedCurrencyTransactions = await getCurrencyTransactions();
      setCurrencyTransactions(fetchedCurrencyTransactions);
    }
    fetchData();

    const savedInitialCash = localStorage.getItem("initialCashBalance");
    if (savedInitialCash) {
      setInitialCash(Number(savedInitialCash));
    }

    const savedRecords = localStorage.getItem("dailyCashRecords");
    if (savedRecords) {
      setDailyCashRecords(JSON.parse(savedRecords));
    }
  }, [getTransactions, getSupplierTransactions, getCurrencyTransactions]);

  const safeFormDate = (date: string | Timestamp | undefined): string => {
    return formDate(date);
  };

  const isEditable = (date: string | Timestamp | undefined): boolean => {
    if (!date) return false;

    const recordDateString = safeFormDate(date);
    const recordDateTime = new Date(recordDateString).getTime();

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    return recordDateTime >= todayStart;
  };

  const handleSaveInitialCash = () => {
    const cashAmount = Number(newInitialCash);
    if (!isNaN(cashAmount)) {
      setInitialCash(cashAmount);
      localStorage.setItem("initialCashBalance", cashAmount.toString());
      setNewInitialCash("");
    } else {
      alert("Lütfen geçerli bir tutar girin.");
    }
  };

  const filteredTransactions = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filterValue = filterDate || filterMonth;

    return transactions.filter((t) => {
      const transactionDate = safeFormDate(
        t.date as string | Timestamp | undefined
      );

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
      const transactionDate = safeFormDate(
        s.date as string | Timestamp | undefined
      );

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
      const transactionDate = safeFormDate(
        c.date as string | Timestamp | undefined
      );

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

  const filteredDailyCashRecords = useMemo(() => {
    const filterValue = filterDate || filterMonth;
    if (!filterValue) {
      return dailyCashRecords;
    }

    return dailyCashRecords.filter((r) => {
      if (filterDate) {
        return r.date === filterDate;
      } else if (filterMonth) {
        return r.date.startsWith(filterMonth);
      }
      return true;
    });
  }, [dailyCashRecords, filterDate, filterMonth]);

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
      .filter((t) =>
        safeFormDate(t.date as string | Timestamp | undefined).startsWith(
          filterMonth
        )
      )
      .filter((t) => t.type === "Satış")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, filterMonth]);

  const monthlyTotalExpensesForCashTracking = useMemo(() => {
    if (!filterMonth) return 0;
    return transactions
      .filter((t) =>
        safeFormDate(t.date as string | Timestamp | undefined).startsWith(
          filterMonth
        )
      )
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

  const cashFlowTotals = useMemo(() => {
    const transactionsCashTotal = filteredTransactions.reduce((sum, t) => {
      if (t.method === "Nakit") {
        if (t.type === "Satış") {
          return sum + t.amount;
        } else if (t.type === "Alış") {
          return sum - t.amount;
        }
      }
      return sum;
    }, 0);

    const supplierCashTotal = filteredSupplierTransactions.reduce((sum, s) => {
      if (s.paymentMethod === "Nakit") {
        return sum - s.paid;
      }
      return sum;
    }, 0);

    const currencyCashTotal = filteredCurrencyTransactions.reduce((sum, c) => {
      if (c.type === "Alış") {
        return sum - c.total;
      } else if (c.type === "Satış") {
        return sum + c.total;
      }
      return sum;
    }, 0);

    const totalCashMovement =
      transactionsCashTotal + supplierCashTotal + currencyCashTotal;
    const finalCashBalance = initialCash + totalCashMovement;

    return {
      totalCashMovement,
      finalCashBalance,
    };
  }, [
    filteredTransactions,
    filteredSupplierTransactions,
    filteredCurrencyTransactions,
    initialCash,
  ]);

  const handleEdit = (
    type: "transaction" | "supplierTransaction" | "currencyTransaction",
    data: any
  ) => {
    setEditType(type);
    setEditId(data.id);
    setEditData({ ...data, date: formDate(data.date) });
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

  const handleEndDayInitiate = () => {
    setEndDayConfirmOpen(true);
  };

  const handleEndDay = () => {
    setEndDayConfirmOpen(false);

    const today = new Date().toISOString().split("T")[0];

    const alreadyRecorded = dailyCashRecords.some((r) => r.date === today);

    if (alreadyRecorded) {
      const confirmOverwrite = window.confirm(
        "Bu gün için zaten bir kapanış kaydı yapılmış. Önceki kayıt silinip yeni kayıt yapılacaktır. Onaylıyor musunuz?"
      );
      if (!confirmOverwrite) {
        return;
      }
    }

    const newRecord: DailyCashRecord = {
      id: Date.now().toString(),
      date: today,
      initialCash: initialCash,
      finalCash: cashFlowTotals.finalCashBalance,
      totalMovement: cashFlowTotals.totalCashMovement,
    };

    let updatedRecords: DailyCashRecord[];
    if (alreadyRecorded) {
      updatedRecords = dailyCashRecords.filter((r) => r.date !== today);
      updatedRecords.push(newRecord);
    } else {
      updatedRecords = [...dailyCashRecords, newRecord];
    }

    setDailyCashRecords(updatedRecords);
    localStorage.setItem("dailyCashRecords", JSON.stringify(updatedRecords));

    setInitialCash(newRecord.finalCash);
    localStorage.setItem("initialCashBalance", newRecord.finalCash.toString());

    setEndDaySummary({ date: today, finalCash: newRecord.finalCash });
    setEndDayModalOpen(true);

    setFilterDate("");
    setFilterMonth("");
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
    } catch (error) {
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setDeleteType(null);
  };

  const handleDailyCashRecordDeleteInitiate = (id: string) => {
    setDailyCashRecordToDeleteId(id);
  };

  const handleDeleteDailyCashRecord = () => {
    if (!dailyCashRecordToDeleteId) return;

    const id = dailyCashRecordToDeleteId;

    const updatedRecords = dailyCashRecords.filter((r) => r.id !== id);
    setDailyCashRecords(updatedRecords);
    localStorage.setItem("dailyCashRecords", JSON.stringify(updatedRecords));

    setDailyCashRecordToDeleteId(null);

    if (
      updatedRecords.length > 0 &&
      id ===
        dailyCashRecords.reduce((a, b) =>
          new Date(a.date) > new Date(b.date) ? a : b
        ).id
    ) {
      console.warn("Sistemdeki initialCash manuel olarak düzeltilmeli.");
    } else if (updatedRecords.length === 0) {
      setInitialCash(0);
      localStorage.setItem("initialCashBalance", "0");
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
          <Tab label="Kasa" />
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
                        {safeFormDate(r.date as string | Timestamp | undefined)}
                      </TableCell>
                      <TableCell align="center">{r.method}</TableCell>
                      <TableCell align="center">
                        {isEditable(
                          r.date as string | Timestamp | undefined
                        ) && (
                          <>
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
                          </>
                        )}
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
                      <TableCell>
                        {safeFormDate(r.date as string | Timestamp | undefined)}
                      </TableCell>
                      <TableCell>{r.supplierName}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                      <TableCell align="right">{r.paid.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {(r.total - r.paid).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {isEditable(
                          r.date as string | Timestamp | undefined
                        ) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEdit("supplierTransaction", r)
                              }
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
                          </>
                        )}
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
                      <TableCell>
                        {safeFormDate(r.date as string | Timestamp | undefined)}
                      </TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.tc}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell align="right">{r.amount.toFixed(2)}</TableCell>
                      <TableCell align="right">{r.rate.toFixed(4)}</TableCell>
                      <TableCell align="right">{r.total.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        {isEditable(
                          r.date as string | Timestamp | undefined
                        ) && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEdit("currencyTransaction", r)
                              }
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
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kasa Nakit Takibi
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: "#f5f5f5" }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Gün Başı Nakit Girişi 💰
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  label="Gün Başı Nakit Tutar (TL)"
                  type="number"
                  fullWidth
                  value={newInitialCash}
                  onChange={(e) => setNewInitialCash(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  onClick={handleSaveInitialCash}
                  sx={{ minWidth: 150, height: 56 }}
                >
                  Kaydet
                </Button>
              </Box>
              <Typography
                variant="body1"
                mt={2}
                fontWeight={700}
                color="primary.main"
              >
                Mevcut Gün Başı Bakiyesi: {initialCash.toFixed(2)} TL
              </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: "#e8f5e9" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Günlük Nakit Akış Özeti
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleEndDayInitiate}
                >
                  GÜNÜ BİTİR ve KASAYI KAPAT
                </Button>
              </Box>

              <Typography variant="body1" color="primary.main" fontWeight={700}>
                Gün Başı Nakit: {initialCash.toFixed(2)} TL
              </Typography>
              <Typography variant="body1" color="success.main" fontWeight={700}>
                Gün İçi Toplam Nakit Hareketi:{" "}
                {cashFlowTotals.totalCashMovement.toFixed(2)} TL
              </Typography>
              <Typography
                variant="h5"
                mt={2}
                fontWeight={700}
                color={
                  cashFlowTotals.finalCashBalance >= 0
                    ? "success.dark"
                    : "error.dark"
                }
              >
                Gün Sonu Nakit Bakiyesi:{" "}
                {cashFlowTotals.finalCashBalance.toFixed(2)} TL
              </Typography>

              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #ddd" }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Nakit Giriş/Çıkış Özeti (Sadece İşlem Sekmesinden)
                </Typography>
                <Typography color="success.main">
                  Nakit Giren (Satış): +{dailySalesTotal.toFixed(2)} TL
                </Typography>
                <Typography color="error.main">
                  Nakit Çıkan (Alış/Gider): -
                  {dailyTotalExpensesForCashTracking.toFixed(2)} TL
                </Typography>
                <Typography variant="caption" display="block">
                  *Toptancı ve Döviz hareketleri de üstteki 'Toplam Nakit
                  Hareketi'ne dahildir.
                </Typography>
              </Box>
            </Paper>

            <Typography variant="h6" mt={4} mb={2}>
              Geçmiş Kasa Kapanışları
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="right">Gün Başı</TableCell>
                    <TableCell align="right">Nakit Hareketi</TableCell>
                    <TableCell align="right">Gün Sonu</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDailyCashRecords
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell align="right">
                          {r.initialCash.toFixed(2)} TL
                        </TableCell>
                        <TableCell align="right">
                          {r.totalMovement.toFixed(2)} TL
                        </TableCell>
                        <TableCell align="right">
                          {r.finalCash.toFixed(2)} TL
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() =>
                              alert(
                                `Kasa kaydı (${r.date}) için düzenleme karmaşık bir hesaplama gerektirir ve şu an desteklenmemektedir.`
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDailyCashRecordDeleteInitiate(r.id)
                            }
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <DeleteConfirmationDialog
        open={!!deleteId && !!deleteType}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        type={deleteType}
      />

      <CriticalConfirmationDialog
        open={endDayConfirmOpen}
        onClose={() => setEndDayConfirmOpen(false)}
        onConfirm={handleEndDay}
        title="Günü Kapatma Onayı"
        message={`Gün sonu kasasını kapatmak üzeresiniz. Gün Sonu Bakiyesi ${cashFlowTotals.finalCashBalance.toFixed(
          2
        )} TL olarak kaydedilecek ve bir sonraki günün başlangıç bakiyesi olacaktır. Onaylıyor musunuz?`}
        confirmText="Kapat ve Kaydet"
      />

      <CriticalConfirmationDialog
        open={!!dailyCashRecordToDeleteId}
        onClose={() => setDailyCashRecordToDeleteId(null)}
        onConfirm={handleDeleteDailyCashRecord}
        title="Kasa Kapanış Kaydı Silme"
        message="Bu kasa kapanış kaydını silmek, bir sonraki günün günbaşı bakiyesini etkileyebilir ve manuel düzeltme gerektirebilir. Silmek istediğinizden emin misiniz?"
        confirmText="Kayıdı Sil"
        isDestructive={true}
      />

      <Dialog open={!!editId}>
        <DialogTitle>Kayıt Düzenle</DialogTitle>
        <DialogContent>
          <Typography>Düzenleme formu burada olmalı.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditId(null)}>İptal</Button>
          <Button onClick={handleUpdate} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={endDayModalOpen} onClose={() => setEndDayModalOpen(false)}>
        <DialogTitle>Kasa Kapanışı Başarılı 🎉</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            **{endDaySummary.date}** tarihi için kasa kapanışı yapıldı.
          </Typography>
          <Typography variant="h6" color="success.dark" fontWeight={700}>
            Gün Sonu Nakit Bakiyesi: {endDaySummary.finalCash.toFixed(2)} TL
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Bu tutar, bir sonraki günün **Gün Başı Nakit Bakiyesi** olarak
            ayarlandı.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndDayModalOpen(false)}>Tamam</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackingPage;
