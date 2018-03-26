import firebase from "firebase"

var config = {
    apiKey: "AIzaSyCmQ9DuJnnXA59uD_Z5rDfqZgVE5HbwIRU",
    authDomain: "chat-909e6.firebaseapp.com",
    databaseURL: "https://chat-909e6.firebaseio.com",
    projectId: "chat-909e6",
    storageBucket: "chat-909e6.appspot.com",
    messagingSenderId: "957912137747"
};

var app = firebase.initializeApp(config);


export var db = app.database();
export var chatRefs = db.ref('chat');
export var storageRef = firebase.storage().ref('chat');