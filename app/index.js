import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext'; 
import { ActivityIndicator, View } from 'react-native';

export default function AppRootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/home" />; 
  } else {
    return <Redirect href="/login" />; 
  }
}