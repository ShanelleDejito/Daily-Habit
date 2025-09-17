import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Calendar } from "react-native-calendars";

const HabitCalendar = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "goals", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setHabit({ id: docSnap.id, ...docSnap.data() });
      } else {
        setHabit(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.center}>
        <Text style={styles.noHabitText}>
          No habits yet! Add a habit to start tracking here.
        </Text>
      </View>
    );
  }

  // Mark dates from check-ins
  const markedDates = {};
  if (habit.checkIns && habit.checkIns.length > 0) {
    habit.checkIns.forEach((date) => {
      markedDates[date] = {
        selected: true,
        marked: true,
        selectedColor: "#A78BFA", // lavender
      };
    });
  }

  // Calculate progress (completed / total)
  const totalCheckIns = habit.totalDays || 1;
  const completedCheckIns = habit.checkIns ? habit.checkIns.length : 0;
  const progressPercent = Math.min(completedCheckIns / totalCheckIns, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{habit.title}</Text>
        {habit.description ? (
          <Text style={styles.desc}>{habit.description}</Text>
        ) : null}

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent * 100}%`, backgroundColor: "#A78BFA" },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {completedCheckIns} / {totalCheckIns} days completed
        </Text>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          router.push(`../create?date=${day.dateString}`);
        }}
        theme={{
          selectedDayBackgroundColor: "#A78BFA",
          todayTextColor: "#7C3AED",
          arrowColor: "#A78BFA",
        }}
        style={styles.calendar}
      />
    </View>
  );
};

export default HabitCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F7", // cream
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#A78BFA",
  },
  desc: {
    fontSize: 16,
    color: "#7C3AED",
    textAlign: "center",
    marginBottom: 12,
  },
  noHabitText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
  calendar: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
});
