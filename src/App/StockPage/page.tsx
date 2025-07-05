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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "src/contexts/UseAuth";

type StockItem = {
  id: string;
  name: string;
  ayar: string;
  gram: number;
  fiyat: number;
  adet: number;
};

const StockPage = () => {
  const { getProducts, addProduct, updateProduct, deleteProduct } = useAuth();

  const [stock, setStock] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    ayar: "",
    gram: "",
    fiyat: "",
    adet: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({
    name: "",
    ayar: "",
    gram: "",
    fiyat: "",
    adet: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      const mapped = products.map((p) => ({
        id: p.id || "",
        name: p.name,
        ayar: p.gram.toString(),
        gram: p.gram,
        fiyat: p.price,
        adet: p.stock,
      }));
      setStock(mapped);
    }
    fetchProducts();
  }, [getProducts]);

  const handleAdd = async () => {
    if (
      !newItem.name ||
      !newItem.ayar ||
      !newItem.gram ||
      !newItem.fiyat ||
      !newItem.adet
    )
      return;
    await addProduct({
      name: newItem.name,
      gram: Number(newItem.gram),
      price: Number(newItem.fiyat),
      stock: Number(newItem.adet),
    });
    setNewItem({ name: "", ayar: "", gram: "", fiyat: "", adet: "" });
    const updated = await getProducts();
    setStock(
      updated.map((p) => ({
        id: p.id || "",
        name: p.name,
        ayar: p.gram.toString(),
        gram: p.gram,
        fiyat: p.price,
        adet: p.stock,
      }))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteId(null);
    setStock((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (item: StockItem) => {
    setEditId(item.id);
    setEditItem({
      name: item.name,
      ayar: item.ayar,
      gram: item.gram.toString(),
      fiyat: item.fiyat.toString(),
      adet: item.adet.toString(),
    });
  };

  const handleUpdate = async () => {
    if (editId === null) return;
    await updateProduct(editId, {
      name: editItem.name,
      gram: Number(editItem.gram),
      price: Number(editItem.fiyat),
      stock: Number(editItem.adet),
    });
    setEditId(null);
    setEditItem({ name: "", ayar: "", gram: "", fiyat: "", adet: "" });

    const updated = await getProducts();
    setStock(
      updated.map((p) => ({
        id: p.id || "",
        name: p.name,
        ayar: p.gram.toString(),
        gram: p.gram,
        fiyat: p.price,
        adet: p.stock,
      }))
    );
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 900, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Stok Yönetimi
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid>
            <TextField
              label="Ürün Adı"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Ayar"
              value={newItem.ayar}
              onChange={(e) => setNewItem({ ...newItem, ayar: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Gram"
              type="number"
              value={newItem.gram}
              onChange={(e) => setNewItem({ ...newItem, gram: e.target.value })}
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Fiyat"
              type="number"
              value={newItem.fiyat}
              onChange={(e) =>
                setNewItem({ ...newItem, fiyat: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Adet"
              type="number"
              value={newItem.adet}
              onChange={(e) => setNewItem({ ...newItem, adet: e.target.value })}
              fullWidth
            />
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

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ürün Adı</TableCell>
                <TableCell>Ayar</TableCell>
                <TableCell>Gram</TableCell>
                <TableCell>Fiyat</TableCell>
                <TableCell>Adet</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        value={editItem.name}
                        onChange={(e) =>
                          setEditItem({ ...editItem, name: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      item.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        value={editItem.ayar}
                        onChange={(e) =>
                          setEditItem({ ...editItem, ayar: e.target.value })
                        }
                        size="small"
                      />
                    ) : (
                      item.ayar
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        value={editItem.gram}
                        type="number"
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            gram: e.target.value,
                          })
                        }
                        size="small"
                        sx={{ width: 80 }}
                      />
                    ) : (
                      item.gram
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        value={editItem.fiyat}
                        type="number"
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            fiyat: e.target.value,
                          })
                        }
                        size="small"
                      />
                    ) : (
                      item.fiyat
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === item.id ? (
                      <TextField
                        value={editItem.adet}
                        type="number"
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            adet: e.target.value,
                          })
                        }
                        size="small"
                        sx={{ width: 60 }}
                      />
                    ) : (
                      item.adet
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === item.id ? (
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
                          onClick={() => handleEdit(item)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteId(item.id)}
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
          <DialogTitle>Ürünü Sil</DialogTitle>
          <DialogContent>
            <Typography>Bu ürünü silmek istediğinize emin misiniz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>İptal</Button>
            <Button
              color="error"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default StockPage;
