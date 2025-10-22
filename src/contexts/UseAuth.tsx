import {
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
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";

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
  customerName: string;
  customerId?: string;
  productName: string;
  quantity: number;
  total: number;
  paid: number;
  date: string;
  debt?: number;
  paymentMethod?: "Nakit" | "IBAN" | "Pos";
  customer?: Omit<Customer, "id" | "createdAt">;
  boughtItem?: string;
}

export interface Customer {
  id?: string;
  name: string;
  tc: string;
  phone?: string;
  quantity?: number;
  total?: string | number;
  soldItem?: string;
  boughtItem?: string;
  paid?: number;
  debt?: number;
  date?: string | Timestamp;
  createdAt?: Date;
}
export interface SupplierTransaction {
  id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  total: number;
  paid: number;
  date: string;
  paymentMethod?: "Nakit" | "IBAN" | "Pos";
}

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  paid?: number;
  customerId?: string;
  customerName?: string;
  quantity: number;
  total: number;
  date: string | Timestamp;
  customer?: Omit<Customer, "id" | "createdAt">;
  paymentMethod?: "Nakit" | "IBAN" | "Pos";
}

export interface Transaction {
  id: string;
  type: "Alış" | "Satış";
  description: string;
  amount: number;
  date: string;
  method: "Nakit" | "Kredi Kartı" | "Pos";
}

export interface CurrencyTransaction {
  id?: string;
  name: string;
  tc: string;
  amount: number;
  paid: number;
  rate: number;
  type: string;
  date: string;
  total: number;
}

export interface DailyCashRecord {
  id: string;
  date: string;
  initialCash: number;
  finalCash: number;
  totalMovement: number;
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
  addSupplierTransaction: (
    transaction: Omit<SupplierTransaction, "id">
  ) => Promise<void>;
  getSupplierTransactions: () => Promise<SupplierTransaction[]>;
  deleteSupplierTransaction: (id: string) => Promise<void>;
  updateSupplierTransaction: (
    id: string,
    updatedFields: Partial<SupplierTransaction>
  ) => Promise<void>;
  addSale: (sale: Omit<Sale, "id">) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  updateSale: (id: string, updatedFields: Partial<Sale>) => Promise<void>;
  getSales: () => Promise<Sale[]>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  getTransactions: () => Promise<Transaction[]>;
  updateTransaction: (
    id: string,
    updatedFields: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addPurchases: (purchase: Omit<Purchase, "id">) => Promise<void>;
  getPurchases: () => Promise<Purchase[]>;
  updatePurchase: (id: string, data: Omit<Purchase, "id">) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  decreaseStockByOne: (productId: string) => Promise<void>;
  increaseStockByOne: (productId: string) => Promise<void>;
  currentUser: User | null;
  signUp: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
  addCurrencyTransaction: (
    transaction: Omit<CurrencyTransaction, "id">
  ) => Promise<void>;
  getCurrencyTransactions: () => Promise<CurrencyTransaction[]>;
  deleteCurrencyTransaction: (id: string) => Promise<void>;
  updateCurrencyTransaction: (
    id: string,
    updatedFields: Partial<CurrencyTransaction>
  ) => Promise<void>;

  getInitialCash: () => Promise<number>;
  setInitialCash: (value: number) => Promise<void>;
  getDailyCashRecords: () => Promise<DailyCashRecord[]>;
  addOrUpdateDailyCashRecord: (record: DailyCashRecord) => Promise<void>;
  deleteDailyCashRecord: (id: string) => Promise<void>;
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

  const formatDateToDB = (
    date: string | Timestamp | Date | undefined
  ): string => {
    if (!date) return "";

    let d: Date;

    if (date instanceof Timestamp) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else if (typeof date === "string") {
      if (/^\d{2}-\d{2}-\d{4}T\d{2}:\d{2}:\d{2}$/.test(date)) {
        const [datePart] = date.split("T");
        const [day, month, year] = datePart.split("-");
        d = new Date(`${year}-${month}-${day}T00:00:00`);
      } else if (!isNaN(Date.parse(date))) {
        d = new Date(date);
      } else {
        return "";
      }
    } else {
      return "";
    }

    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDateToDDMMYYYY = (
    date: string | Timestamp | Date | undefined
  ): string => {
    const yyyymmdd = formatDateToDB(date);
    if (!yyyymmdd) return "";

    const [year, month, day] = yyyymmdd.split("-");

    return `${day}-${month}-${year}`;
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    await addDoc(collection(db, "products"), {
      ...product,
      createdAt: new Date(),
    });
  };

  const addSupplierTransaction = async (
    transaction: Omit<SupplierTransaction, "id">
  ) => {
    const ref = collection(db, "supplierTransactions");
    await addDoc(ref, {
      ...transaction,
      date: formatDateToDB(transaction.date),
      paymentMethod: transaction.paymentMethod || "Nakit",
    });
  };
  const getSupplierTransactions = async (): Promise<SupplierTransaction[]> => {
    const querySnapshot = await getDocs(collection(db, "supplierTransactions"));
    return querySnapshot.docs.map((doc) => {
      const { id, ...restOfData } = doc.data() as SupplierTransaction;
      return {
        id: doc.id,
        ...restOfData,
        date: formatDateToDDMMYYYY(restOfData.date),
      };
    }) as SupplierTransaction[];
  };

  const deleteSupplierTransaction = async (id: string) => {
    await deleteDoc(doc(db, "supplierTransactions", id));
  };
  const updateSupplierTransaction = async (
    id: string,
    updatedFields: Partial<SupplierTransaction>
  ) => {
    const ref = doc(db, "supplierTransactions", id);
    if (updatedFields.date) {
      updatedFields.date = formatDateToDB(updatedFields.date);
    }
    await setDoc(ref, updatedFields, { merge: true });
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

  const decreaseStockByOne = async (productId: string) => {
    const products = await getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock === undefined || product.stock <= 0) return;
    await updateProduct(product.id!, { stock: product.stock - 1 });
  };

  const increaseStockByOne = async (productId: string) => {
    const products = await getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock === undefined) return;
    await updateProduct(product.id!, { stock: product.stock + 1 });
  };

  const addCustomer = async (customer: Omit<Customer, "id" | "createdAt">) => {
    await addDoc(collection(db, "customers"), {
      ...customer,
      createdAt: new Date(),
    });
  };
  const getCustomers = async (): Promise<Customer[]> => {
    const querySnapshot = await getDocs(collection(db, "customers"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Customer),
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
    const standardizedDate = formatDateToDB(sale.date);

    await addDoc(collection(db, "sales"), {
      ...sale,
      date: standardizedDate,
    });

    await addDoc(collection(db, "transactions"), {
      type: "Satış",
      description: `${sale.productName} satışı`,
      amount: sale.total,
      date: standardizedDate,
      method: sale.paymentMethod || "Nakit",
    });

    if (sale.customerId || sale.customer) {
      let customerDocRef;
      let currentCustomerData: Customer | undefined;

      if (sale.customerId) {
        customerDocRef = doc(db, "customers", sale.customerId);
        const customerDocSnap = await getDoc(customerDocRef);
        if (customerDocSnap.exists()) {
          currentCustomerData = customerDocSnap.data() as Customer;
        }
      } else if (sale.customer && sale.customer.tc) {
        const customersCollection = collection(db, "customers");
        const snapshot = await getDocs(customersCollection);
        const existingCustomerDoc = snapshot.docs.find(
          (d) => (d.data() as Customer).tc === sale.customer?.tc
        );

        if (existingCustomerDoc) {
          customerDocRef = doc(db, "customers", existingCustomerDoc.id);
          currentCustomerData = existingCustomerDoc.data() as Customer;
        } else {
          customerDocRef = doc(collection(db, "customers"));
          currentCustomerData = {
            name: sale.customer.name,
            tc: sale.customer.tc,
            phone: sale.customer.phone,
            createdAt: new Date(),
            debt: 0,
          };
        }
      }

      if (customerDocRef && currentCustomerData) {
        const currentDebt = currentCustomerData.debt || 0;
        const saleAmount = sale.total || 0;
        const paidAmount = sale.paid || 0;

        const newDebt = currentDebt + saleAmount - paidAmount;

        await setDoc(
          customerDocRef,
          {
            ...currentCustomerData,
            soldItem: sale.productName,
            total: sale.total,
            paid: sale.paid,
            debt: newDebt,
            date: standardizedDate,
          },
          { merge: true }
        );
      }
    }

    const productsSnapshot = await getDocs(collection(db, "products"));
    const productDoc = productsSnapshot.docs.find(
      (doc) => (doc.data() as Product).name === sale.productName
    );

    if (!productDoc) {
      throw new Error("Satılan ürün stokta bulunamadı.");
    }

    const currentStock = (productDoc.data() as Product).stock || 0;
    const newStock = currentStock - sale.quantity;

    if (newStock < 0) {
      throw new Error("Stok yetersiz!");
    }

    const ref = doc(db, "products", productDoc.id);
    await setDoc(ref, { stock: newStock }, { merge: true });
  };

  const deleteSale = async (id: string) => {
    await deleteDoc(doc(db, "sales", id));
  };
  const updateSale = async (id: string, updatedFields: Partial<Sale>) => {
    const ref = doc(db, "sales", id);
    if (updatedFields.date) {
      updatedFields.date = formatDateToDB(updatedFields.date);
    }
    await setDoc(ref, updatedFields, { merge: true });
  };

  const getSales = async (): Promise<Sale[]> => {
    const snapshot = await getDocs(collection(db, "sales"));
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Sale;
      return {
        ...data,
        id: doc.id,
        date: formatDateToDDMMYYYY(data.date),
      };
    });
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    await addDoc(collection(db, "transactions"), {
      ...transaction,
      date: formatDateToDB(transaction.date),
    });
  };

  const getTransactions = async (): Promise<Transaction[]> => {
    const snapshot = await getDocs(collection(db, "transactions"));
    return snapshot.docs.map((doc) => {
      const { id, ...restOfData } = doc.data() as Transaction;
      return {
        id: doc.id,
        ...restOfData,
        date: formatDateToDDMMYYYY(restOfData.date),
      };
    });
  };

  const updateTransaction = async (
    id: string,
    updatedFields: Partial<Transaction>
  ) => {
    const ref = doc(db, "transactions", id);
    if (updatedFields.date) {
      updatedFields.date = formatDateToDB(updatedFields.date);
    }
    await setDoc(ref, updatedFields, { merge: true });
  };

  const deleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  const getPurchases = async (): Promise<Purchase[]> => {
    const snapshot = await getDocs(collection(db, "purchases"));
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Purchase;
      return {
        ...data,
        id: doc.id,
        date: formatDateToDDMMYYYY(data.date),
      };
    });
  };

  const updatePurchase = async (id: string, data: Omit<Purchase, "id">) => {
    const docRef = doc(db, "purchases", id);
    await setDoc(docRef, {
      ...data,
      date: formatDateToDB(data.date),
    });
  };

  const deletePurchase = async (id: string) => {
    await deleteDoc(doc(db, "purchases", id));
  };

  const addPurchases = async (purchase: Omit<Purchase, "id">) => {
    const standardizedDate = formatDateToDB(purchase.date);

    await addDoc(collection(db, "purchases"), {
      ...purchase,
      date: standardizedDate,
    });

    await addDoc(collection(db, "transactions"), {
      type: "Alış",
      description: `${purchase.customerName} - ${purchase.productName} alım`,
      amount: purchase.paid,
      date: standardizedDate,
      method: purchase.paymentMethod || "Nakit",
    });

    if (purchase.customerId || purchase.customer) {
      let customerDocRef;
      let currentCustomerData;

      if (purchase.customerId) {
        customerDocRef = doc(db, "customers", purchase.customerId);
        const customerDocSnap = await getDoc(customerDocRef);
        if (customerDocSnap.exists()) {
          currentCustomerData = customerDocSnap.data() as Customer;
        }
      } else if (purchase.customer && purchase.customer.tc) {
        const customersCollection = collection(db, "customers");
        const snapshot = await getDocs(customersCollection);
        const existingCustomerDoc = snapshot.docs.find(
          (d) => (d.data() as Customer).tc === purchase.customer?.tc
        );

        if (existingCustomerDoc) {
          customerDocRef = doc(db, "customers", existingCustomerDoc.id);
          currentCustomerData = existingCustomerDoc.data() as Customer;
        } else {
          customerDocRef = doc(collection(db, "customers"));
          currentCustomerData = {
            name: purchase.customer.name,
            boughtItem: purchase.productName,
            tc: purchase.customer.tc,
            phone: purchase.customer.phone,
            createdAt: new Date(),
            debt: 0,
          };
        }
      }

      if (customerDocRef && currentCustomerData) {
        const currentDebt = currentCustomerData.debt || 0;
        const purchaseTotal = purchase.total || 0;
        const paidAmount = purchase.paid || 0;

        const newDebt = currentDebt - (purchaseTotal - paidAmount);

        await setDoc(
          customerDocRef,
          {
            ...currentCustomerData,
            soldItem: purchase.productName,
            boughtItem: purchase.productName,
            total: purchase.total,
            paid: purchase.paid,
            debt: newDebt,
            date: standardizedDate,
          },
          { merge: true }
        );
      }
    }

    const products = await getProducts();
    const product = products.find((p) => p.name === purchase.productName);
    if (product) {
      const newStock = product.stock + purchase.quantity;
      await updateProduct(product.id!, { stock: newStock });
    }
  };

  const addCurrencyTransaction = async (
    transaction: Omit<CurrencyTransaction, "id">
  ) => {
    await addDoc(collection(db, "currencyTransactions"), {
      ...transaction,
      date: formatDateToDB(transaction.date),
    });
  };

  const getCurrencyTransactions = async (): Promise<CurrencyTransaction[]> => {
    const snapshot = await getDocs(collection(db, "currencyTransactions"));
    return snapshot.docs.map((doc) => {
      const data = doc.data() as CurrencyTransaction;
      return {
        ...data,
        id: doc.id,
        date: formatDateToDDMMYYYY(data.date),
      };
    });
  };
  const deleteCurrencyTransaction = async (id: string) => {
    await deleteDoc(doc(db, "currencyTransactions", id));
  };
  const updateCurrencyTransaction = async (
    id: string,
    updatedFields: Partial<CurrencyTransaction>
  ) => {
    const ref = doc(db, "currencyTransactions", id);
    if (updatedFields.date) {
      updatedFields.date = formatDateToDB(updatedFields.date);
    }
    await setDoc(ref, updatedFields, { merge: true });
  };

  const cashDocRefForUser = (uid: string) => doc(db, "cash", uid);
  const dailyRecordsCollectionForUser = (uid: string) =>
    collection(db, "cash", uid, "dailyCashRecords");

  const getInitialCash = async (): Promise<number> => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) return 0;
    try {
      const snap = await getDoc(cashDocRefForUser(uid));
      if (!snap.exists()) return 0;
      const data = snap.data();
      return typeof data?.initialCash === "number" ? data.initialCash : 0;
    } catch (err) {
      console.error("getInitialCash error:", err);
      return 0;
    }
  };

  const setInitialCash = async (value: number) => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      await setDoc(
        cashDocRefForUser(uid),
        {
          initialCash: value,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("setInitialCash error:", err);
      throw err;
    }
  };

  const getDailyCashRecords = async (): Promise<DailyCashRecord[]> => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) return [];
    try {
      const qSnap = await getDocs(dailyRecordsCollectionForUser(uid));
      return qSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<DailyCashRecord, "id">),
      }));
    } catch (err) {
      console.error("getDailyCashRecords error:", err);
      return [];
    }
  };

  const addOrUpdateDailyCashRecord = async (record: DailyCashRecord) => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      const ref = doc(dailyRecordsCollectionForUser(uid), record.id);
      await setDoc(
        ref,
        {
          date: record.date,
          initialCash: record.initialCash,
          finalCash: record.finalCash,
          totalMovement: record.totalMovement,
        },
        { merge: true }
      );
    } catch (err) {
      console.error("addOrUpdateDailyCashRecord error:", err);
      throw err;
    }
  };

  const deleteDailyCashRecord = async (id: string) => {
    const uid = auth.currentUser?.uid || currentUser?.uid;
    if (!uid) throw new Error("Kullanıcı giriş yapmamış.");
    try {
      const ref = doc(dailyRecordsCollectionForUser(uid), id);
      await deleteDoc(ref);
    } catch (err) {
      console.error("deleteDailyCashRecord error:", err);
      throw err;
    }
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
        deleteSale,
        updateSale,
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
        decreaseStockByOne,
        increaseStockByOne,
        addSupplierTransaction,
        getSupplierTransactions,
        deleteSupplierTransaction,
        updateSupplierTransaction,
        addCurrencyTransaction,
        getCurrencyTransactions,
        deleteCurrencyTransaction,
        updateCurrencyTransaction,

        getInitialCash,
        setInitialCash,
        getDailyCashRecords,
        addOrUpdateDailyCashRecord,
        deleteDailyCashRecord,
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
