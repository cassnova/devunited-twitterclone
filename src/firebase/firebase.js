import firebaseApp from 'firebase/app';
import 'firebase/firestore';

import 'firebase/auth';

import config from './config'

firebaseApp.initializeApp(config)

export const fireStore = firebaseApp.firestore();

export const auth = firebaseApp.auth();

export const provider = new firebaseApp.auth.GoogleAuthProvider();

export const loginConGoogle = () => auth.signInWithPopup(provider);

export const logout = () => auth.signOut();

export default firebaseApp;

