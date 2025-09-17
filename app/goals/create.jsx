import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGoals } from '../../hooks/useGoals';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';

const CreateHabit = () => {
  const [habit, setHabit] = useState('');
  const { createGoal } = useGoals();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!habit.trim()) return;

    await createGoal({
      title: habit,
      progress: 0,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
    });

    setHabit('');
    Keyboard.dismiss();
    router.push('/goals');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add a New Daily Habit</Text>

      <TextInput
        style={styles.input}
        placeholder="What habit do you want to track?"
        value={habit}
        onChangeText={setHabit}
        placeholderTextColor="#A78BFA"
      />

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Add Habit</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default CreateHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F7', // cream background
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#A78BFA', // lavender
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 30,
    fontSize: 16,
    shadowColor: '#A78BFA',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    backgroundColor: '#A78BFA', // lavender button
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#A78BFA',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
 