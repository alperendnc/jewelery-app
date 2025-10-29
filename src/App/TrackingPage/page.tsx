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
  Divider,
  Chip,
} from "@mui/material";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
  caption,
}: {
  title: string;
  value: string;
  color?: "primary" | "success" | "error";
  icon?: React.ReactNode;
  caption?: string;
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      minWidth: 200,
      bgcolor: "background.paper",
    }}
  >
    <Box
      sx={{
        mr: 2,
        width: 48,
        height: 48,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor:
          color === "success"
            ? "success.light"
            : color === "error"
            ? "error.light"
            : "primary.light",
        color: `${color}.dark`,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      )}
    </Box>
  </Paper>
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
  const [resetBalances, setResetBalances] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [fetchedSupplierTransactions, fetchedCurrencyTransactions] =
          await Promise.all([
            getSupplierTransactions(),
            getCurrencyTransactions(),
          ]);

        if (!mounted) return;
        setSupplierTransactions(fetchedSupplierTransactions);
        setCurrencyTransactions(fetchedCurrencyTransactions);

        console.log("🔥 VERİLER YÜKLENDİ:", {
          supplierTransactions: fetchedSupplierTransactions.length,
          currencyTransactions: fetchedCurrencyTransactions.length,
          sampleSupplier: fetchedSupplierTransactions[0],
          sampleCurrency: fetchedCurrencyTransactions[0],
        });

        const ic = await getInitialCash();
        if (!mounted) return;
        setInitialCashState(ic);

        const records = await getDailyCashRecords();
        if (!mounted) return;
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
  ]);

  // Basitleştirilmiş ve güvenilir tarih formatlama
  const safeFormDate = useCallback(
    (date: string | Timestamp | undefined): string => {
      if (!date) return "";

      try {
        // Timestamp ise
        if ((date as any)?.toDate instanceof Function) {
          const d = (date as any).toDate() as Date;
          return d.toISOString().split("T")[0];
        }

        // String ise
        if (typeof date === "string") {
          // YYYY-MM-DD formatında mı?
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }

          // DD-MM-YYYY formatında mı?
          const ddMMyyyyMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (ddMMyyyyMatch) {
            const [, day, month, year] = ddMMyyyyMatch;
            return `${year}-${month}-${day}`;
          }

          // Diğer formatlar için Date parse dene
          const parsed = new Date(date);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split("T")[0];
          }
        }

        // Fallback
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
      return fullDate.substring(0, 7); // YYYY-MM
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
        setNewInitialCash("");
        setResetBalances(false);
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

  const cashFlowTotals = useMemo(() => {
    const supplierCashTotal = filteredSupplierTransactions.reduce((sum, s) => {
      if (s.paymentMethod === "Nakit") return sum - s.paid;
      return sum;
    }, 0);

    const currencyCashTotal = filteredCurrencyTransactions.reduce((sum, c) => {
      if (c.type === "Alış") return sum - c.total;
      if (c.type === "Satış") return sum + c.total;
      return sum;
    }, 0);

    const totalCashMovement = supplierCashTotal + currencyCashTotal;
    const finalCashBalance = initialCash + totalCashMovement;

    return {
      totalCashMovement,
      finalCashBalance,
    };
  }, [filteredSupplierTransactions, filteredCurrencyTransactions, initialCash]);

  const displayedInitialCash = resetBalances ? 0 : initialCash;
  const displayedTotalMovement = resetBalances
    ? 0
    : cashFlowTotals.totalCashMovement;
  const displayedFinalCash = resetBalances
    ? 0
    : cashFlowTotals.finalCashBalance;

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
      finalCash: cashFlowTotals.finalCashBalance,
      totalMovement: cashFlowTotals.totalCashMovement,
    };

    try {
      await addOrUpdateDailyCashRecord(newRecord);

      const updatedRecords = alreadyRecorded
        ? dailyCashRecords.map((r) => (r.date === today ? newRecord : r))
        : [...dailyCashRecords, newRecord];
      setDailyCashRecords(updatedRecords);

      await setInitialCash(0);
      setInitialCashState(0);
      setNewInitialCash("");
      setResetBalances(true);

      setEndDaySummary({ date: today, finalCash: newRecord.finalCash });
      setEndDayModalOpen(true);

      setFilterDate("");
      setFilterMonth("");
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

      if (
        updatedRecords.length > 0 &&
        id ===
          dailyCashRecords.reduce((a, b) =>
            new Date(a.date) > new Date(b.date) ? a : b
          ).id
      ) {
        console.warn("Sistemdeki initialCash manuel olarak düzeltilmeli.");
      } else if (updatedRecords.length === 0) {
        await setInitialCash(0);
        setInitialCashState(0);
      }
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
          maxWidth: 1200,
          borderRadius: 3,
        }}
      >
        <Stack spacing={2} alignItems="center" mb={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MoneyIcon sx={{ fontSize: 36, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700}>
              Kasa ve Finans Takibi
            </Typography>
            <Chip label="Canlı" color="success" size="small" sx={{ ml: 1 }} />
          </Stack>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Gün Başı Nakit"
                value={formatCurrency(displayedInitialCash)}
                color="primary"
                icon={<AccountBalanceWalletIcon />}
                caption={`Oturum: ${smallDate()}`}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StatCard
                title="Toplam Nakit Hareketi"
                value={formatCurrency(displayedTotalMovement)}
                color="success"
                icon={<TrendingUpIcon />}
                caption={`Toptancı/Döviz özetine göre`}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <StatCard
                title="Gün Sonu Bakiyesi"
                value={formatCurrency(displayedFinalCash)}
                color={displayedFinalCash >= 0 ? "success" : "error"}
                icon={<ReceiptLongIcon />}
                caption={displayedFinalCash >= 0 ? "Pozitif" : "Negatif"}
              />
            </Grid>
          </Grid>
        </Stack>

        <Tabs
          value={tab}
          onChange={(_, v) => {
            console.log("📑 Tab değişti:", v);
            setTab(v);
          }}
          centered
          sx={{ mb: 2 }}
          variant="fullWidth"
        >
          <Tab label="Toptancı" />
          <Tab label="Döviz" />
          <Tab label="Kasa" />
        </Tabs>

        {loading && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.6)",
              zIndex: 5,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <TextField
              label="Gün Filtrele"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filterDate}
              onChange={(e) => {
                console.log("📅 Gün filtresi değişti:", e.target.value);
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
                console.log("📅 Ay filtresi değişti:", e.target.value);
                setFilterMonth(e.target.value);
                if (e.target.value) setFilterDate("");
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Ara..."
              fullWidth
              value={searchQuery}
              onChange={(e) => {
                console.log("🔍 Arama değişti:", e.target.value);
                setSearchQuery(e.target.value);
              }}
              sx={{ mt: 1 }}
            />
          </Box>

          {tab === 0 && (
            <>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                <TableContainer sx={{ maxHeight: 360 }}>
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
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Typography color="primary.main" fontWeight={600}>
                  Toplam Döviz Miktarı: {currencyTotals.totalAmount.toFixed(2)}
                </Typography>
                <Typography color="success.main" fontWeight={600}>
                  Toplam TL Karşılığı: {formatCurrency(currencyTotals.totalTL)}
                </Typography>
              </Box>

              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 360 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Adı</TableCell>
                        <TableCell>TC</TableCell>
                        <TableCell>Döviz</TableCell>
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
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Gün Başı Nakit Girişi 💰
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bugün için geçerli olan başlangıç nakit tutarını kaydedin.
                    </Typography>

                    <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
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
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Mevcut Gün Başı:
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(displayedInitialCash)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: "#f1f8f5" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Günlük Nakit Akış Özeti
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toptancı ve döviz işlemlerinden gelen nakit hareketleri
                      özetlenir.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleEndDayInitiate}
                  >
                    Günü Bitir & Kapat
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">Gün Başı Nakit</Typography>
                    <Typography fontWeight={700}>
                      {formatCurrency(displayedInitialCash)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">
                      Gün İçi Toplam Nakit
                    </Typography>
                    <Typography color="success.main" fontWeight={700}>
                      {formatCurrency(displayedTotalMovement)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="caption">Gün Sonu Nakit</Typography>
                    <Typography
                      fontWeight={700}
                      color={
                        displayedFinalCash >= 0 ? "success.dark" : "error.dark"
                      }
                    >
                      {formatCurrency(displayedFinalCash)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="h6" mt={2} mb={1}>
                Geçmiş Kasa Kapanışları
              </Typography>

              <Paper variant="outlined">
                <TableContainer sx={{ maxHeight: 360 }}>
                  <Table size="small" stickyHeader>
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
                      {filteredDailyCashRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <EmptyState message="Henüz kasa kapanışı kaydı yok." />
                          </TableCell>
                        </TableRow>
                      )}

                      {filteredDailyCashRecords
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((r) => (
                          <TableRow key={r.id} hover>
                            <TableCell>{r.date}</TableCell>
                            <TableCell align="right">
                              {formatCurrency(r.initialCash)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(r.totalMovement)}
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(r.finalCash)}
                            </TableCell>

                            <TableCell align="center">
                              <Tooltip title="Düzenleme desteklenmiyor">
                                <span>
                                  <IconButton size="small" disabled>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDailyCashRecordDeleteInitiate(r.id)
                                  }
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
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
            cashFlowTotals.finalCashBalance
          )} olarak kaydedilecek. Onaylıyor musunuz?`}
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
          <DialogTitle>Kasa Kapanışı Başarılı 🎉</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              {endDaySummary.date} tarihi için kasa kapanışı yapıldı.
            </Typography>
            <Typography variant="h6" color="success.dark" fontWeight={700}>
              Gün Sonu Nakit Bakiyesi: {formatCurrency(endDaySummary.finalCash)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Bu tutar sistemde günlük kasa kapanışları olarak saklandı.
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
