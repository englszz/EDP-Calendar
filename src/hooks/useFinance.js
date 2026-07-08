import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { format } from 'date-fns';

export const DEFAULT_CATEGORIES = [
  { value: 'comida',      label: 'Comida',      icon: 'fa-utensils',          color: '#f59e0b' },
  { value: 'transporte',  label: 'Transporte',  icon: 'fa-bus',               color: '#3b82f6' },
  { value: 'universidad', label: 'Universidad', icon: 'fa-graduation-cap',    color: '#8b5cf6' },
  { value: 'salidas',     label: 'Salidas',     icon: 'fa-champagne-glasses', color: '#ec4899' },
  { value: 'servicios',   label: 'Servicios',   icon: 'fa-bolt',              color: '#f97316' },
  { value: 'salud',       label: 'Salud',       icon: 'fa-heart-pulse',       color: '#10b981' },
  { value: 'ropa',        label: 'Ropa',        icon: 'fa-shirt',             color: '#06b6d4' },
];

export const getCategoryInfo = (value, customCategories = []) => {
  const all = [...DEFAULT_CATEGORIES, ...customCategories];
  return all.find(c => c.value === value) || { value, label: value, icon: 'fa-tag', color: '#6b7280' };
};

export const useFinance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgetsState] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [savingGoals, setSavingGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (!user) return;

    const tQuery = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );
    const bQuery = query(collection(db, 'budgets'), where('uid', '==', user.uid));
    const rQuery = query(
      collection(db, 'recurring'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const cQuery = query(collection(db, 'categories'), where('uid', '==', user.uid));
    const sQuery = query(collection(db, 'savingGoals'), where('uid', '==', user.uid));

    const unsubT = onSnapshot(tQuery, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubB = onSnapshot(bQuery, snap => setBudgetsState(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubR = onSnapshot(rQuery, snap => setRecurring(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubC = onSnapshot(cQuery, snap => setCustomCategories(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubS = onSnapshot(sQuery, snap => {
      setSavingGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubT(); unsubB(); unsubR(); unsubC(); unsubS(); };
  }, [user]);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  // Transactions
  const addTransaction = async (data) => {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...data, uid: user.uid, createdAt: serverTimestamp()
    });

    // Si es recurrente, crear también en recurring automáticamente
    if (data.isRecurring) {
      const cat = allCategories.find(c => c.value === data.category);
      await addDoc(collection(db, 'recurring'), {
        uid: user.uid,
        name: data.description || cat?.label || data.category,
        amount: data.amount,
        category: data.category,
        dueDay: data.dueDay || new Date().getDate(),
        frequency: data.frequency || 'monthly',
        status: 'paid', // ya se pagó porque se está registrando ahora
        transactionId: docRef.id,
        createdAt: serverTimestamp(),
      });
    }

    return docRef;
  };

  const updateTransaction = (id, data) => updateDoc(doc(db, 'transactions', id), data);
  const deleteTransaction = (id) => deleteDoc(doc(db, 'transactions', id));

  // Budgets
  const setBudget = async (category, amount) => {
    const existing = budgets.find(b => b.category === category && b.month === currentMonth);
    if (existing) return updateDoc(doc(db, 'budgets', existing.id), { amount: Number(amount) });
    return addDoc(collection(db, 'budgets'), {
      uid: user.uid, category, amount: Number(amount), month: currentMonth
    });
  };

  const getBudget = (category) => {
    const b = budgets.find(b => b.category === category && b.month === currentMonth);
    return b ? b.amount : 0;
  };

  const deleteBudget = (category) => {
    const existing = budgets.find(b => b.category === category && b.month === currentMonth);
    if (existing) return deleteDoc(doc(db, 'budgets', existing.id));
  };

  // Recurring
  const addRecurring = (data) =>
    addDoc(collection(db, 'recurring'), {
      ...data, uid: user.uid, status: 'pending', createdAt: serverTimestamp()
    });
  const updateRecurring = (id, data) => updateDoc(doc(db, 'recurring', id), data);
  const deleteRecurring = (id) => deleteDoc(doc(db, 'recurring', id));

  // Custom categories
  const addCategory = (data) =>
    addDoc(collection(db, 'categories'), { ...data, uid: user.uid, createdAt: serverTimestamp() });
  const deleteCategory = (id) => deleteDoc(doc(db, 'categories', id));

  // Saving goals
  const addSavingGoal = (data) =>
    addDoc(collection(db, 'savingGoals'), {
      ...data,
      targetAmount: Number(data.targetAmount),
      savedAmount: Number(data.savedAmount || 0),
      uid: user.uid,
      createdAt: serverTimestamp(),
    });

  const updateSavingGoal = (id, data) => updateDoc(doc(db, 'savingGoals', id), data);
  const deleteSavingGoal = (id) => deleteDoc(doc(db, 'savingGoals', id));
  const contributeToSavingGoal = (goal, amount) =>
    updateDoc(doc(db, 'savingGoals', goal.id), {
      savedAmount: Number(goal.savedAmount || 0) + Number(amount),
    });

  // Computed
  const monthTransactions = transactions.filter(t => t.date?.startsWith(currentMonth));
  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0);

  const getSpentByCategory = (category) =>
    monthTransactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((a, t) => a + t.amount, 0);

  return {
    transactions, monthTransactions, budgets, recurring, savingGoals,
    customCategories, allCategories, loading,
    addTransaction, updateTransaction, deleteTransaction,
    setBudget, getBudget, deleteBudget,
    addRecurring, updateRecurring, deleteRecurring,
    addSavingGoal, updateSavingGoal, deleteSavingGoal, contributeToSavingGoal,
    addCategory, deleteCategory,
    totalExpenses, currentMonth, getSpentByCategory,
  };
};
