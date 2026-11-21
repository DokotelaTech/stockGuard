import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase.js";

const inventoryCollection = collection(db, "inventory");

function currentUserId() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before accessing inventory.");
  return user.uid;
}

function medicineFields(medicine) {
  return {
    medicineName: String(medicine.medicineName ?? "").trim(),
    category: String(medicine.category ?? "").trim(),
    batchNumber: String(medicine.batchNumber ?? "").trim(),
    manufacturer: String(medicine.manufacturer ?? "").trim(),
    quantity: Number(medicine.quantity),
    averageDailyUsage: Number(medicine.averageDailyUsage || 0),
    unitPrice: Number(medicine.unitPrice),
    manufactureDate: medicine.manufactureDate || "",
    expiryDate: medicine.expiryDate || "",
    supplier: String(medicine.supplier ?? "").trim(),
  };
}

async function ownedMedicineRef(id, userId) {
  const medicineRef = doc(db, "inventory", id);
  const snapshot = await getDoc(medicineRef);
  if (!snapshot.exists() || snapshot.data().createdBy !== userId) {
    throw new Error(
      "Medicine not found or you do not have permission to change it.",
    );
  }
  return medicineRef;
}

export async function getMedicines() {
  const userId = currentUserId();
  const snapshot = await getDocs(
    query(inventoryCollection, where("createdBy", "==", userId)),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function verifyMedicineBatch(batchNumber) {
  const userId = currentUserId();
  const normalizedBatchNumber = String(batchNumber ?? "").trim();
  if (!normalizedBatchNumber) return [];

  const batchQuery = query(
    inventoryCollection,
    where("batchNumber", "==", normalizedBatchNumber),
    where("createdBy", "==", userId),
  );
  const snapshot = await getDocs(batchQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function addMedicine(medicine) {
  const userId = currentUserId();
  return addDoc(inventoryCollection, {
    ...medicineFields(medicine),
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMedicine(id, medicine) {
  const userId = currentUserId();
  const medicineRef = await ownedMedicineRef(id, userId);
  return updateDoc(medicineRef, {
    ...medicineFields(medicine),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMedicine(id) {
  const userId = currentUserId();
  const medicineRef = await ownedMedicineRef(id, userId);
  return deleteDoc(medicineRef);
}
