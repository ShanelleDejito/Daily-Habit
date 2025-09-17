import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>D A I L Y  H A B I T S</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/goals")}
      >
        <Text style={styles.buttonText}>View Your Habits</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/goals/create")}
      >
        <Text style={styles.buttonText}>Add a New Habit</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F7", // cream background
    padding: 20,
  },
  title: {
    marginVertical: 40,
    fontSize: 30,
    fontWeight: "bold",
    color: "#A78BFA", // lavender
    textAlign: "center",
  },
  button: {
    marginVertical: 15,
    paddingVertical: 16,
    paddingHorizontal: 30,
    backgroundColor: "#A78BFA", // lavender button
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "#FFF5F7", // cream text
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
