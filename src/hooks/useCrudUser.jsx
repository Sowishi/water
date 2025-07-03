import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
const useCrudUser = () => {
  const colRef = collection(db, "users");

  const addUser = async (user) => {
    const profilePic = `https://avatar.iran.liara.run/public/?username=[${user.firstName}]`;
    try {
      const docRef = await addDoc(colRef, {
        ...user,
        profilePic,
        status: user.status ?? "pending",
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding user: ", error);
      return null;
    }
  };

  const getUsers = (setUsers) => {
    onSnapshot(colRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(users);
    });
  };

  const deleteUser = async (user) => {
    const docRef = doc(db, "users", user.id);
    await deleteDoc(docRef);
  };

  const updateUser = async (userId, data) => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, data);
  };

  return { addUser, getUsers, deleteUser, updateUser };
};

export default useCrudUser;
