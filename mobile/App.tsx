import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { COLORS } from './constants/theme';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RoomDetailScreen from './screens/RoomDetailScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { loading, isAuthenticated } = useAuthContext();
  const screenOptions = useMemo(() => ({ headerShown: false }), []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              options={{ headerShown: true, title: 'Room Details' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
