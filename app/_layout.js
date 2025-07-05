import { Stack, Redirect } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext'; 
import { ActivityIndicator, View } from 'react-native';


function RootLayoutContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {user ? (
        <Redirect href="/(tabs)/Home" /> 
      ) : (
        <Redirect href="/(auth)/login" /> 
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}