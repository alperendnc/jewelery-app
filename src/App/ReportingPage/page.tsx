import React, { useEffect, useState } from "react";
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
import BarChartIcon from "@mui/icons-material/BarChart";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth, Product, Sale, Purchase } from "src/contexts/UseAuth";

const ReportingPage = () => {
  const [tab, setTab] = useState(0);
  const {
    getProducts,
    getSales,
    getPurchases,
    updatePurchase,
    deletePurchase,
  } = useAuth();

  const [stockReports, setStockReports] = useState<Product[]>([]);
  const [salesReports, setSalesReports] = useState<Sale[]>([]);
  const [purchaseReports, setPurchaseReports] = useState<Purchase[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<Purchase, "id">>({
    supplierName: "",
    productName: "",
    quantity: 0,
    total: 0,
    paid: 0,
    date: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setStockReports(await getProducts());
      setSalesReports(await getSales());
      setPurchaseReports(await getPurchases());
    }
    fetchData();
  }, []);

  const profitReports = React.useMemo(() => {
    const monthlyData: Record<string, { satis: number; maliyet: number }> = {};

    salesReports.forEach((sale) => {
      const month = sale.date.slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { satis: 0, maliyet: 0 };
      monthlyData[month].satis += sale.total;
      monthlyData[month].maliyet += sale.total * 0.8;
    });

    return Object.entries(monthlyData).map(([ay, data]) => ({
      ay,
      satis: data.satis,
      maliyet: data.maliyet,
      kar: data.satis - data.maliyet,
    }));
  }, [salesReports]);

  const purchaseTotals = React.useMemo(() => {
    const total = purchaseReports.reduce((sum, p) => sum + p.total, 0);
    const paid = purchaseReports.reduce((sum, p) => sum + p.paid, 0);
    return { total, paid, debt: total - paid };
  }, [purchaseReports]);

  const handleEdit = (purchase: Purchase) => {
    setEditId(purchase.id);
    setEditData({ ...purchase });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updatePurchase(editId, editData);
    setEditId(null);
    setPurchaseReports(await getPurchases());
  };

  const handleDelete = async (id: string) => {
    await deletePurchase(id);
    setDeleteId(null);
    setPurchaseReports(await getPurchases());
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
          <BarChartIcon sx={{ fontSize: 40, color: "#2196f3", mb: 1 }} />
          <Typography variant="h5" fontWeight={600} mb={2}>
            Raporlama
          </Typography>
        </Box>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 3 }}
        >
          <Tab label="Stok" />
          <Tab label="Satış" />
          <Tab label="Kâr/Zarar" />
          <Tab label="Toptancı" />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Gram</TableCell>
                  <TableCell>Stok</TableCell>
                  <TableCell>Fiyat (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.gram}</TableCell>
                    <TableCell>{r.stock}</TableCell>
                    <TableCell>{r.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Adet</TableCell>
                  <TableCell>Tutar (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ay</TableCell>
                  <TableCell>Satış (TL)</TableCell>
                  <TableCell>Maliyet (TL)</TableCell>
                  <TableCell>Kâr (TL)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profitReports.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.ay}</TableCell>
                    <TableCell>{r.satis.toFixed(2)}</TableCell>
                    <TableCell>{r.maliyet.toFixed(2)}</TableCell>
                    <TableCell>{r.kar.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 3 && (
          <>
            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Typography color="primary.main" fontWeight={600}>
                Toplam Alış: {purchaseTotals.total.toFixed(2)} TL
              </Typography>
              <Typography color="success.main" fontWeight={600}>
                Toplam Ödenen: {purchaseTotals.paid.toFixed(2)} TL
              </Typography>
              <Typography color="error.main" fontWeight={600}>
                Kalan Borç: {purchaseTotals.debt.toFixed(2)} TL
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
                    <TableCell>Tutar (TL)</TableCell>
                    <TableCell>Ödenen (TL)</TableCell>
                    <TableCell>Kalan (TL)</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.supplierName}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>{r.total.toFixed(2)}</TableCell>
                      <TableCell>{r.paid.toFixed(2)}</TableCell>
                      <TableCell>{(r.total - r.paid).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEdit(r)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(r.id)}
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
          onClose={() => setEditId(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Toptancı Kaydını Düzenle</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}
          >
            <TextField
              label="Toptancı"
              value={editData.supplierName}
              onChange={(e) =>
                setEditData({ ...editData, supplierName: e.target.value })
              }
            />
            <TextField
              label="Ürün"
              value={editData.productName}
              onChange={(e) =>
                setEditData({ ...editData, productName: e.target.value })
              }
            />
            <TextField
              label="Adet"
              type="number"
              value={editData.quantity}
              onChange={(e) =>
                setEditData({ ...editData, quantity: Number(e.target.value) })
              }
            />
            <TextField
              label="Tutar"
              type="number"
              value={editData.total}
              onChange={(e) =>
                setEditData({ ...editData, total: Number(e.target.value) })
              }
            />
            <TextField
              label="Ödenen"
              type="number"
              value={editData.paid}
              onChange={(e) =>
                setEditData({ ...editData, paid: Number(e.target.value) })
              }
            />
            <TextField
              label="Tarih"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditId(null)}>İptal</Button>
            <Button variant="contained" onClick={handleUpdate}>
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Kayıt Sil</DialogTitle>
          <DialogContent>
            <Typography>Bu kaydı silmek istediğinize emin misiniz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>İptal</Button>
            <Button
              color="error"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ReportingPage;
