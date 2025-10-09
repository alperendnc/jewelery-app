import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
import PlusIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Customer } from "src/contexts/UseAuth";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

type NewCustomer = Omit<Customer, "id" | "createdAt" | "date"> & {
  date: string;
};

const CustomerPage = () => {
  const { updateCustomer, deleteCustomer, listenCustomers, addCustomer } =
    useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<Partial<Customer>>({
    name: "",
    tc: "",
    phone: "",
    soldItem: "",
    boughtItem: "",
    total: 0,
    paid: 0,
    debt: 0,
    date: "",
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<NewCustomer>>({
    name: "",
    tc: "",
    phone: "",
    debt: 0,
    total: 0,
    paid: 0,
    date: new Date().toISOString().slice(0, 10),
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = listenCustomers((data) => setCustomers(data));
    return () => unsubscribe();
  }, [listenCustomers]);

  const formatCustomerDate = (date: Customer["date"] | string): string => {
    if (!date) return "-";

    if (typeof date === "object" && date !== null && "toDate" in date) {
      const d = date.toDate();
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    }

    if (typeof date === "string") {
      const partsDash = date.split("-");
      if (partsDash.length === 3 && partsDash[0].length === 4) {
        return `${partsDash[2]}.${partsDash[1]}.${partsDash[0]}`;
      }
      if (date.includes(".")) {
        return date;
      }
    }

    return "-";
  };

  const formatForDateInput = (date: Customer["date"]): string => {
    const displayDate = formatCustomerDate(date);
    if (displayDate === "-") return "";

    const parts = displayDate.split(".");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      enqueueSnackbar("Müşteri başarıyla silindi.", { variant: "info" });
    } catch (error) {
      console.error("Silme hatası:", error);
      enqueueSnackbar("Müşteri silme başarısız.", { variant: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditId(customer.id!);

    setEditCustomer({
      name: customer.name || "",
      tc: customer.tc || "",
      phone: customer.phone || "",
      soldItem: customer.soldItem || "",
      boughtItem: customer.boughtItem || "",
      total: Number(customer.total || 0),
      paid: Number(customer.paid || 0),
      debt: Number(customer.debt || 0),
      date: formatForDateInput(customer.date),
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;

    const dateForDB = editCustomer.date
      ? formatCustomerDate(editCustomer.date)
      : undefined;

    const updatedData: Partial<Customer> = {
      ...editCustomer,
      phone: editCustomer.phone?.replace(/\D/g, "") || "",
      tc: editCustomer.tc?.replace(/\D/g, "") || "",
      date: dateForDB,
    };

    try {
      await updateCustomer(editId, updatedData);
      enqueueSnackbar("Müşteri başarıyla güncellendi.", { variant: "success" });
      setEditId(null);
      setEditCustomer({});
    } catch (error) {
      console.error("Müşteri güncelleme başarısız:", error);
      enqueueSnackbar("Güncelleme başarısız.", { variant: "error" });
    }
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.tc) {
      enqueueSnackbar("Ad Soyad ve T.C. Kimlik No alanları zorunludur.", {
        variant: "warning",
      });
      return;
    }

    const dateForDB = newCustomer.date
      ? formatCustomerDate(newCustomer.date)
      : formatCustomerDate(new Date().toISOString().slice(0, 10));

    const customerToAdd: Omit<Customer, "id" | "createdAt"> = {
      name: newCustomer.name,
      tc: newCustomer.tc.replace(/\D/g, ""),
      phone: newCustomer.phone?.replace(/\D/g, "") || "",
      soldItem: newCustomer.soldItem || "",
      boughtItem: newCustomer.boughtItem || "",
      total: Number(newCustomer.total || 0),
      paid: Number(newCustomer.paid || 0),
      debt: Number(newCustomer.debt || 0),
      date: dateForDB,
    };

    try {
      await addCustomer(customerToAdd);
      enqueueSnackbar("Yeni müşteri başarıyla eklendi!", {
        variant: "success",
      });
      setIsAddModalOpen(false);
      setNewCustomer({
        name: "",
        tc: "",
        phone: "",
        debt: 0,
        total: 0,
        paid: 0,
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      console.error("Müşteri ekleme başarısız:", error);
      enqueueSnackbar("Müşteri eklenirken bir hata oluştu.", {
        variant: "error",
      });
    }
  };

  const groupByName = (data: Customer[]) => {
    const groups: { [key: string]: Customer[] } = {};
    data.forEach((item) => {
      if (!groups[item.name]) {
        groups[item.name] = [];
      }
      groups[item.name].push(item);
    });
    return groups;
  };

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.tc.toLowerCase().includes(term) ||
      (customer.phone?.toLowerCase().includes(term) ?? false) ||
      (customer.soldItem?.toLowerCase().includes(term) ?? false) ||
      (customer.boughtItem?.toLowerCase().includes(term) ?? false)
    );
  });

  const groupedCustomers = groupByName(filteredCustomers);

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1200, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Müşteri Yönetimi 👤
        </Typography>

        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            label="Ara (Ad, T.C., Tel, Ürün)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ maxWidth: 300 }}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusIcon />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Müşteri Ekle
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableBody>
              {Object.entries(groupedCustomers).length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Arama kriterlerinize uygun müşteri bulunamadı.
                  </TableCell>
                </TableRow>
              )}
              {Object.entries(groupedCustomers).map(([name, entries]) => (
                <React.Fragment key={name}>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ backgroundColor: "#f5f5f5" }}>
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
                          {name}{" "}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0 }}>
                      <Collapse
                        in={expandedName === name}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Ad Soyad</TableCell>
                              <TableCell>T.C. No</TableCell>
                              <TableCell>Telefon</TableCell>
                              <TableCell>Son Satın Alınan Ürün</TableCell>
                              <TableCell>Son Satılan Ürün</TableCell>
                              <TableCell>Toplam İşlem (TL)</TableCell>
                              <TableCell>Toplam Ödenen (TL)</TableCell>
                              <TableCell>Kalan Borç/Alacak (TL)</TableCell>
                              <TableCell>Son İşlem Tarihi</TableCell>
                              <TableCell>İşlemler</TableCell>
                            </TableRow>
                          </TableHead>
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
                                      inputProps={{ maxLength: 11 }}
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
                                      type="tel"
                                      inputProps={{ maxLength: 11 }}
                                    />
                                  ) : (
                                    customer.phone || "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editId === customer.id ? (
                                    <TextField
                                      value={editCustomer.boughtItem}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          boughtItem: e.target.value,
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    customer.boughtItem || "-"
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

                                <TableCell>
                                  {editId === customer.id ? (
                                    <TextField
                                      type="number"
                                      value={editCustomer.total}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          total: Number(e.target.value),
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    Number(customer.total || 0).toFixed(2) +
                                    " ₺"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {editId === customer.id ? (
                                    <TextField
                                      type="number"
                                      value={editCustomer.paid}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          paid: Number(e.target.value),
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    Number(customer.paid || 0).toFixed(2) + " ₺"
                                  )}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {editId === customer.id ? (
                                    <TextField
                                      type="number"
                                      value={editCustomer.debt}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          debt: Number(e.target.value),
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    Number(customer.debt || 0).toFixed(2) + " ₺"
                                  )}
                                </TableCell>

                                <TableCell>
                                  {editId === customer.id ? (
                                    <TextField
                                      value={editCustomer.date}
                                      type="date"
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          date: e.target.value,
                                        })
                                      }
                                      size="small"
                                    />
                                  ) : (
                                    formatCustomerDate(customer.date)
                                  )}
                                </TableCell>

                                <TableCell align="center" sx={{ p: 0 }}>
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
                                        onClick={() =>
                                          setDeleteId(customer.id!)
                                        }
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
              Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
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

        <Dialog
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
          <DialogContent dividers>
            <Box component="form" noValidate autoComplete="off">
              <TextField
                autoFocus
                margin="dense"
                label="Ad Soyad (*)"
                type="text"
                fullWidth
                required
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="T.C. Kimlik No (*)"
                type="text"
                fullWidth
                required
                inputProps={{ maxLength: 11 }}
                value={newCustomer.tc}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    tc: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
              />
              <TextField
                margin="dense"
                label="Telefon No"
                type="tel"
                fullWidth
                inputProps={{ maxLength: 11 }}
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
              />
              <TextField
                margin="dense"
                label="Son Satılan Ürün"
                type="text"
                fullWidth
                value={newCustomer.soldItem}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, soldItem: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Son Satın Alınan Ürün"
                type="text"
                fullWidth
                value={newCustomer.boughtItem}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, boughtItem: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Son İşlem Tarihi"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newCustomer.date}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, date: e.target.value })
                }
              />

              <TextField
                margin="dense"
                label="Kalan Borç/Alacak (TL)"
                type="number"
                fullWidth
                sx={{
                  mt: 2,
                  ".MuiInputBase-input": {
                    fontSize: "1rem",
                  },
                }}
                value={newCustomer.debt}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    debt: Number(e.target.value),
                  })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddModalOpen(false)} color="secondary">
              İptal
            </Button>
            <Button
              onClick={handleAddNewCustomer}
              color="primary"
              variant="contained"
            >
              Müşteriyi Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CustomerPage;
