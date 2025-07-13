import React, {
  useContext,
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export interface Product {
  id?: string;
  name: string;
  gram: number;
  price: number;
  stock: number;
  createdAt?: Date;
}
export interface Purchase {
  id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  total: number;
  paid: number;
  date: string;
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
  customer?: Omit<Customer, "id" | "createdAt">;
}

export interface Transaction {
  id: string;
  type: "Giriş" | "Çıkış";
  description: string;
  amount: number;
  date: string;
  method: "Nakit" | "Kredi Kartı" | "Post";
}

interface AuthContextType {
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  getProducts: () => Promise<Product[]>;
  updateProduct: (id: string, updatedFields: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  getCustomers: () => Promise<Customer[]>;
  updateCustomer: (
    id: string,
    updatedFields: Partial<Customer>
  ) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  listenCustomers: (callback: (customers: Customer[]) => void) => () => void;

  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  getSales: () => Promise<Sale[]>;

  getPurchases: () => Promise<Purchase[]>;
  updatePurchase: (id: string, data: Omit<Purchase, "id">) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  addPurchases: (purchase: Omit<Purchase, "id">) => Promise<void>;

  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  getTransactions: () => Promise<Transaction[]>;
  updateTransaction: (
    id: string,
    updatedFields: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  currentUser: User | null;
  signUp: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => userCredential.user
    );

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password).then(
      (userCredential) => userCredential.user
    );

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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

  const listenCustomers = (callback: (customers: Customer[]) => void) => {
    const q = collection(db, "customers");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Customer),
        id: doc.id,
      }));
      callback(data);
    });
    return unsubscribe;
  };

  const addSale = async (sale: Omit<Sale, "id">) => {
    await addDoc(collection(db, "sales"), sale);
    if (sale.customer) {
      const snapshot = await getDocs(collection(db, "customers"));
      const exists = snapshot.docs.some(
        (doc) => doc.data().tc === sale.customer?.tc
      );

      if (!exists) {
        await addDoc(collection(db, "customers"), {
          ...sale.customer,
          soldItem: sale.productName,
          createdAt: new Date(),
        });
      }
    }
  };

  const getSales = async (): Promise<Sale[]> => {
    const snapshot = await getDocs(collection(db, "sales"));
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Sale),
      id: doc.id,
    }));
  };

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

  const getPurchases = async (): Promise<Purchase[]> => {
    const snapshot = await getDocs(collection(db, "purchases"));
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Purchase)
    );
  };
  const updatePurchase = async (id: string, data: Omit<Purchase, "id">) => {
    const docRef = doc(db, "purchases", id);
    await setDoc(docRef, data);
  };
  const deletePurchase = async (id: string) => {
    await deleteDoc(doc(db, "purchases", id));
  };

  const addPurchases = async (purchase: Omit<Purchase, "id">) => {
    await addDoc(collection(db, "purchases"), {
      ...purchase,
      date: new Date().toISOString(),
    });
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
        listenCustomers,
        addSale,
        getSales,
        addTransaction,
        getTransactions,
        updateTransaction,
        deleteTransaction,
        currentUser,
        signUp,
        login,
        logout,
        loading,
        addPurchases,
        getPurchases,
        updatePurchase,
        deletePurchase,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
