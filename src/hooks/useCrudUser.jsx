import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
const useCrudUser = () => {
  const docRef = collection(db, "users");

  const addUser = async (user) => {
    const profilePic = `https://avatar.iran.liara.run/public/?username=[${user.firstName}]`;
    addDoc(docRef, { ...user, profilePic })
      .then((docRef) => {
        console.log("User added with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding user: ", error);
      });
  };

  const getUsers = (setUsers) => {
    onSnapshot(docRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(users);
    });
  };

  return { addUser, getUsers };
};

export default useCrudUser;
