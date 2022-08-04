import React, { useRef, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa"
import "./style.css";

//======== FIREBASE SET UP ========//
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBNaG2a9Nf1MafOZAP7JX8FLyzbp9Qx1hk",
  authDomain: "chat-app-57c51.firebaseapp.com",
  projectId: "chat-app-57c51",
  storageBucket: "chat-app-57c51.appspot.com",
  messagingSenderId: "1046439528341",
  appId: "1:1046439528341:web:33d0ef02a2d983345a589c",
  measurementId: "G-0X50CCEP0C",
});

// reference auth and firestore SDKs
const auth = firebase.auth();
const firestore = firebase.firestore();
//==============================================================================//

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <header>
        <h1>Chat</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </>
  );
}

//================ SIGN IN / SIGN OUT ================//
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button className="login-logout" onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button className="login-logout" onClick={() => auth.signOut()}>Log Out</button>
  );
}
//=======================================================//

function ChatRoom() {
  const autoScroll = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    autoScroll.current({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={autoScroll}></span>
      </main>

      <form onSubmit={sendMessage}>
        <div className="chat-input">
          <input
            type="text"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Message"
          />
        </div>
        <button className="message-send" type="submit" disabled={!formValue}>
          <FaTelegramPlane />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} alt="" />
        <p>
          {text}
        </p>
      </div>
    </>
  );
}

export default App;
