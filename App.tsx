
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';
import ActionPanel from './src/screens/ActionPanel';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="ActionPanel" component={ActionPanel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
