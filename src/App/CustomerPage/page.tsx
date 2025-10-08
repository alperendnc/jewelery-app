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
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Customer } from "src/contexts/UseAuth";
import { useAuth } from "src/contexts/UseAuth";
import { useSnackbar } from "notistack";

const CustomerPage = () => {
  const { updateCustomer, deleteCustomer, listenCustomers } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<Partial<Customer>>({
    name: "",
    tc: "",
    // phone alanı zaten burada tanımlı, ancak boş kalmasın diye ekledim.
    phone: "",
    soldItem: "",
    total: 0,
    paid: 0,
    debt: 0,
    date: "",
  });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = listenCustomers((data) => setCustomers(data));
    return () => unsubscribe();
  }, [listenCustomers]);

  const handleDelete = async (id: string) => {
    await deleteCustomer(id);
    enqueueSnackbar("Müşteri silindi", { variant: "info" });
    setDeleteId(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditId(customer.id!);
    setEditCustomer({
      name: customer.name || "",
      tc: customer.tc || "",
      // 🎉 Mevcut müşteri verisinden phone alanını alıyoruz
      phone: customer.phone || "",
      soldItem: customer.soldItem || "",
      total: customer.total || 0,
      paid: customer.paid || 0,
      debt: customer.debt || 0,
      date:
        typeof customer.date === "object" &&
        customer.date !== null &&
        "toDate" in customer.date
          ? customer.date.toDate().toISOString().slice(0, 10)
          : customer.date?.toString().slice(0, 10) || "",
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
        phone: "", // reset
        soldItem: "",
        total: 0,
        paid: 0,
        debt: 0,
        date: "",
      });
    } catch (error) {
      console.error("Müşteri güncelleme başarısız:", error);
      enqueueSnackbar("Güncelleme başarısız", { variant: "error" });
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
      (customer.soldItem?.toLowerCase().includes(term) ?? false)
    );
  });

  const groupedCustomers = groupByName(filteredCustomers);

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 1100, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Müşteri Yönetimi 👤
        </Typography>

        <Box mb={3}>
          <TextField
            label="Ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
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
                    {/* colSpan'ı 9'dan 10'a çıkardık */}
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
                          {name}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {/* colSpan'ı 9'dan 10'a çıkardık */}
                    <TableCell colSpan={10} sx={{ p: 0 }}>
                      {" "}
                      <Collapse
                        in={expandedName === name}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Ad Soyad</TableCell>
                              <TableCell>T.C.</TableCell>
                              {/* 🎉 Yeni Telefon Sütunu */}
                              <TableCell>Telefon</TableCell>
                              <TableCell>Son Alışveriş</TableCell>
                              <TableCell>Toplam Satış Tutarı (TL)</TableCell>
                              <TableCell>Toplam Ödenen (TL)</TableCell>
                              <TableCell>Kalan Borç (TL)</TableCell>
                              <TableCell>Tarih</TableCell>
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
                                    />
                                  ) : (
                                    customer.tc
                                  )}
                                </TableCell>
                                {/* 🎉 Telefon Alanı Gösterimi ve Düzenlemesi */}
                                <TableCell>
                                  {editId === customer.id ? (
                                    <TextField
                                      value={editCustomer.phone}
                                      onChange={(e) =>
                                        setEditCustomer({
                                          ...editCustomer,
                                          phone: e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 11), // Telefon numarası kısıtlaması (örneğin 11 hane)
                                        })
                                      }
                                      size="small"
                                      type="tel"
                                    />
                                  ) : (
                                    customer.phone || "-"
                                  )}
                                </TableCell>
                                {/* 🎉 Telefon Alanı Bitti */}
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
                                    customer.total || "0.00"
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
                                    customer.paid?.toFixed(2) || "0.00"
                                  )}
                                </TableCell>
                                <TableCell>
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
                                    customer.debt?.toFixed(2) || "0.00"
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
                                  ) : typeof customer.date === "object" &&
                                    customer.date !== null &&
                                    "toDate" in customer.date ? (
                                    customer.date.toDate().toLocaleDateString()
                                  ) : (
                                    customer.date || "-"
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
