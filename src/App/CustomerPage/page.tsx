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
  Collapse,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

const CustomerPage = () => {
  const { addCustomer, updateCustomer, deleteCustomer, listenCustomers } =
    useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    tc: "",
    phone: "",
    soldItem: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    name: "",
    tc: "",
    phone: "",
    soldItem: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenCustomers((data) => setCustomers(data));
    return () => unsubscribe();
  }, [listenCustomers]);

  const handleAdd = async () => {
    if (!newCustomer.name || !newCustomer.tc) return;
    try {
      await addCustomer(newCustomer);
      enqueueSnackbar("Müşteri eklendi", { variant: "success" });
      setNewCustomer({
        name: "",
        tc: "",
        phone: "",
        soldItem: "",
      });
    } catch {
      enqueueSnackbar("Müşteri eklenemedi", { variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCustomer(id);
    enqueueSnackbar("Müşteri silindi", { variant: "info" });
    setDeleteId(null);
  };

  const handleEdit = (customer: any) => {
    setEditId(customer.id);
    setEditCustomer({
      name: customer.name,
      tc: customer.tc,
      phone: customer.phone,
      soldItem: customer.soldItem || "",
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      await updateCustomer(editId, editCustomer);
      enqueueSnackbar("Müşteri güncellendi", { variant: "success" });
      setEditId(null);
      setEditCustomer({
        name: "",
        tc: "",
        phone: "",
        soldItem: "",
      });
    } catch {
      enqueueSnackbar("Güncelleme başarısız", { variant: "error" });
    }
  };

  const groupByName = (data: any[]) => {
    const groups: { [key: string]: any[] } = {};
    data.forEach((item) => {
      if (!groups[item.name]) {
        groups[item.name] = [];
      }
      groups[item.name].push(item);
    });
    return groups;
  };

  const groupedCustomers = groupByName(customers);

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
              value={newCustomer.soldItem}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, soldItem: e.target.value })
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
              {Object.entries(groupedCustomers).map(([name, entries]) => (
                <React.Fragment key={name}>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ backgroundColor: "#f5f5f5" }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        onClick={() =>
                          setExpandedName((prev) =>
                            prev === name ? null : name
                          )
                        }
                        sx={{ cursor: "pointer" }}
                      >
                        {expandedName === name ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                        <Typography sx={{ fontWeight: 600, ml: 1 }}>
                          {name}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0 }}>
                      <Collapse
                        in={expandedName === name}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Table size="small">
                          <TableBody>
                            {entries.map((customer) => (
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
                                          tc: e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 11),
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
                                      value={editCustomer.soldItem}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          soldItem: e.target.value,
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    customer.soldItem || "-"
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
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
