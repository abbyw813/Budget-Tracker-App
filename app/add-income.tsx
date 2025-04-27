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
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AddIncome() {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [incomes, setIncomes] = useState<any[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const router = useRouter();

  const saveIncome = async () => {
    if (!amount || !source) {
      Alert.alert('Missing info', 'Please enter both amount and source');
      return;
    }

    try {
      const newIncome = {
        amount: parseFloat(amount),
        source,
      };

      const existing = await AsyncStorage.getItem('incomes');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [...parsed, newIncome];

      await AsyncStorage.setItem('incomes', JSON.stringify(updated));

      const total = updated.reduce((sum: number, i: any) => sum + i.amount, 0);
      await AsyncStorage.setItem('income', total.toString());

      setIncomes(updated);
      setAmount('');
      setSource('');
      Alert.alert('Success', 'Income added!');
    } catch (e) {
      Alert.alert('Error', 'Could not save income');
    }
  };

  const loadIncomes = async () => {
    const saved = await AsyncStorage.getItem('incomes');
    setIncomes(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {incomes.length > 0 && (
            <>
              <Text style={styles.title}>📊 Income by Source</Text>
              <PieChart
                data={Object.values(
                  incomes.reduce((acc: any, income) => {
                    if (!acc[income.source]) {
                      const colors = ['#ff5ecb', '#66d9ef', '#fbc531', '#7bed9f', '#e84118', '#9c88ff'];
                      acc[income.source] = {
                        name: income.source,
                        amount: 0,
                        color: colors[Object.keys(acc).length % colors.length],
                        legendFontColor: '#fff',
                        legendFontSize: 12,
                      };
                    }
                    acc[income.source].amount += income.amount;
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

              <Text style={styles.title}>📋 Income List</Text>
              {incomes.map((inc, idx) => (
                <View key={idx} style={styles.incomeItem}>
                  <Text style={styles.incomeText}>
                    {inc.source} — ${inc.amount.toFixed(2)}
                  </Text>
                </View>
              ))}

              <Text style={[styles.title, { marginTop: 20 }]}>
                🧾 Total Income: ${totalIncome.toFixed(2)}
              </Text>
            </>
          )}

          <View style={styles.card}>
            <Text style={styles.title}>💼 Add Income</Text>

            <Text style={styles.label}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 1500"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Source</Text>
            <TextInput
              value={source}
              onChangeText={setSource}
              placeholder="e.g. Job, Freelance"
              style={styles.input}
              placeholderTextColor="#888"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveIncome}>
              <Text style={styles.saveButtonText}>Save Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/')}
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
  title: {
    color: '#ff5ecb',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: '#ff5ecb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 20,
  },
  backButtonText: {
    color: '#ff5ecb',
    fontWeight: '700',
    fontSize: 16,
  },
  incomeItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  incomeText: {
    color: '#f2f2f2',
    fontSize: 15,
    fontWeight: '600',
  },
});
