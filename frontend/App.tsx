import { Feather } from '@expo/vector-icons';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import type { createMaterialTopTabNavigator as CreateMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
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
type RootTabParamList = {
  Calories: undefined;
  Log: undefined;
  Cardio: undefined;
  Progress: undefined;
  Info: undefined;
};

const { createMaterialTopTabNavigator } = require('@react-navigation/material-top-tabs/lib/module/index.js') as {
  createMaterialTopTabNavigator: typeof CreateMaterialTopTabNavigator;
};
const Tab = createMaterialTopTabNavigator<RootTabParamList>();

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
                  tabBarPosition="bottom"
                  screenOptions={({ route }: { route: { name: keyof RootTabParamList } }) => ({
                    swipeEnabled: true,
                    animationEnabled: true,
                    lazy: false,
                    tabBarShowIcon: true,
                    tabBarAllowFontScaling: false,
                    sceneStyle: styles.scene,
                    tabBarStyle: styles.tabBar,
                    tabBarIndicatorStyle: styles.tabIndicator,
                    tabBarItemStyle: styles.tabItem,
                    tabBarIconStyle: styles.tabIcon,
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.muted,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarIcon: ({ color }) => {
                      const iconName =
                        route.name === 'Log'
                          ? 'edit'
                          : route.name === 'Calories'
                          ? 'pie-chart'
                          : route.name === 'Info'
                          ? 'shopping-bag'
                          : route.name === 'Cardio'
                          ? 'map'
                          : 'bar-chart-2';
                      return <Feather name={iconName} size={24} color={color} />;
                    },
                  })}
                >
                  <Tab.Screen name="Calories" component={CalorieScreen} />
                  <Tab.Screen name="Log" component={LogScreen} />
                  <Tab.Screen name="Cardio" component={RunScreen} />
                  <Tab.Screen name="Progress" component={ProgressScreen} />
                  <Tab.Screen name="Info" component={SummaryScreen} />
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
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 14 : 9,
    height: Platform.OS === 'ios' ? 72 : 65,
  },
  tabIndicator: {
    backgroundColor: colors.accent,
    height: 2,
  },
  tabLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    lineHeight: 15,
    marginBottom: 0,
  },
  tabItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 0,
  },
  tabIcon: {
    marginBottom: 1,
  },
  scene: {
    backgroundColor: colors.background,
  },
});
