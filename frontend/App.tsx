import { Feather } from '@expo/vector-icons';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CalorieScreen } from './src/screens/CalorieScreen';
import { LogScreen } from './src/screens/LogScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { RunScreen } from './src/screens/RunScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { CalorieProvider } from './src/store/calorieStore';
import { RunProvider } from './src/store/runStore';
import { WorkoutProvider } from './src/store/workoutStore';
import { colors } from './src/theme';

// Bottom tab navigation for the core flows.
const Tab = createBottomTabNavigator();

// Root app shell with font loading, providers, and navigation.
export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Avoid flash of unstyled text before fonts are ready.
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  // Compose providers to keep navigation + storage consistent.
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <RunProvider>
          <WorkoutProvider>
            <CalorieProvider>
              <NavigationContainer theme={navTheme}>
                <StatusBar style="dark" />
                <Tab.Navigator
                  screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.muted,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarIcon: ({ color, size }) => {
                      const iconName =
                        route.name === 'Log'
                          ? 'edit'
                          : route.name === 'Calories'
                          ? 'pie-chart'
                          : route.name === 'Summary'
                          ? 'calendar'
                          : route.name === 'Run'
                          ? 'map'
                          : 'bar-chart-2';
                      return <Feather name={iconName} size={size} color={color} />;
                    },
                  })}
                >
                  <Tab.Screen name="Log" component={LogScreen} />
                  <Tab.Screen name="Run" component={RunScreen} />
                  <Tab.Screen name="Calories" component={CalorieScreen} />
                  <Tab.Screen name="Summary" component={SummaryScreen} />
                  <Tab.Screen name="Progress" component={ProgressScreen} />
                </Tab.Navigator>
              </NavigationContainer>
            </CalorieProvider>
          </WorkoutProvider>
        </RunProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

// Custom navigation theme aligned with design tokens.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 10,
    height: 66,
  },
  tabLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    marginBottom: 4,
  },
});
