import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addTask = (data) =>
    addDoc(collection(db, 'tasks'), {
      ...data,
      uid: user.uid,
      completed: false,
      createdAt: serverTimestamp(),
    });

  const updateTask = (id, data) => updateDoc(doc(db, 'tasks', id), data);
  const deleteTask = (id) => deleteDoc(doc(db, 'tasks', id));
  const toggleTask = (id, completed) => updateDoc(doc(db, 'tasks', id), { completed: !completed });

  return { tasks, loading, addTask, updateTask, deleteTask, toggleTask };
};
