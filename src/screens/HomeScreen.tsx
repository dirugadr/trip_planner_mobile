import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido{user?.name ? `, ${user.name}` : ''}</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>
      <Text style={styles.placeholder}>Acá van a aparecer tus viajes.</Text>

      <Pressable style={styles.logoutButton} onPress={() => void logout()}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
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
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  placeholder: {
    marginTop: 24,
    color: '#999',
  },
  logoutButton: {
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    fontWeight: '600',
  },
});
