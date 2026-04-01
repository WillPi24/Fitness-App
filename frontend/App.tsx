import { Feather } from '@expo/vector-icons';
import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, DefaultTheme, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AccountScreen } from './src/screens/AccountScreen';
import { BodyweightProvider } from './src/store/bodyweightStore';
import { CustomExerciseProvider } from './src/store/customExerciseStore';
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
import { ThemeProvider, useTheme } from './src/store/themeStore';
import { UserProvider, useUserStore } from './src/store/userStore';
import { WorkoutProvider, useWorkoutStore } from './src/store/workoutStore';
import { colors as staticColors, spacing, typography } from './src/theme';

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

function formatRecoveryDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yy = String(year).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function WorkoutRecoveryPrompt() {
  const { activeWorkout, isLoading, discardActiveWorkout } = useWorkoutStore();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (isLoading || checkedRef.current) return;
    checkedRef.current = true;
    if (activeWorkout) {
      setVisible(true);
    }
  }, [isLoading]);

  const s = useMemo(() => StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(27, 31, 36, 0.6)',
      justifyContent: 'center',
    },
    modal: {
      backgroundColor: colors.surface,
      margin: spacing.lg,
      borderRadius: 20,
      padding: spacing.lg,
      gap: spacing.md,
    },
    title: {
      ...typography.headline,
      color: colors.text,
    },
    body: {
      ...typography.body,
      color: colors.muted,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center' as const,
    },
    continueText: {
      fontFamily: 'SpaceGrotesk_600SemiBold',
      fontSize: 16,
      color: '#FFFFFF',
    },
    discardButton: {
      alignItems: 'center' as const,
      paddingVertical: 10,
    },
    discardText: {
      fontFamily: 'SpaceGrotesk_500Medium',
      fontSize: 15,
      color: colors.muted,
    },
  }), [colors]);

  if (!visible || !activeWorkout) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={s.backdrop}>
        <View style={s.modal}>
          <Text style={s.title}>Workout in progress</Text>
          <Text style={s.body}>
            You have an unfinished workout from {formatRecoveryDate(activeWorkout.date)}
            {` (${activeWorkout.exercises.length} exercise${activeWorkout.exercises.length !== 1 ? 's' : ''})`}
            . Would you like to continue or discard it?
          </Text>
          <Pressable
            style={s.continueButton}
            onPress={() => {
              setVisible(false);
              navigation.navigate('Log' as never);
            }}
          >
            <Text style={s.continueText}>Continue workout</Text>
          </Pressable>
          <Pressable
            style={s.discardButton}
            onPress={() => {
              discardActiveWorkout();
              setVisible(false);
            }}
          >
            <Text style={s.discardText}>Discard workout</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MainApp() {
  const { colors, isDark } = useTheme();

  const navTheme = useMemo(() => ({
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  }), [colors, isDark]);

  const s = useMemo(() => StyleSheet.create({
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
    scene: {
      backgroundColor: colors.background,
    },
  }), [colors]);

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <WorkoutRecoveryPrompt />
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          swipeEnabled: true,
          animationEnabled: true,
          lazy: false,
          tabBarShowIcon: true,
          tabBarAllowFontScaling: false,
          sceneStyle: s.scene,
          tabBarStyle: s.tabBar,
          tabBarIndicatorStyle: s.tabIndicator,
          tabBarItemStyle: staticStyles.tabItem,
          tabBarIconStyle: staticStyles.tabIcon,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: staticStyles.tabLabel,
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
  const { colors } = useTheme();
  const [authComplete, setAuthComplete] = useState(false);

  if (isLoading) {
    return (
      <View style={[staticStyles.loading, { backgroundColor: colors.background }]}>
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
        <CustomExerciseProvider>
          <CalorieProvider>
            <BodyweightProvider>
              <MeasurementProvider>
                <ProgressPhotoProvider>
                  <MainApp />
                </ProgressPhotoProvider>
              </MeasurementProvider>
            </BodyweightProvider>
          </CalorieProvider>
        </CustomExerciseProvider>
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
      <View style={staticStyles.loading}>
        <ActivityIndicator color={staticColors.accent} />
      </View>
    );
  }

  // Compose providers to keep navigation + storage consistent.
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

// Static styles for elements that render before ThemeProvider is available.
const staticStyles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: staticColors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
});
