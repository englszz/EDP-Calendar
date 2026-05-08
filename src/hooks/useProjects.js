import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'projects'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addProject = (data) =>
    addDoc(collection(db, 'projects'), {
      ...data,
      uid: user.uid,
      progress: 0,
      status: 'active',
      createdAt: serverTimestamp(),
    });

  const updateProject = (id, data) => updateDoc(doc(db, 'projects', id), data);
  const deleteProject = (id) => deleteDoc(doc(db, 'projects', id));

  return { projects, loading, addProject, updateProject, deleteProject };
};
