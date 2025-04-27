import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function SavingsGoals() {
  const [goal, setGoal] = useState('');
  const [saved, setSaved] = useState('');
  const [loadedGoal, setLoadedGoal] = useState<number | null>(null);
  const [loadedSaved, setLoadedSaved] = useState<number | null>(null);
  const [newSaved, setNewSaved] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const router = useRouter();

  useEffect(() => {
    const loadSavings = async () => {
      const g = await AsyncStorage.getItem('savingsGoal');
      const s = await AsyncStorage.getItem('savingsSaved');
      const goalVal = g ? parseFloat(g) : null;
      const savedVal = s ? parseFloat(s) : null;

      setLoadedGoal(goalVal);
      setLoadedSaved(savedVal);
      setNewSaved(savedVal?.toString() || '');
    };
    loadSavings();
  }, []);

  const saveGoal = async () => {
    await AsyncStorage.setItem('savingsGoal', goal);
    await AsyncStorage.setItem('savingsSaved', saved);
    const g = parseFloat(goal);
    const s = parseFloat(saved);
    setLoadedGoal(g);
    setLoadedSaved(s);
    setNewSaved(s.toString());
    setGoal('');
    setSaved('');
    Alert.alert('Success', 'Savings goal saved!');
    if (g > 0 && s >= g) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const updateSavedAmount = async () => {
    await AsyncStorage.setItem('savingsSaved', newSaved);
    const updated = parseFloat(newSaved);
    setLoadedSaved(updated);
    Alert.alert('Updated', 'Your saved amount has been updated.');
    if (loadedGoal && updated >= loadedGoal) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const progress =
    loadedGoal && loadedSaved ? Math.min(loadedSaved / loadedGoal, 1) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {loadedGoal !== null && (
            <View style={styles.card}>
              <Text style={styles.title}>📈 Your Savings Progress</Text>

              {/* 🐷 Piggy Bank Icon */}
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 40 }}>🐷</Text>
              </View>

              <Text style={styles.infoText}>Goal: ${loadedGoal.toFixed(2)}</Text>
              <Text style={styles.infoText}>Saved: ${loadedSaved?.toFixed(2)}</Text>

              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>

              <Text style={styles.infoText}>
                {Math.round(progress * 100)}% complete
              </Text>
              <Text style={styles.infoText}>
                Remaining: ${(loadedGoal - (loadedSaved || 0)).toFixed(2)}
              </Text>

              {progress >= 0.5 && progress < 1 && (
                <View style={styles.motivation}>
                  <Text style={styles.motivationText}>
                    🎉 Over halfway there! You're crushing it!
                  </Text>
                </View>
              )}
              {progress === 1 && (
                <View style={styles.motivation}>
                  <Text style={styles.motivationText}>
                    🏁 Goal reached! You did it!
                  </Text>
                </View>
              )}

              <Text style={[styles.label, { marginTop: 20 }]}>
                ✏️ Edit Saved Amount
              </Text>
              <TextInput
                placeholder="New saved amount"
                value={newSaved}
                onChangeText={setNewSaved}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#888"
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateSavedAmount}
              >
                <Text style={styles.saveButtonText}>Update Saved Amount</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.title}>💰 Set Your Savings Goal</Text>

            <TextInput
              placeholder="Goal amount (e.g. 1000)"
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <TextInput
              placeholder="Amount saved so far (e.g. 300)"
              value={saved}
              onChangeText={setSaved}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveGoal}>
              <Text style={styles.saveButtonText}>Save Savings Goal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>

          {showConfetti && (
            <ConfettiCannon
              count={100}
              origin={{ x: screenWidth / 2, y: 0 }}
              fadeOut
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  title: {
    color: '#ff5ecb',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#333',
    borderWidth: 1,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    color: '#f2f2f2',
    marginBottom: 6,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#333',
    borderRadius: 10,
    marginVertical: 10,
  },
  progressFill: {
    backgroundColor: '#ff5ecb',
    height: '100%',
    borderRadius: 10,
  },
  motivation: {
    backgroundColor: '#2b2b2b',
    borderColor: '#ff69b4',
    borderWidth: 2,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  motivationText: {
    color: '#ff69b4',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#ff5ecb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff5ecb',
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ff5ecb',
    fontWeight: '700',
    fontSize: 16,
  },
});
