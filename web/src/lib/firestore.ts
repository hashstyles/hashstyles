import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  addDoc, query, where, orderBy, limit, serverTimestamp, Timestamp, writeBatch, runTransaction
} from "firebase/firestore";
import { db } from "../firebase";

export { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, serverTimestamp, Timestamp, writeBatch, runTransaction, db };
