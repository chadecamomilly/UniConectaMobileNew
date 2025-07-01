import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCWjcbC99DqzcY_v8KDrEtqKKEt5LoFsoA",
  authDomain: "camomilly-lasalle-firebase.firebaseapp.com",
  databaseURL: "https://camomilly-lasalle-firebase-default-rtdb.firebaseio.com",
  projectId: "camomilly-lasalle-firebase",
  storageBucket: "camomilly-lasalle-firebase.firebasestorage.app",
  messagingSenderId: "717274023578",
  appId: "1:717274023578:web:690c7346ce0779ad198123",
  measurementId: "G-5DT18D8PFP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
export default app;