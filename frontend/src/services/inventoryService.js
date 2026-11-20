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
  writeBatch,
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
    throw new Error("Medicine not found or you do not have permission to change it.");
  }
  return medicineRef;
}

export async function getMedicines() {
  const userId = currentUserId();
  const snapshot = await getDocs(query(inventoryCollection, where("createdBy", "==", userId)));
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

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const demoMedicines = [
  { id: "amoxicillin", medicineName: "Amoxicillin 500 mg", category: "Antibiotic", quantity: 85, averageDailyUsage: 12, unitPrice: 2.4, expiryInDays: 240 },
  { id: "metformin", medicineName: "Metformin 500 mg", category: "Chronic medication", quantity: 320, averageDailyUsage: 8, unitPrice: 1.1, expiryInDays: 365 },
  { id: "paracetamol", medicineName: "Paracetamol 500 mg", category: "Pain relief", quantity: 48, averageDailyUsage: 15, unitPrice: 0.8, expiryInDays: 210 },
  { id: "ors", medicineName: "Oral rehydration salts", category: "Rehydration", quantity: 120, averageDailyUsage: 20, unitPrice: 1.5, expiryInDays: 180 },
  { id: "artemether", medicineName: "Artemether/Lumefantrine 20/120 mg", category: "Antimalarial", quantity: 36, averageDailyUsage: 4, unitPrice: 5.9, expiryInDays: 150 },
  { id: "salbutamol", medicineName: "Salbutamol inhaler 100 mcg", category: "Respiratory", quantity: 22, averageDailyUsage: 2, unitPrice: 28, expiryInDays: 90 },
  { id: "ceftriaxone", medicineName: "Ceftriaxone 1 g injection", category: "Antibiotic", quantity: 18, averageDailyUsage: 3, unitPrice: 12.5, expiryInDays: 75 },
  { id: "insulin", medicineName: "Insulin NPH 100 IU/mL", category: "Chronic medication", quantity: 14, averageDailyUsage: 1, unitPrice: 62, expiryInDays: 19 },
  { id: "amlodipine", medicineName: "Amlodipine 5 mg", category: "Chronic medication", quantity: 150, averageDailyUsage: 5, unitPrice: 0.95, expiryInDays: 330 },
  { id: "omeprazole", medicineName: "Omeprazole 20 mg", category: "Gastrointestinal", quantity: 64, averageDailyUsage: 6, unitPrice: 1.8, expiryInDays: 27 },
  { id: "ibuprofen", medicineName: "Ibuprofen 200 mg", category: "Pain relief", quantity: 40, averageDailyUsage: 9, unitPrice: 1.3, expiryInDays: 120 },
  { id: "rapid-tests", medicineName: "Rapid diagnostic test kits", category: "Diagnostics", quantity: 90, averageDailyUsage: 10, unitPrice: 18, expiryInDays: 300 },
];

export async function seedDemoInventory() {
  const userId = currentUserId();
  const existing = await getDocs(query(inventoryCollection, where("createdBy", "==", userId)));
  const existingDemoIds = new Set(
    existing.docs.map((item) => item.data().demoSeedId).filter(Boolean),
  );
  const toAdd = demoMedicines.filter((medicine) => !existingDemoIds.has(`stockguard-demo-v1-${medicine.id}`));
  if (toAdd.length === 0) return { added: 0, skipped: demoMedicines.length };

  const batch = writeBatch(db);
  for (const medicine of toAdd) {
    const reference = doc(inventoryCollection);
    batch.set(reference, {
      ...medicineFields({
        ...medicine,
        batchNumber: `DEMO-${medicine.id.toUpperCase()}-001`,
        manufacturer: "StockGuard demonstration data",
        manufactureDate: dateOffset(-120),
        expiryDate: dateOffset(medicine.expiryInDays),
        supplier: "Demo supplier",
      }),
      demoSeedId: `stockguard-demo-v1-${medicine.id}`,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      demoData: true,
    });
  }
  await batch.commit();
  return { added: toAdd.length, skipped: demoMedicines.length - toAdd.length };
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
