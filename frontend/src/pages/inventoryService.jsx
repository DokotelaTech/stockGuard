import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    // writeBatch,
    serverTimestamp,
    query,
    where,
} from "firebase/firestore";


import { auth, db } from "../../firebase.js";
// import {  auth } from "./firebaseConfig";

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


// verifying the scanned product
export const verifyMedicineBatch = async (batchNumber) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("You must be logged in to verify a batch.");
    }

    const inventoryRef = collection(db, "inventory");

    const batchQuery = query(
        inventoryRef,
        where("batchNumber", "==", batchNumber.trim()),
        where("createdBy", "==", user.uid)
    );

    const snapshot = await getDocs(batchQuery);

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));

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