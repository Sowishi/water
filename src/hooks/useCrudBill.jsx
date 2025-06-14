import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const useCrudBill = () => {
  const colRef = collection(db, "bills");

  const addBill = async (bill) => {
    await addDoc(colRef, bill);
  };

  const getBills = (setBills) => {
    onSnapshot(colRef, (snapshot) => {
      const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBills(bills);
    });
  };

  const getBillsByUser = (userId, setBills) => {
    const q = query(colRef, where("userId", "==", userId));
    onSnapshot(q, (snapshot) => {
      const bills = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBills(bills);
    });
  };

  const updateBill = async (billId, data) => {
    const billDoc = doc(db, "bills", billId);
    await updateDoc(billDoc, data);
  };

  const deleteBill = async (billId) => {
    const billDoc = doc(db, "bills", billId);
    await deleteDoc(billDoc);
  };

  return { addBill, getBills, getBillsByUser, updateBill, deleteBill };
};

export default useCrudBill;
