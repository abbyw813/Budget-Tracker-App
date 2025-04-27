import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

type Expense = {
  amount: number;
  category: string;
  type: 'Need' | 'Want';
};

export default function Index() {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<number | null>(null);
  const [savingsSaved, setSavingsSaved] = useState<number | null>(null);
  const [tip, setTip] = useState('');
  const [challenge, setChallenge] = useState('');
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const tips = [
    'Track your spending weekly and adjust as needed',
    'Set realistic savings goals and automate deposits',
    'Cut unnecessary subscriptions and impulse buys',
    'Use the 24-hour rule before big purchases',
    'Review your budget monthly and adjust categories',
  ];

  const challenges = [
    'No takeout for 5 days. Cook at home and save at least $25',
    'Track every expense this week — even the tiny ones',
    'Cash-only challenge: Withdraw $100 and make it last all week',
    'Unsubscribe from 1 unused service',
    'Use leftovers 3 times this week to cut waste and save'
  ];

  const loadData = useCallback(async () => {
    try {
      const savedIncome = await AsyncStorage.getItem('income');
      const savedExpenses = await AsyncStorage.getItem('expenses');
      const goal = await AsyncStorage.getItem('savingsGoal');
      const saved = await AsyncStorage.getItem('savingsSaved');
      const savedProgress = await AsyncStorage.getItem('challengeProgress');

      setIncome(savedIncome ? parseFloat(savedIncome) : 0);
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      setSavingsGoal(goal ? parseFloat(goal) : null);
      setSavingsSaved(saved ? parseFloat(saved) : null);
      setChallengeProgress(savedProgress ? parseInt(savedProgress) : 0);

      const randomTip = Math.floor(Math.random() * tips.length);
      setTip(tips[randomTip]);

      const randomChallenge = Math.floor(Math.random() * challenges.length);
      setChallenge(challenges[randomChallenge]);
    } catch (e) {
      console.log('Error loading data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = income - totalExpenses;
  const savingsProgress = savingsGoal && savingsSaved ? Math.min(savingsSaved / savingsGoal, 1) : 0;

  const resetChallenge = async () => {
    const newChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(newChallenge);
    setChallengeProgress(0);
    await AsyncStorage.setItem('challengeProgress', '0');
    setShowConfetti(false);
  };

  
  const resetData = async () => {
    try {
      await AsyncStorage.clear();
      alert('All data has been reset.');
      loadData(); // Reload cleared state
    } catch (error) {
      console.error('Error clearing app data.', error);
    }
  };

  const handleDayPress = async (day: number) => {
    const newProgress = day + 1 > challengeProgress ? day + 1 : challengeProgress;
    setChallengeProgress(newProgress);
    await AsyncStorage.setItem('challengeProgress', newProgress.toString());
    if (newProgress === 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity style={styles.tab} onPress={() => router.push('/')}>
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.push('/add-expense')}>
          <Text style={styles.tabText}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.push('/savings')}>
          <Text style={styles.tabText}>Savings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => router.push('/add-income')}>
          <Text style={styles.tabText}>Income</Text>
        </TouchableOpacity>
      </View>

      <>
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, { fontSize: 20, fontWeight: 'bold', color: '#ff69b4' }]}>🎯 Welcome to Your Budget Dashboard</Text>
        </View>

        <View style={[styles.summaryRow, { backgroundColor: '#151515', paddingVertical: 12, borderRadius: 12, marginBottom: 20 }]}>
          <View style={[styles.summaryCard, { borderRadius: 16 }]}>
            <Text style={styles.label}>💰 Income</Text>
            <Text style={[styles.value, { fontSize: 20 }]}>${income.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderRadius: 16 }]}>
            <Text style={styles.label}>📉 Expenses</Text>
            <Text style={[styles.value, { fontSize: 20 }]}>${totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderRadius: 16 }]}>
            <Text style={styles.label}>🧾 Balance</Text>
            <Text style={[styles.value, { fontSize: 22, color: '#ff69b4' }]}>${balance.toFixed(2)}</Text>
          </View>
        </View>

        {totalExpenses < income * 0.5 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <View style={{
              backgroundColor: '#2b2b2b',
              paddingVertical: 18,
              paddingHorizontal: 25,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: '#ff69b4',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 6 }}>
                🎉 You're Crushing It!
              </Text>
              <Text style={{ color: '#fff', fontSize: 13, textAlign: 'center' }}>
                Spending is under 50% of income
              </Text>
            </View>

            <View style={{
              backgroundColor: '#2b2b2b',
              paddingVertical: 18,
              paddingHorizontal: 25,
              borderRadius: 60,
              borderWidth: 2,
              borderColor: '#ff69b4',
              alignItems: 'center',
              maxWidth: 250,
            }}>
              <Text style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                💡 Budget Tip
              </Text>
              <Text style={{ color: '#fff', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                {tip}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: '#222', paddingBottom: 25 }]}>
          <Text style={styles.sectionTitle}>🏆 Weekly Budget Challenge</Text>
          <Text style={{ color: '#ccc', fontSize: 16 }}>{challenge}</Text>
          <Text style={{ color: '#aaa', fontSize: 14, marginTop: 10 }}>
            Progress: {challengeProgress}/5 days completed ✅
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            {[...Array(5)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleDayPress(i)}
                style={{
                  backgroundColor: i < challengeProgress ? '#ff69b4' : '#444',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff' }}>Day {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={resetChallenge} style={{ marginTop: 15, alignSelf: 'center' }}>
            <Text style={{ color: '#ff69b4', fontSize: 14, fontWeight: '600' }}>🔄 Reset Challenge</Text>
          </TouchableOpacity>
        </View>

        {showConfetti && <ConfettiCannon count={100} origin={{ x: screenWidth / 2, y: 0 }} />}

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={resetData}
            style={{
              backgroundColor: '#ff69b4',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 25,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Reset All Data</Text>
          </TouchableOpacity>
        </View>
      </>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 12,
    width: '30%',
    alignItems: 'center',
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
  label: {
    color: '#ff92df',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ff5ecb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
});
