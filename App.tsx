import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import ChatScreen from './src/screens/ChatScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName="Chat"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
            color: colors.text,
          },
        }}
      >
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ navigation }) => ({
            title: 'Ash-Gpt',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('ChatList')}
                style={styles.headerButtonLeft}
              >
                <Ionicons name="chatbubbles" size={22} color={colors.primary} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={styles.headerButton}
              >
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="ChatList"
          component={ChatListScreen}
          options={{ title: 'Sohbetler' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
  },
  headerButtonLeft: {
    marginLeft: 8,
  },
});
