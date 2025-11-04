import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Grid as MuiGrid,
  Stack,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  useAuth,
  SupplierTransaction,
  CurrencyTransaction,
  DailyCashRecord,
} from "src/contexts/UseAuth";
import formDate from "src/components/formDate";
import { Timestamp } from "firebase/firestore";

type EditSupplierTransactionData = Partial<Omit<SupplierTransaction, "id">>;
type EditCurrencyTransactionData = Partial<Omit<CurrencyTransaction, "id">>;

const formatCurrency = (n: number) =>
  n.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " TL";

const smallDate = (d?: string | Timestamp) => {
  const s = formDate(d);
  if (!s) return "";
  return s;
};

const StatCard = ({
  title,
  value,
  color = "primary",
  icon,
}: {
  title: string;
  value: string;
  color?: "primary" | "success" | "error" | "warning" | "info";
  icon?: React.ReactNode;
}) => (
  <Card elevation={2} sx={{ p: 2, minWidth: 200 }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          mr: 2,
          width: 48,
          height: 48,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor:
            color === "success"
              ? "success.light"
              : color === "error"
              ? "error.light"
              : color === "warning"
              ? "warning.light"
              : color === "info"
              ? "info.light"
              : "primary.light",
          color: `${color}.dark`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Card>
);

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
        <Button onClick={onClose} color="inherit">
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
  type: "supplierTransaction" | "currencyTransaction" | null;
}) => {
  const typeMap = {
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
      message={`${title} türündeki bu kaydı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      confirmText="Sil"
      isDestructive={true}
    />
  );
};

const TrackingPage = () => {
  const Grid: any = MuiGrid;

  const [tab, setTab] = useState(0);
  const {
    getSupplierTransactions,
    updateSupplierTransaction,
    deleteSupplierTransaction,
    getCurrencyTransactions,
    updateCurrencyTransaction,
    deleteCurrencyTransaction,
    getInitialCash,
    setInitialCash,
    getDailyCashRecords,
    addOrUpdateDailyCashRecord,
    deleteDailyCashRecord,
    getCashBalance,
    updateCashBalance,
    addToCashBalance,
    subtractFromCashBalance,
  } = useAuth();

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
    "supplierTransaction" | "currencyTransaction" | null
  >(null);
  const [editData, setEditData] = useState<
    EditSupplierTransactionData | EditCurrencyTransactionData
  >({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "supplierTransaction" | "currencyTransaction" | null
  >(null);
  const [endDayConfirmOpen, setEndDayConfirmOpen] = useState(false);
  const [dailyCashRecordToDeleteId, setDailyCashRecordToDeleteId] = useState<
    string | null
  >(null);
  const [initialCash, setInitialCashState] = useState(0);
  const [newInitialCash, setNewInitialCash] = useState<number | string>("");
  const [dailyCashRecords, setDailyCashRecords] = useState<DailyCashRecord[]>(
    []
  );
  const [endDayModalOpen, setEndDayModalOpen] = useState(false);
  const [endDaySummary, setEndDaySummary] = useState({
    date: "",
    finalCash: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cashBalance, setCashBalanceState] = useState(0);
  const [manualCashAmount, setManualCashAmount] = useState<number | string>("");
  const [manualCashDescription, setManualCashDescription] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [
          fetchedSupplierTransactions,
          fetchedCurrencyTransactions,
          ic,
          currentBalance,
          records,
        ] = await Promise.all([
          getSupplierTransactions(),
          getCurrencyTransactions(),
          getInitialCash(),
          getCashBalance(),
          getDailyCashRecords(),
        ]);

        if (!mounted) return;

        setSupplierTransactions(fetchedSupplierTransactions);
        setCurrencyTransactions(fetchedCurrencyTransactions);
        setInitialCashState(ic);
        setCashBalanceState(currentBalance);
        setDailyCashRecords(records || []);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      mounted = false;
    };
  }, [
    getSupplierTransactions,
    getCurrencyTransactions,
    getInitialCash,
    getDailyCashRecords,
    getCashBalance,
  ]);

  const updateCash = async (
    amount: number,
    type: "add" | "subtract",
    description: string
  ) => {
    try {
      if (type === "add") {
        await addToCashBalance(amount, description);
      } else {
        await subtractFromCashBalance(amount, description);
      }

      const currentBalance = await getCashBalance();
      setCashBalanceState(currentBalance);
    } catch (error) {
      console.error("Kasa güncelleme hatası:", error);
      alert("Kasa güncellenirken hata oluştu.");
    }
  };

  const handleManualCashAction = async (action: "add" | "subtract") => {
    const amount = Number(manualCashAmount);
    if (!amount || amount <= 0) {
      alert("Lütfen geçerli bir tutar girin.");
      return;
    }

    if (!manualCashDescription.trim()) {
      alert("Lütfen bir açıklama girin.");
      return;
    }

    try {
      await updateCash(amount, action, manualCashDescription);
      setManualCashAmount("");
      setManualCashDescription("");
    } catch (error) {
      console.error("Manuel kasa işlemi hatası:", error);
    }
  };

  const refreshBalance = async () => {
    try {
      const currentBalance = await getCashBalance();
      setCashBalanceState(currentBalance);
    } catch (error) {
      console.error("Bakiye yenileme hatası:", error);
    }
  };

  const safeFormDate = useCallback(
    (date: string | Timestamp | undefined): string => {
      if (!date) return "";

      try {
        if ((date as any)?.toDate instanceof Function) {
          const d = (date as any).toDate() as Date;
          return d.toISOString().split("T")[0];
        }

        if (typeof date === "string") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }

          const ddMMyyyyMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (ddMMyyyyMatch) {
            const [, day, month, year] = ddMMyyyyMatch;
            return `${year}-${month}-${day}`;
          }

          const parsed = new Date(date);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split("T")[0];
          }
        }

        return formDate(date) || "";
      } catch (error) {
        console.error("Tarih formatlama hatası:", error, date);
        return "";
      }
    },
    []
  );

  const formatDateToYYYYMM = useCallback(
    (date: string | Timestamp | undefined): string => {
      const fullDate = safeFormDate(date);
      return fullDate.substring(0, 7);
    },
    [safeFormDate]
  );

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

  const handleSaveInitialCash = async () => {
    const cashAmount = Number(newInitialCash);
    if (!isNaN(cashAmount)) {
      try {
        await setInitialCash(cashAmount);
        setInitialCashState(cashAmount);
        await updateCashBalance(cashAmount, "Gün başı nakit girişi");
        setCashBalanceState(cashAmount);
        setNewInitialCash("");
      } catch (err) {
        console.error("initial cash kaydedilemedi:", err);
        alert("Gün başı bakiyesi kaydedilirken hata oluştu.");
      }
    } else {
      alert("Lütfen geçerli bir tutar girin.");
    }
  };

  const filteredSupplierTransactions = useMemo(() => {
    let filtered = [...supplierTransactions];

    if (filterDate) {
      filtered = filtered.filter((s) => safeFormDate(s.date) === filterDate);
    } else if (filterMonth) {
      filtered = filtered.filter(
        (s) => formatDateToYYYYMM(s.date) === filterMonth
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.supplierName.toLowerCase().includes(query) ||
          s.productName.toLowerCase().includes(query) ||
          s.quantity.toString().includes(query) ||
          s.total.toString().includes(query) ||
          s.paid.toString().includes(query) ||
          (s.paymentMethod && s.paymentMethod.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [
    supplierTransactions,
    filterDate,
    filterMonth,
    searchQuery,
    safeFormDate,
    formatDateToYYYYMM,
  ]);

  const filteredCurrencyTransactions = useMemo(() => {
    let filtered = [...currencyTransactions];

    if (filterDate) {
      filtered = filtered.filter((c) => safeFormDate(c.date) === filterDate);
    } else if (filterMonth) {
      filtered = filtered.filter(
        (c) => formatDateToYYYYMM(c.date) === filterMonth
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.tc.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query) ||
          c.amount.toString().includes(query) ||
          c.rate.toString().includes(query) ||
          c.total.toString().includes(query)
      );
    }

    return filtered;
  }, [
    currencyTransactions,
    filterDate,
    filterMonth,
    searchQuery,
    safeFormDate,
    formatDateToYYYYMM,
  ]);

  const filteredDailyCashRecords = useMemo(() => {
    const filterValue = filterDate || filterMonth;
    if (!filterValue) return dailyCashRecords;

    return dailyCashRecords.filter((r) => {
      if (filterDate) return r.date === filterDate;
      if (filterMonth) return r.date.startsWith(filterMonth);
      return true;
    });
  }, [dailyCashRecords, filterDate, filterMonth]);

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
    type: "supplierTransaction" | "currencyTransaction",
    data: any
  ) => {
    setEditType(type);
    setEditId(data.id);
    setEditData({ ...data, date: formDate(data.date) });
  };

  const handleUpdate = async () => {
    if (!editId || !editType) return;

    try {
      if (editType === "supplierTransaction") {
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
      console.info("Kayıt başarıyla güncellendi");
    } catch (error) {
      console.error("Kayıt güncellenirken hata:", error);
      alert("Kayıt güncellenirken hata oluştu.");
    } finally {
      setEditId(null);
      setEditType(null);
      setEditData({});
    }
  };

  const handleEndDayInitiate = () => setEndDayConfirmOpen(true);

  const handleEndDay = async () => {
    setEndDayConfirmOpen(false);
    const today = new Date().toISOString().split("T")[0];

    const alreadyRecorded = dailyCashRecords.some((r) => r.date === today);
    if (alreadyRecorded) {
      const confirmOverwrite = window.confirm(
        "Bu gün için zaten bir kapanış kaydı yapılmış. Önceki kayıt silinip yeni kayıt yapılacaktır. Onaylıyor musunuz?"
      );
      if (!confirmOverwrite) return;
    }

    const newRecord: DailyCashRecord = {
      id: today,
      date: today,
      initialCash,
      finalCash: cashBalance,
      totalMovement: cashBalance - initialCash,
    };

    try {
      await addOrUpdateDailyCashRecord(newRecord);

      const tomorrowInitialCash = 0;
      await setInitialCash(tomorrowInitialCash);
      await updateCashBalance(tomorrowInitialCash, "Yeni gün başlangıcı");

      setInitialCashState(tomorrowInitialCash);
      setCashBalanceState(tomorrowInitialCash);
      setNewInitialCash("");

      const updatedRecords = alreadyRecorded
        ? dailyCashRecords.map((r) => (r.date === today ? newRecord : r))
        : [...dailyCashRecords, newRecord];
      setDailyCashRecords(updatedRecords);

      setEndDaySummary({ date: today, finalCash: newRecord.finalCash });
      setEndDayModalOpen(true);

      setFilterDate("");
      setFilterMonth("");

      console.log(
        `Gün sonu yapıldı. Yeni gün başı bakiyesi: ${formatCurrency(
          tomorrowInitialCash
        )}`
      );
    } catch (err) {
      console.error("Gün sonu kaydı hata:", err);
      alert("Gün sonu kaydı sırasında hata oluştu.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "supplierTransaction") {
        await deleteSupplierTransaction(deleteId);
        setSupplierTransactions(await getSupplierTransactions());
      } else if (deleteType === "currencyTransaction") {
        await deleteCurrencyTransaction(deleteId);
        setCurrencyTransactions(await getCurrencyTransactions());
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setDeleteType(null);
  };

  const handleDailyCashRecordDeleteInitiate = (id: string) =>
    setDailyCashRecordToDeleteId(id);

  const handleDeleteDailyCashRecord = async () => {
    if (!dailyCashRecordToDeleteId) return;
    const id = dailyCashRecordToDeleteId;

    try {
      await deleteDailyCashRecord(id);
      const updatedRecords = dailyCashRecords.filter((r) => r.id !== id);
      setDailyCashRecords(updatedRecords);
      setDailyCashRecordToDeleteId(null);
    } catch (err) {
      console.error("Kasa kaydı silme hatası:", err);
      alert("Kasa kaydı silinirken hata oluştu.");
    }
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
      <Typography>{message}</Typography>
    </Box>
  );

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          width: "100%",
          maxWidth: 1400,
          borderRadius: 3,
        }}
      >
        <Stack spacing={3} alignItems="center" mb={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MoneyIcon sx={{ fontSize: 36, color: "primary.main" }} />
            <Typography variant="h4" fontWeight={700}>
              Kasa Takip Sistemi
            </Typography>
          </Stack>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <StatCard
                title="Gün Başı Nakit"
                value={formatCurrency(initialCash)}
                color="primary"
                icon={<AccountBalanceWalletIcon />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <StatCard
                title="Anlık Kasa Bakiyesi"
                value={formatCurrency(cashBalance)}
                color={cashBalance >= 0 ? "success" : "error"}
                icon={<ReceiptLongIcon />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <StatCard
                title="Net Değişim"
                value={formatCurrency(cashBalance - initialCash)}
                color={cashBalance >= initialCash ? "success" : "error"}
                icon={cashBalance >= initialCash ? <AddIcon /> : <RemoveIcon />}
              />
            </Grid>
          </Grid>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="Toptancı İşlemleri" />
          <Tab label="Döviz İşlemleri" />
          <Tab label="Kasa Yönetimi" />
        </Tabs>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              label="Gün Filtrele"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                if (e.target.value) setFilterMonth("");
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
                if (e.target.value) setFilterDate("");
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
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
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Typography color="primary.main" fontWeight={600}>
                  Toplam Alış: {formatCurrency(supplierTotals.total)}
                </Typography>
                <Typography color="success.main" fontWeight={600}>
                  Toplam Ödenen: {formatCurrency(supplierTotals.paid)}
                </Typography>
                <Typography color="error.main" fontWeight={600}>
                  Kalan Borç: {formatCurrency(supplierTotals.debt)}
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Toptancı</TableCell>
                        <TableCell>Ürün</TableCell>
                        <TableCell>Adet</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell align="right">Ödenen</TableCell>
                        <TableCell align="right">Kalan</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredSupplierTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <EmptyState message="Toptancı işlemi bulunamadı." />
                          </TableCell>
                        </TableRow>
                      )}

                      {filteredSupplierTransactions.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{smallDate(r.date)}</TableCell>
                          <TableCell>{r.supplierName}</TableCell>
                          <TableCell>{r.productName}</TableCell>
                          <TableCell>{r.quantity}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(r.total)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(r.paid)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(r.total - r.paid)}
                          </TableCell>

                          <TableCell align="center">
                            {isEditable(r.date) ? (
                              <>
                                <Tooltip title="Düzenle">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEdit("supplierTransaction", r)
                                    }
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Sil">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setDeleteType("supplierTransaction");
                                      setDeleteId(r.id);
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Salt okunur
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}

          {tab === 1 && (
            <>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Typography color="primary.main" fontWeight={600}>
                  Toplam Döviz: {currencyTotals.totalAmount.toFixed(2)}
                </Typography>
                <Typography color="success.main" fontWeight={600}>
                  Toplam TL: {formatCurrency(currencyTotals.totalTL)}
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Adı</TableCell>
                        <TableCell>TC</TableCell>
                        <TableCell>İşlem</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell align="right">Kur</TableCell>
                        <TableCell align="right">Toplam TL</TableCell>
                        <TableCell align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filteredCurrencyTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <EmptyState message="Döviz işlemi bulunamadı." />
                          </TableCell>
                        </TableRow>
                      )}

                      {filteredCurrencyTransactions.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{smallDate(r.date)}</TableCell>
                          <TableCell>{r.name}</TableCell>
                          <TableCell>{r.tc}</TableCell>
                          <TableCell>{r.type}</TableCell>
                          <TableCell align="right">
                            {r.amount.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {r.rate.toFixed(4)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(r.total)}
                          </TableCell>

                          <TableCell align="center">
                            {isEditable(r.date) ? (
                              <>
                                <Tooltip title="Düzenle">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEdit("currencyTransaction", r)
                                    }
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Sil">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setDeleteType("currencyTransaction");
                                      setDeleteId(r.id as string);
                                    }}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Salt okunur
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}

          {tab === 2 && (
            <Box sx={{ p: 1 }}>
              <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Gün Başı Nakit
                </Typography>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        label="Gün Başı Nakit (TL)"
                        type="number"
                        fullWidth
                        value={newInitialCash}
                        onChange={(e) => setNewInitialCash(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        onClick={handleSaveInitialCash}
                        sx={{ minWidth: 140 }}
                      >
                        Kaydet
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Mevcut:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {formatCurrency(initialCash)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Manuel Kasa İşlemleri
                </Typography>
                <Grid container spacing={2} alignItems="end">
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Tutar (TL)"
                      type="number"
                      fullWidth
                      value={manualCashAmount}
                      onChange={(e) => setManualCashAmount(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Açıklama"
                      fullWidth
                      value={manualCashDescription}
                      onChange={(e) => setManualCashDescription(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => handleManualCashAction("add")}
                        sx={{ flex: 1 }}
                      >
                        Ekle
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<RemoveIcon />}
                        onClick={() => handleManualCashAction("subtract")}
                        sx={{ flex: 1 }}
                      >
                        Çıkar
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={refreshBalance}
                      >
                        Yenile
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              <Card elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Gün Sonu İşlemleri
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Günlük kasa kapanışını yapın
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleEndDayInitiate}
                  >
                    Günü Bitir
                  </Button>
                </Box>
              </Card>

              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Geçmiş Kasa Kapanışları
                  </Typography>
                  <Paper variant="outlined">
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Tarih</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Gün Başı</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Net Hareket</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>Gün Sonu</strong>
                            </TableCell>
                            <TableCell align="center">
                              <strong>İşlemler</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredDailyCashRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5}>
                                <EmptyState message="Henüz kasa kapanışı kaydı yok." />
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredDailyCashRecords
                              .sort(
                                (a, b) =>
                                  new Date(b.date).getTime() -
                                  new Date(a.date).getTime()
                              )
                              .map((r) => (
                                <TableRow key={r.id} hover>
                                  <TableCell>
                                    <Typography fontWeight={600}>
                                      {r.date}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography>
                                      {formatCurrency(r.initialCash)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      color={
                                        r.totalMovement >= 0
                                          ? "success.main"
                                          : "error.main"
                                      }
                                      fontWeight={600}
                                    >
                                      {r.totalMovement >= 0 ? "+" : ""}
                                      {formatCurrency(r.totalMovement)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      color={
                                        r.finalCash >= r.initialCash
                                          ? "success.main"
                                          : "error.main"
                                      }
                                      fontWeight={700}
                                    >
                                      {formatCurrency(r.finalCash)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title="Sil">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleDailyCashRecordDeleteInitiate(
                                            r.id
                                          )
                                        }
                                      >
                                        <DeleteIcon
                                          fontSize="small"
                                          color="error"
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

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
          message={`Gün sonu kasasını kapatmak üzeresiniz. Gün Sonu Bakiyesi ${formatCurrency(
            cashBalance
          )} olarak kaydedilecek. Onaylıyor musunuz?`}
          confirmText="Kapat ve Kaydet"
        />

        <CriticalConfirmationDialog
          open={!!dailyCashRecordToDeleteId}
          onClose={() => setDailyCashRecordToDeleteId(null)}
          onConfirm={handleDeleteDailyCashRecord}
          title="Kasa Kapanış Kaydı Silme"
          message="Bu kasa kapanış kaydını silmek istediğinizden emin misiniz?"
          confirmText="Kayıdı Sil"
          isDestructive={true}
        />

        <Dialog open={!!editId} maxWidth="sm" fullWidth>
          <DialogTitle>Kayıt Düzenle</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Düzenleme formu burada olmalı.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditId(null)}>İptal</Button>
            <Button onClick={handleUpdate} variant="contained">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={endDayModalOpen}
          onClose={() => setEndDayModalOpen(false)}
        >
          <DialogTitle>Kasa Kapanışı Başarılı</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              {endDaySummary.date} tarihi için kasa kapanışı yapıldı.
            </Typography>
            <Typography variant="h6" color="success.dark" fontWeight={700}>
              Gün Sonu Nakit: {formatCurrency(endDaySummary.finalCash)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEndDayModalOpen(false)}>Tamam</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default TrackingPage;
