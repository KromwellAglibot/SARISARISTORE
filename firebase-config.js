const firebaseConfig = {
    apiKey: "AIzaSyCcXZmVKWv8r6Z1tAqsdIVDclZQmcN1e",
    authDomain: "sari-sari-store-99c29.firebaseapp.com",
    projectId: "sari-sari-store-99c29",
    storageBucket: "sari-sari-store-99c29.firebasestorage.app",
    messagingSenderId: "1074049582590",
    appId: "1:1074049582590:web:9afd9d16b2a075411cacaf",
    measurementId: "G-ZRP3185WEH"
};

firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();
const firestore = firebase.firestore();
