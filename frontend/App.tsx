import { Feather } from '@expo/vector-icons';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AccountScreen } from './src/screens/AccountScreen';
import { BodyweightProvider } from './src/store/bodyweightStore';
import { MeasurementProvider } from './src/store/measurementStore';
import { ProgressPhotoProvider } from './src/store/progressPhotoStore';
import { BodyInfoScreen } from './src/screens/BodyInfoScreen';
import { CalorieScreen } from './src/screens/CalorieScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { LogScreen } from './src/screens/LogScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { RunScreen } from './src/screens/RunScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { CalorieProvider } from './src/store/calorieStore';
import { RunProvider } from './src/store/runStore';
import { UserProvider, useUserStore } from './src/store/userStore';
import { WorkoutProvider } from './src/store/workoutStore';
import { colors } from './src/theme';

// Bottom tab navigation for the core flows.
type RootTabParamList = {
  Calories: undefined;
  Log: undefined;
  Cardio: undefined;
  Progress: undefined;
  Account: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTabParamList>();

type AuthStep = 'welcome' | 'signup' | 'bodyinfo' | 'focus' | 'login';

function AuthFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<AuthStep>('welcome');

  switch (step) {
    case 'welcome':
      return (
        <WelcomeScreen
          onSignUp={() => setStep('signup')}
          onLogin={() => setStep('login')}
        />
      );
    case 'signup':
      return (
        <SignUpScreen
          onBack={() => setStep('welcome')}
          onNext={() => setStep('bodyinfo')}
        />
      );
    case 'bodyinfo':
      return (
        <BodyInfoScreen
          onBack={() => setStep('signup')}
          onComplete={() => setStep('focus')}
        />
      );
    case 'focus':
      return (
        <FocusScreen
          onBack={() => setStep('bodyinfo')}
          onComplete={onComplete}
        />
      );
    case 'login':
      return (
        <LoginScreen
          onBack={() => setStep('welcome')}
          onSuccess={onComplete}
        />
      );
  }
}

function MainApp() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
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
                : route.name === 'Account'
                ? 'user'
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
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const { user, isLoading } = useUserStore();
  const [authComplete, setAuthComplete] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const isSignedIn = user && user.bodyweightKg > 0 && user.focus;

  if (!isSignedIn) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthFlow onComplete={() => setAuthComplete(true)} />
      </>
    );
  }

  return (
    <RunProvider>
      <WorkoutProvider>
        <CalorieProvider>
          <BodyweightProvider>
            <MeasurementProvider>
              <ProgressPhotoProvider>
                <MainApp />
              </ProgressPhotoProvider>
            </MeasurementProvider>
          </BodyweightProvider>
        </CalorieProvider>
      </WorkoutProvider>
    </RunProvider>
  );
}

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
        <UserProvider>
          <AppContent />
        </UserProvider>
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
