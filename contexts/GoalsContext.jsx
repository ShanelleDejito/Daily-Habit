import { 
  addDoc, 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore"
import { createContext, useState } from "react"
import { db, auth } from "../firebaseConfig"

export const GoalsContext = createContext()

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState([])

  // ✅ Fetch goals (real-time listener)
  async function fetchGoals() {
    if (!auth.currentUser) return

    const q = query(
      collection(db, "goals"),
      where("userId", "==", auth.currentUser.uid)
    )

    onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setGoals(list)
    })
  }

  // ✅ Create a new goal (with completed:false by default)
  async function createGoal(goalData) {
    await addDoc(collection(db, "goals"), {
      ...goalData,
      completed: false,   // 🔥 default value when creating
    })
  }

  // ✅ Delete a goal
  async function deleteGoal(id) {
    const docRef = doc(db, "goals", id)
    await deleteDoc(docRef)
  }

  // ✅ Update a goal (generic)
  async function updateGoal(id, updatedData) {
    const docRef = doc(db, "goals", id)
    await updateDoc(docRef, updatedData)
  }

  // ✅ Update only the progress field
  async function updateGoalProgress(id, newProgress) {
    const docRef = doc(db, "goals", id)
    await updateDoc(docRef, { progress: newProgress })
  }

  // ✅ Toggle completed field
  async function toggleGoalCompleted(id, currentValue) {
    const docRef = doc(db, "goals", id)
    await updateDoc(docRef, { completed: !currentValue })
  }

  return (
    <GoalsContext.Provider
      value={{
        goals,
        fetchGoals,
        createGoal,
        deleteGoal,
        updateGoal,
        updateGoalProgress,
        toggleGoalCompleted, 
      }}
    >
      {children}
    </GoalsContext.Provider>
  )
}
