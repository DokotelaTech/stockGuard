import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp
} from "firebase/firestore";

import { db, auth } from "./firebaseConfig";

const inventoryCollection = collection(db, "inventory");

// GET MEDICINES
export const getMedicines = async () => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not authenticated");
    }

    const q = query(
        inventoryCollection,
        where("createdBy", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
};

// ADD MEDICINE
export const addMedicine = async (medicine) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not authenticated");
    }

    return await addDoc(inventoryCollection, {
        ...medicine,
        quantity: Number(medicine.quantity),
        unitPrice: Number(medicine.unitPrice),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

// UPDATE MEDICINE
export const updateMedicine = async (id, medicine) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User is not authenticated");
    }

    const medicineRef = doc(db, "inventory", id);

    await updateDoc(medicineRef, {
        ...medicine,
        quantity: Number(medicine.quantity),
        unitPrice: Number(medicine.unitPrice),
        updatedAt: serverTimestamp()
    });
};

// DELETE MEDICINE
export const deleteMedicine = async (id) => {
    const medicineRef = doc(db, "inventory", id);

    await deleteDoc(medicineRef);
};