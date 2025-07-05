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
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useAuth, Product, Sale } from "src/contexts/UseAuth";

const ReportingPage = () => {
  const [tab, setTab] = useState(0);
  const { getProducts, getSales } = useAuth();

  const [stockReports, setStockReports] = useState<Product[]>([]);
  const [salesReports, setSalesReports] = useState<Sale[]>([]);

  useEffect(() => {
    async function fetchData() {
      const products = await getProducts();
      setStockReports(products);

      const sales = await getSales();
      setSalesReports(sales);
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

  return (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 700, borderRadius: 4 }}>
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
      </Paper>
    </Box>
  );
};

export default ReportingPage;
