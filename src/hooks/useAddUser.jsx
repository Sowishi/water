import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
const useAddUser = () => {
  const addUser = async (user) => {
    const profilePic = `https://avatar.iran.liara.run/public/?username=[${user.firstName}]`;
    const docRef = collection(db, "users");
    addDoc(docRef, { ...user, profilePic })
      .then((docRef) => {
        console.log("User added with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding user: ", error);
      });
  };

  return { addUser };
};

export default useAddUser;
