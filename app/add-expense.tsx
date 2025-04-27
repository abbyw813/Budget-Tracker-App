import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'Need' | 'Want'>('Need');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState(0);
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const saveExpense = async () => {
    if (!amount || !category) {
      Alert.alert('Missing info', 'Please fill out all fields');
      return;
    }

    try {
      const newExpense = {
        amount: parseFloat(amount),
        category,
        type,
      };
      const existing = await AsyncStorage.getItem('expenses');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [...parsed, newExpense];
      await AsyncStorage.setItem('expenses', JSON.stringify(updated));
      setExpenses(updated);
      Alert.alert('Success', 'Expense saved!');
    } catch (e) {
      Alert.alert('Error', 'Could not save expense');
    }
    setAmount('');
    setCategory('');
    setType('Need'); 
  };

  const loadExpenses = async () => {
    const savedExpenses = await AsyncStorage.getItem('expenses');
    const savedIncome = await AsyncStorage.getItem('income');
    setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
    setIncome(savedIncome ? parseFloat(savedIncome) : 0);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const needsTotal = expenses.filter(e => e.type === 'Need').reduce((sum, e) => sum + e.amount, 0);
  const wantsTotal = expenses.filter(e => e.type === 'Want').reduce((sum, e) => sum + e.amount, 0);
  const needsIdeal = income * 0.5;
  const wantsIdeal = income * 0.3;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>

          {expenses.length > 0 && (
            <>
              <Text style={[styles.title, { fontSize: 22, marginTop: 10 }]}>📊 Spending by Category</Text>
              <PieChart
                data={Object.values(
                  expenses.reduce((acc: any, exp) => {
                    if (!acc[exp.category]) {
                      const colors = ['#ff5ecb', '#66d9ef', '#fbc531', '#7bed9f', '#e84118', '#9c88ff'];
                      acc[exp.category] = {
                        name: exp.category,
                        amount: 0,
                        color: colors[Object.keys(acc).length % colors.length],
                        legendFontColor: '#fff',
                        legendFontSize: 12,
                      };
                    }
                    acc[exp.category].amount += exp.amount;
                    return acc;
                  }, {})
                )}
                width={screenWidth - 40}
                height={180}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                chartConfig={{
                  color: () => '#fff',
                  labelColor: () => '#fff',
                }}
              />
            </>
          )}

          <Text style={[styles.title, { fontSize: 22 }]}>🧾 Expense List</Text>
          {expenses.map((exp, idx) => (
            <View key={idx} style={{
              backgroundColor: '#1e1e1e',
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                {exp.category} — ${exp.amount.toFixed(2)}
              </Text>
              <Text style={{ color: '#aaa', fontSize: 13, marginTop: 2 }}>
                {exp.type === 'Need' ? '🧾 Need' : '🛍️ Want'}
              </Text>
            </View>
          ))}

          <Text style={[styles.title, { fontSize: 22 }]}>📈 Budget Targets (50/30/20)</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 20, flexWrap: 'wrap' }}>
            <View style={styles.badge}>
              <Text style={styles.badgeTitle}>💸 Needs</Text>
              <Text style={styles.badgeText}>Ideal: ${needsIdeal.toFixed(2)}</Text>
              <Text style={styles.badgeText}>Actual: ${needsTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTitle}>🧃 Wants</Text>
              <Text style={styles.badgeText}>Ideal: ${wantsIdeal.toFixed(2)}</Text>
              <Text style={styles.badgeText}>Actual: ${wantsTotal.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.title, { fontSize: 22, letterSpacing: 1 }]}>📝 Add New Expense</Text>

            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 40"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Groceries"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Is this a Need or a Want?</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'Need' && styles.activeType]}
                onPress={() => setType('Need')}
              >
                <Text style={styles.typeText}>Need</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'Want' && styles.activeType]}
                onPress={() => setType('Want')}
              >
                <Text style={styles.typeText}>Want</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveExpense}>
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
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
  title: {
    color: '#ff5ecb',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontWeight: '600',
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
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#ff5ecb',
  },
  typeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ff5ecb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
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
    marginBottom: 30,
  },
  backButtonText: {
    color: '#ff5ecb',
    fontWeight: '700',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#2b2b2b',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ff69b4',
    alignItems: 'center',
  },
  badgeTitle: {
    color: '#ff69b4',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardLine: {
    color: '#f2f2f2',
    marginBottom: 6,
  },
});
