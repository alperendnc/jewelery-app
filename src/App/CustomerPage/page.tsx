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
import { useSnackbar } from "notistack";

const CustomerPage = () => {
  const { addCustomer, getCustomers, updateCustomer, deleteCustomer } =
    useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    tc: "",
    phone: "",
    address: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    name: "",
    tc: "",
    phone: "",
    address: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleAdd = async () => {
    if (!newCustomer.name || !newCustomer.tc) return;
    try {
      await addCustomer(newCustomer);
      enqueueSnackbar("Müşteri eklendi", { variant: "success" });
      setNewCustomer({ name: "", tc: "", phone: "", address: "" });
      fetchCustomers();
    } catch {
      enqueueSnackbar("Müşteri eklenemedi", { variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCustomer(id);
    enqueueSnackbar("Müşteri silindi", { variant: "info" });
    setDeleteId(null);
    fetchCustomers();
  };

  const handleEdit = (customer: any) => {
    setEditId(customer.id);
    setEditCustomer({
      name: customer.name,
      tc: customer.tc,
      phone: customer.phone,
      address: customer.address,
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      await updateCustomer(editId, editCustomer);
      enqueueSnackbar("Müşteri güncellendi", { variant: "success" });
      setEditId(null);
      setEditCustomer({ name: "", tc: "", phone: "", address: "" });
      fetchCustomers();
    } catch {
      enqueueSnackbar("Güncelleme başarısız", { variant: "error" });
    }
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1100, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Müşteri Yönetimi
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid>
            <TextField
              label="Ad Soyad"
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="T.C. Kimlik"
              value={newCustomer.tc}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  tc: e.target.value.replace(/\D/g, "").slice(0, 11),
                })
              }
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Telefon"
              value={newCustomer.phone}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                })
              }
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Ne Almış"
              value={newCustomer.address}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, address: e.target.value })
              }
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
                <TableCell>Ad Soyad</TableCell>
                <TableCell>T.C.</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Ne Almış</TableCell>
                <TableCell align="center">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    {editId === customer.id ? (
                      <TextField
                        value={editCustomer.name}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            name: e.target.value,
                          })
                        }
                        size="small"
                      />
                    ) : (
                      customer.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === customer.id ? (
                      <TextField
                        value={editCustomer.tc}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            tc: e.target.value.replace(/\D/g, "").slice(0, 11),
                          })
                        }
                        size="small"
                      />
                    ) : (
                      customer.tc
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === customer.id ? (
                      <TextField
                        value={editCustomer.phone}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 11),
                          })
                        }
                        size="small"
                      />
                    ) : (
                      customer.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === customer.id ? (
                      <TextField
                        value={editCustomer.address}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            address: e.target.value,
                          })
                        }
                        size="small"
                      />
                    ) : (
                      customer.address
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === customer.id ? (
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
                          onClick={() => handleEdit(customer)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteId(customer.id)}
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
          <DialogTitle>Müşteriyi Sil</DialogTitle>
          <DialogContent>
            <Typography>
              Bu müşteriyi silmek istediğinize emin misiniz?
            </Typography>
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

export default CustomerPage;
