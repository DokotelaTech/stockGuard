import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase.js";

const transfersCollection = collection(db, "transfers");

function currentUserId() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in before accessing transfers.");
  return user.uid;
}

export async function listTransfers() {
  const userId = currentUserId();
  try {
    const snapshot = await getDocs(
      query(transfersCollection, where("createdBy", "==", userId)),
    );
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => {
        const aMs = a.createdAt?.toMillis?.() ?? new Date(a.date || 0).getTime();
        const bMs = b.createdAt?.toMillis?.() ?? new Date(b.date || 0).getTime();
        return bMs - aMs;
      });
  } catch (error) {
    if (error?.code === "permission-denied") {
      return [];
    }
    throw error;
  }
}

export async function createTransfer(transfer) {
  const userId = currentUserId();
  const today = new Date().toISOString().slice(0, 10);
  try {
    const docRef = await addDoc(transfersCollection, {
      sourceClinic: String(transfer.sourceClinic || "").trim(),
      destinationClinic: String(transfer.destinationClinic || "").trim(),
      medicine: String(transfer.medicine || "").trim(),
      quantity: Math.max(1, Number(transfer.quantity) || 1),
      status: "Pending",
      date: today,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      sourceClinic: String(transfer.sourceClinic || "").trim(),
      destinationClinic: String(transfer.destinationClinic || "").trim(),
      medicine: String(transfer.medicine || "").trim(),
      quantity: Math.max(1, Number(transfer.quantity) || 1),
      status: "Pending",
      date: today,
      createdBy: userId,
    };
  } catch (error) {
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore rules do not allow writing to the 'transfers' collection yet. Enable 'transfers' access in Firebase Console to record transfers.",
        { cause: error },
      );
    }
    throw error;
  }
}

export async function updateTransferStatus(id, status) {
  currentUserId();
  try {
    await updateDoc(doc(db, "transfers", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore rules do not allow updating 'transfers' yet.",
        { cause: error },
      );
    }
    throw error;
  }
}
