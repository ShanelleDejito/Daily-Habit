import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Keyboard, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Slider from "@react-native-community/slider";

const EditHabit = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState(""); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const docRef = doc(db, "goals", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setProgress(data.progress ?? 0);
          setDescription(data.description || ""); 
        }
      } catch (error) {
        console.log("Error fetching habit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, "goals", id);
      await updateDoc(docRef, {
        title,
        progress: Math.round(progress),
        description,
      });
      Keyboard.dismiss();
      router.push("/goals");
    } catch (error) {
      console.log("Error updating habit:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Daily Habit</Text>

      <TextInput
        style={styles.input}
        placeholder="Habit Name"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#A78BFA"
      />

      <View style={styles.progressContainer}>
        <Text style={styles.label}>Progress: {progress}%</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progress}
          onValueChange={(val) => setProgress(val)}
          minimumTrackTintColor="#A78BFA"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#A78BFA"
        />
      </View>

      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Notes or description"
        multiline
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#A78BFA"
      />

      <Pressable onPress={handleUpdate} style={styles.button}>
        <Text style={styles.buttonText}>Update Habit</Text>
      </Pressable>
    </ScrollView>
  );
};

export default EditHabit;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF5F7", // cream
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#A78BFA", // lavender
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    fontSize: 16,
    shadowColor: "#A78BFA",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  progressContainer: {
    width: "100%",
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#A78BFA",
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#A78BFA",
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "#A78BFA",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
