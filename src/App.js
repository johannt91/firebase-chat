import React, { useEffect, useRef, useState } from "react";

//======== FIREBASE SET UP ========//
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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
//================================//

function App() {
  
  const [user] = useAuthState(auth);

  return (
    <>
      <header>
        <h1>Climbing</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </>
  );
};

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
};

function SignOut() {
  return auth.currentUser && (
    <button onClick={()=>auth.signOut()}>Log Out</button>
  );
};

function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const autoScroll = useRef();

  useEffect(()=> {
    autoScroll.current.scrollIntoView({behaviour: "smooth"});
  }, [messages])

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </main>
    </>
  );
};

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const [formValue, setFormValue] = useState('');
  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
  }

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e)=> setFormValue(e.target.value)} placeholder="Message" />
        <button type="submit" disabled={!formValue}>Send</button>
      </form>
    </>
  );
};

export default App;
