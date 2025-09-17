import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GoalsProvider } from "../../contexts/GoalsContext";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function HabitsLayout() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/auth/login");
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF5F7" }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <GoalsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#A78BFA", // Lavender
          tabBarInactiveTintColor: "#FCE7F3", // Cream-ish soft
          tabBarStyle: {
            backgroundColor: "#FFF5F7",
            borderTopColor: "#EDE9FE",
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
        }}
      >
        {/* Your Daily Habits Tab */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Your Habits",
            tabBarIcon: ({ focused }) => (
              <Ionicons size={24} name={focused ? "home" : "home-outline"} color={focused ? "#A78BFA" : "#FCD5F5"} />
            ),
          }}
        />

        {/* Add Habit Tab */}
        <Tabs.Screen
          name="create"
          options={{
            title: "Add Habit",
            tabBarIcon: ({ focused }) => (
              <Ionicons size={24} name={focused ? "create" : "create-outline"} color={focused ? "#A78BFA" : "#FCD5F5"} />
            ),
          }}
        />

        {/* Hidden screens for routing */}
        <Tabs.Screen
          name="edit/[id]"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="calendar/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </GoalsProvider>
  );
}
