import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from "@mui/material";
import { useAuth } from "src/contexts/UseAuth";

type StockItem = {
  id: string;
  name: string;
  adet: number;
};

const categories = [
  "22 Bilezik",
  "Ata Altın",
  "Reşat Altın",
  "14 Takı",
  "24 Ayar",
  "22 Ayar",
  "22 Takı",
];

const StockPage = () => {
  const { getProducts, addProduct, updateProduct } = useAuth();

  const [stock, setStock] = useState<StockItem[]>([]);
  const [inputAdetleri, setInputAdetleri] = useState<{
    [name: string]: string;
  }>({});

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      const filtered = products.filter((p: any) => categories.includes(p.name));
      const mapped = filtered.map((p: any) => ({
        id: p.id || "",
        name: p.name,
        adet: p.stock,
      }));
      setStock(mapped);

      const adetObj: { [name: string]: string } = {};
      categories.forEach((cat) => {
        const found = mapped.find((item) => item.name === cat);
        adetObj[cat] = found ? found.adet.toString() : "";
      });
      setInputAdetleri(adetObj);
    }
    fetchProducts();
  }, [getProducts]);

  const handleInputChange = (name: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setInputAdetleri((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (name: string) => {
    const value = inputAdetleri[name];
    if (value === undefined || value === "" || isNaN(Number(value))) return;

    const existing = stock.find((item) => item.name === name);

    if (existing) {
      await updateProduct(existing.id, { stock: Number(value) });
    } else {
      await addProduct({
        name: name,
        gram: 0,
        price: 0,
        stock: Number(value),
      });
    }

    const updated = await getProducts();
    const filtered = updated.filter((p: any) => categories.includes(p.name));
    const mapped = filtered.map((p: any) => ({
      id: p.id || "",
      name: p.name,
      adet: p.stock,
    }));
    setStock(mapped);
  };

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} mb={3} align="center">
          Stok Yönetimi
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {categories.map((cat) => {
                const currentStock = stock.find((item) => item.name === cat);
                return (
                  <TableRow key={cat}>
                    <TableCell sx={{ fontWeight: "bold" }}>{cat}</TableCell>
                    <TableCell>
                      Mevcut: {currentStock ? currentStock.adet : 0}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={inputAdetleri[cat] || ""}
                        onChange={(e) => handleInputChange(cat, e.target.value)}
                        inputProps={{ min: 0 }}
                        placeholder="Adet gir"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSave(cat)}
                      >
                        Kaydet / Güncelle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StockPage;
