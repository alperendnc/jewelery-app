import React, { useContext, createContext, ReactNode } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../config";

// Veri Tipleri
export interface Product {
  id?: string;
  name: string;
  gram: number;
  price: number;
  stock: number;
  createdAt?: Date;
}

export interface Customer {
  id?: string;
  name: string;
  tc: string;
  phone?: string;
  soldItem?: string;
  debt?: number;
  credit?: number;
  createdAt?: Date;
}

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerName?: string;
  quantity: number;
  total: number;
  date: string;
}

export interface Transaction {
  id: string;
  type: "Giriş" | "Çıkış";
  description: string;
  amount: number;
  date: string;
  method: "Nakit" | "Kredi Kartı" | "Post";
}

// Context Tipi
interface AuthContextType {
  // Product
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  getProducts: () => Promise<Product[]>;
  updateProduct: (id: string, updatedFields: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Customer
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  getCustomers: () => Promise<Customer[]>;
  updateCustomer: (
    id: string,
    updatedFields: Partial<Customer>
  ) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Sale
  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  getSales: () => Promise<Sale[]>;

  // Transaction
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  getTransactions: () => Promise<Transaction[]>;
  updateTransaction: (
    id: string,
    updatedFields: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Product İşlemleri
  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: new Date(),
    });
  };

  const getProducts = async (): Promise<Product[]> => {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Product),
      id: doc.id,
    }));
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const ref = doc(db, "products", id);
    await setDoc(ref, updatedFields, { merge: true });
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };

  // Customer İşlemleri
  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt">) => {
    await addDoc(collection(db, "customers"), {
      ...customer,
      createdAt: new Date(),
    });
  };

  const getCustomers = async (): Promise<Customer[]> => {
    const snapshot = await getDocs(collection(db, "customers"));
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Customer),
      id: doc.id,
    }));
  };

  const updateCustomer = async (
    id: string,
    updatedFields: Partial<Customer>
  ) => {
    const ref = doc(db, "customers", id);
    await setDoc(ref, updatedFields, { merge: true });
  };

  const deleteCustomer = async (id: string) => {
    await deleteDoc(doc(db, "customers", id));
  };

  // Sale İşlemleri
  const addSale = async (sale: Omit<Sale, "id">) => {
    await addDoc(collection(db, "sales"), sale);
  };

  const getSales = async (): Promise<Sale[]> => {
    const snapshot = await getDocs(collection(db, "sales"));
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Sale),
      id: doc.id,
    }));
  };

  // Transaction İşlemleri
  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    await addDoc(collection(db, "transactions"), transaction);
  };

  const getTransactions = async (): Promise<Transaction[]> => {
    const snapshot = await getDocs(collection(db, "transactions"));
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Transaction),
      id: doc.id,
    }));
  };

  const updateTransaction = async (
    id: string,
    updatedFields: Partial<Transaction>
  ) => {
    const ref = doc(db, "transactions", id);
    await setDoc(ref, updatedFields, { merge: true });
  };

  const deleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  return (
    <AuthContext.Provider
      value={{
        addProduct,
        getProducts,
        updateProduct,
        deleteProduct,
        addCustomer,
        getCustomers,
        updateCustomer,
        deleteCustomer,
        addSale,
        getSales,
        addTransaction,
        getTransactions,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
