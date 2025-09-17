import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'goals'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(list);
    });

    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'goals', id);
              await deleteDoc(docRef);
            } catch (error) {
              console.log('Error deleting habit:', error);
            }
          },
        },
      ]
    );
  };

  const handleCheckIn = async (id) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const docRef = doc(db, "goals", id);
      await updateDoc(docRef, { checkIns: arrayUnion(today) });
    } catch (error) {
      console.log("Error adding check-in:", error);
    }
  };

  const calculateStreak = (checkIns = []) => {
    if (checkIns.length === 0) return 0;
    const sortedDates = [...checkIns].sort((a, b) => new Date(b) - new Date(a));
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else break;
    }
    return streak;
  };

  const openOptions = (habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const closeOptions = () => {
    setSelectedHabit(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Daily Habits</Text>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const streak = calculateStreak(item.checkIns);
          const totalDays = item.totalDays || 1; // fallback 1
          const completedDays = item.checkIns ? item.checkIns.length : 0;
          const progressPercent = Math.min(completedDays / totalDays, 1) * 100;

          return (
            <View style={styles.habitItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.habitText}>{item.title || 'Untitled Habit'}</Text>
                <Pressable onPress={() => openOptions(item)}>
                  <Ionicons name="ellipsis-vertical" size={24} color="#A78BFA" />
                </Pressable>
              </View>

              {item.description && (
                <Text style={styles.descriptionText}>{item.description}</Text>
              )}

              
              {/* ✅ Progress Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress ?? 0}%` },
                  ]}
                />
              </View>
                <Text style={styles.progressText}>Completed Days: {item.checkIns ? item.checkIns.length : 0}</Text>
                <Text style={styles.progressText}>
                Streak: {streak} day{streak !== 1 ? 's' : ''}
              </Text>

              <Pressable
                style={[styles.button, { backgroundColor: '#D6BBFB', marginTop: 10 }]}
                onPress={() => handleCheckIn(item.id)}
              >
                <Text style={[styles.buttonText, { color: '#4B1D9B' }]}>Mark as Done</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No habits yet. Add one!</Text>
        }
      />

      <Pressable
        style={[styles.button, { backgroundColor: '#F87171', margin: 16 }]}
        onPress={() => signOut(auth)}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeOptions}
      >
        <Pressable style={styles.modalOverlay} onPress={closeOptions}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalButton}
              onPress={() => { router.push(`/goals/edit/${selectedHabit.id}`); closeOptions(); }}
            >
              <Text style={styles.modalButtonText}>Edit</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => { handleDelete(selectedHabit.id); closeOptions(); }}
            >
              <Text style={styles.modalButtonText}>Delete</Text>
            </Pressable>

            <Pressable
              style={styles.modalButton}
              onPress={() => { router.push(`/goals/calendar/${selectedHabit.id}`); closeOptions(); }}
            >
              <Text style={styles.modalButtonText}>Calendar</Text>
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: '#F87171' }]}
              onPress={closeOptions}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Habits;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#FFF5F7',
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#A78BFA',
  },
  habitItem: {
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#A78BFA',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  habitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B1D9B',
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#EDE9FE',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButton: {
    padding: 12,
    width: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
