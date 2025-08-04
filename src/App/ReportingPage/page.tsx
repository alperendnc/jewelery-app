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
import { useAuth, Sale, Purchase, Product } from "src/contexts/UseAuth";
import formDate from "src/components/formDate";

type EditData = Partial<Omit<Sale, "id"> & Omit<Purchase, "id">>;

const ReportingPage = () => {
  const [tab, setTab] = useState(0);
  const {
    getProducts,
    getSales,
    updateSale,
    deleteSale,
    getPurchases,
    updatePurchase,
    deletePurchase,
  } = useAuth();

  const [stockReports, setStockReports] = useState<Product[]>([]);
  const [salesReports, setSalesReports] = useState<Sale[]>([]);
  const [purchaseReports, setPurchaseReports] = useState<Purchase[]>([]);

  const [editType, setEditType] = useState<"sale" | "purchase" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"sale" | "purchase" | null>(
    null
  );
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [products, sales, purchases] = await Promise.all([
        getProducts(),
        getSales(),
        getPurchases(),
      ]);
      setStockReports(products);
      setSalesReports(sales);
      setPurchaseReports(purchases);
    }
    fetchData();
  }, [getProducts, getSales, getPurchases]);

  const filteredSales = salesReports.filter((r) => {
    const dateMatches = filterDate
      ? formDate(r.date).slice(0, 10) === filterDate
      : true;
    const searchMatches = searchQuery
      ? r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customerName &&
          r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.paymentMethod &&
          r.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return dateMatches && searchMatches;
  });

  const filteredPurchases = purchaseReports.filter((r) => {
    const dateMatches = filterDate
      ? formDate(r.date).slice(0, 10) === filterDate
      : true;
    const searchMatches = searchQuery
      ? r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.paymentMethod &&
          r.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return dateMatches && searchMatches;
  });

  const filteredStock = stockReports.filter((r) => {
    return searchQuery
      ? r.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  const handleEdit = (type: "sale" | "purchase", data: any) => {
    setEditType(type);
    setEditId(data.id);
    setEditData({ ...data, date: formDate(data.date) });
  };

  const handleUpdate = async () => {
    if (!editId || !editType) return;

    if (editType === "sale") {
      const dataToUpdate = { ...editData } as Omit<Sale, "id">;
      if (dataToUpdate.paid === undefined) {
        dataToUpdate.paid = dataToUpdate.total;
      }
      await updateSale(editId, dataToUpdate);
      setSalesReports(await getSales());
    } else if (editType === "purchase") {
      await updatePurchase(editId, editData as Omit<Purchase, "id">);
      setPurchaseReports(await getPurchases());
    }

    setEditId(null);
    setEditType(null);
    setEditData({});
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    if (deleteType === "sale") {
      await deleteSale(deleteId);
      setSalesReports(await getSales());
    } else if (deleteType === "purchase") {
      await deletePurchase(deleteId);
    }

    setDeleteId(null);
    setDeleteType(null);
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
          <Tab label="Alış" />
        </Tabs>

        <TextField
          label="Ara"
          fullWidth
          sx={{ mb: 2 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <TextField
          label="Tarih Filtrele"
          type="date"
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Stok</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStock.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.stock}</TableCell>
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
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Gram</TableCell>
                  <TableCell>Tutar (TL)</TableCell>
                  <TableCell>Ödenen (TL)</TableCell>
                  <TableCell>Kalan (TL)</TableCell>
                  <TableCell>Ödeme Yöntemi</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formDate(r.date)}</TableCell>
                    <TableCell>{r.customerName || "-"}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.total.toFixed(2)}</TableCell>
                    <TableCell>{(r.paid ?? r.total).toFixed(2)}</TableCell>
                    <TableCell>
                      {(r.total - (r.paid ?? r.total)).toFixed(2)}
                    </TableCell>
                    <TableCell>{r.paymentMethod || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit("sale", r)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeleteType("sale");
                          setDeleteId(r.id ?? null);
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
        )}

        {tab === 2 && (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Müşteri</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Gram</TableCell>
                    <TableCell>Tutar (TL)</TableCell>
                    <TableCell>Ödenen (TL)</TableCell>
                    <TableCell>Kalan (TL)</TableCell>
                    <TableCell>Ödeme Yöntemi</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPurchases.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formDate(r.date)}</TableCell>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>{r.total.toFixed(2)}</TableCell>
                      <TableCell>{r.paid.toFixed(2)}</TableCell>
                      <TableCell>{(r.total - r.paid).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        {r.paymentMethod || "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit("purchase", r)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteType("purchase");
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
            {editType === "purchase"
              ? "Alış Kaydını Düzenle"
              : "Satış Kaydını Düzenle"}
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}
          >
            <TextField
              label="Ürün"
              value={editData.productName || ""}
              onChange={(e) =>
                setEditData({ ...editData, productName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Gram"
              type="number"
              value={editData.quantity ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, quantity: Number(e.target.value) })
              }
              fullWidth
            />
            <TextField
              label="Tutar"
              type="number"
              value={editData.total ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, total: Number(e.target.value) })
              }
              fullWidth
            />
            <TextField
              label="Ödenen"
              type="number"
              value={editData.paid ?? ""}
              onChange={(e) =>
                setEditData({ ...editData, paid: Number(e.target.value) })
              }
              fullWidth
            />
            <TextField
              label="Tarih"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editData.date || ""}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
              fullWidth
            />

            {editType === "sale" && (
              <>
                <TextField
                  label="Müşteri"
                  value={editData.customerName || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, customerName: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Ödeme Yöntemi"
                  value={editData.paymentMethod || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      paymentMethod: e.target.value as "Nakit" | "IBAN" | "Pos",
                    })
                  }
                  fullWidth
                />
              </>
            )}

            {editType === "purchase" && (
              <>
                <TextField
                  label="Müşteri"
                  value={editData.customerName || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, customerName: e.target.value })
                  }
                  fullWidth
                />
                <TextField
                  label="Ödeme Yöntemi"
                  value={editData.paymentMethod || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      paymentMethod: e.target.value as "Nakit" | "IBAN" | "Pos",
                    })
                  }
                  fullWidth
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditId(null)}>İptal</Button>
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
            <Button onClick={() => setDeleteId(null)}>İptal</Button>
            <Button color="error" onClick={handleDelete}>
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ReportingPage;
