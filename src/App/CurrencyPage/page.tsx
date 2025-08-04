import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "src/contexts/UseAuth";

const CurrencyPage = () => {
  const { addCurrencyTransaction, getCurrencyTransactions } = useAuth();

  const [transaction, setTransaction] = useState({
    name: "",
    tc: "",
    amount: "",
    rate: "",
    type: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [transactions, setTransactions] = useState<
    Array<{
      name: string;
      tc: string;
      amount: number;
      rate: number;
      type: string;
      date: string;
    }>
  >([]);

  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getCurrencyTransactions();
      setTransactions(data);
    };
    fetchTransactions();
  }, [getCurrencyTransactions]);

  const handleTransaction = async () => {
    const total = Number(transaction.amount) * Number(transaction.rate);
    await addCurrencyTransaction({
      ...transaction,
      amount: Number(transaction.amount),
      paid: total,
      rate: Number(transaction.rate),
      total,
    });
    setTransaction({
      name: "",
      tc: "",
      amount: "",
      rate: "",
      type: "",
      date: new Date().toISOString().slice(0, 10),
    });
    const updatedTransactions = await getCurrencyTransactions();
    setTransactions(updatedTransactions);
  };

  const calculateTotal = () => {
    const amount = Number(transaction.amount);
    const rate = Number(transaction.rate);
    return amount && rate ? (amount * rate).toFixed(2) : "0.00";
  };

  const filteredTransactions = transactions.filter((t) => {
    const query = transactionSearchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.tc.toLowerCase().includes(query) ||
      t.type.toLowerCase().includes(query) ||
      t.date.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1100, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Döviz İşlemleri
        </Typography>

        <Box display="flex" gap={4} mb={3}>
          <Box flex={1} sx={{ borderRight: "1px solid #ccc", pr: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2} align="center">
              İşlem Bilgileri
            </Typography>
            <TextField
              label="Ad Soyad"
              value={transaction.name}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="T.C."
              value={transaction.tc}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 11) {
                  setTransaction((prev) => ({ ...prev, tc: value }));
                }
              }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Miktar"
              value={transaction.amount}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, amount: e.target.value }))
              }
              type="number"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Kur"
              value={transaction.rate}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, rate: e.target.value }))
              }
              type="number"
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Döviz Türü"
              value={transaction.type}
              onChange={(e) =>
                setTransaction((prev) => ({ ...prev, type: e.target.value }))
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Toplam Tutar"
              value={calculateTotal() + " TL"}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransaction}
              >
                İşlemi Kaydet
              </Button>
            </Box>
          </Box>

          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} mb={2} align="center">
              Girilen İşlemler
            </Typography>

            <TextField
              label=" Ara"
              fullWidth
              sx={{ mb: 2 }}
              value={transactionSearchQuery}
              onChange={(e) => setTransactionSearchQuery(e.target.value)}
            />

            <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
              {filteredTransactions.map((t, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{t.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>T.C.: {t.tc}</Typography>
                    <Typography>Miktar: {t.amount}</Typography>
                    <Typography>Kur: {t.rate}</Typography>
                    <Typography>Döviz Türü: {t.type}</Typography>
                    <Typography>Tarih: {t.date}</Typography>
                    <Typography>
                      Toplam Tutar: {(t.amount * t.rate).toFixed(2)} TL
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
              {filteredTransactions.length === 0 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                  mt={2}
                >
                  Gösterilecek işlem bulunamadı.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CurrencyPage;
