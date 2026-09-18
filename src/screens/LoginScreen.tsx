import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useAuth } from '../auth/AuthContext';

export function LoginScreen() {
  const { login, busy, error } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Planner</Text>
      <Text style={styles.subtitle}>Entrá con tu cuenta de Google habilitada.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {busy ? (
        <ActivityIndicator style={styles.spinner} />
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => void login()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: '#b00020',
    textAlign: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginTop: 8,
  },
});
