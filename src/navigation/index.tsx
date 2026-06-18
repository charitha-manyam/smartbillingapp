import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { AuthNavigator } from './AppNavigator';
import { TabNavigator } from './TabNavigator';
import CompanySetupScreen from '../screens/company/CompanySetupScreen';

const SetupStack = createNativeStackNavigator();

function SetupNavigator() {
  return (
    <SetupStack.Navigator screenOptions={{ headerShown: false }}>
      <SetupStack.Screen name="CompanySetup" component={CompanySetupScreen} />
    </SetupStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDFA' }}>
      <ActivityIndicator size="large" color="#0D9488" />
    </View>
  );
}

export function AppNavigator({ theme }: { theme?: Theme }) {
  const { state, loadFromFirestore } = useApp();

  useEffect(() => {
    if (state.isAuthenticated) {
      loadFromFirestore();
    }
  }, [state.isAuthenticated]);

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      {!state.isAuthenticated ? (
        <AuthNavigator />
      ) : !state.company ? (
        <SetupNavigator />
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}
