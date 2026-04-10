import { Feather } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../store/themeStore';
import { spacing, typography } from '../theme';
import type { ThemeColors } from '../theme';

type LegalScreenProps = {
  type: 'privacy' | 'terms';
  onBack: () => void;
};

function Heading({ children, colors }: { children: string; colors: ThemeColors }) {
  return (
    <Text style={{ ...typography.headline, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm }}>
      {children}
    </Text>
  );
}

function Para({ children, colors }: { children: React.ReactNode; colors: ThemeColors }) {
  return (
    <Text style={{ ...typography.body, color: colors.muted, lineHeight: 24, marginBottom: spacing.md }}>
      {children}
    </Text>
  );
}

function Bullet({ children, colors }: { children: string; colors: ThemeColors }) {
  return (
    <View style={{ flexDirection: 'row', paddingLeft: spacing.md, marginBottom: spacing.xs }}>
      <Text style={{ ...typography.body, color: colors.muted, lineHeight: 24 }}>{'\u2022  '}</Text>
      <Text style={{ ...typography.body, color: colors.muted, lineHeight: 24, flex: 1 }}>{children}</Text>
    </View>
  );
}

function BulletGroup({ children }: { children: React.ReactNode }) {
  return <View style={{ marginBottom: spacing.md }}>{children}</View>;
}

function Link({ href, children, colors }: { href: string; children: string; colors: ThemeColors }) {
  return (
    <Text
      style={{ color: colors.accent }}
      onPress={() => Linking.openURL(href)}
    >
      {children}
    </Text>
  );
}

function PrivacyContent({ colors }: { colors: ThemeColors }) {
  return (
    <>
      <Para colors={colors}>
        Helm ("we", "us", "our") operates the Helm mobile application and the helmfit.com website (collectively, the "Service"). This Privacy Policy explains what information we collect, how we use it, and the choices you have.
      </Para>

      <Heading colors={colors}>Data Controller</Heading>
      <Para colors={colors}>
        The data controller responsible for your personal data is Helm. Contact: helmfitness@outlook.com.
      </Para>

      <Heading colors={colors}>1. Information We Collect</Heading>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Account information. </Text>
        When you create an account, we collect your name, email address, and password. Your password is hashed by our authentication provider and is never stored in plain text.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Profile information. </Text>
        During onboarding you provide your biological sex, bodyweight, preferred unit system, and training focus. This information is used solely to personalise the app experience.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Fitness data. </Text>
        Workout logs, run sessions (including GPS route data for outdoor runs), nutrition entries, body measurements, bodyweight history, progress photo metadata, custom exercises, saved meals, and workout templates are stored in your account.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Device-local data. </Text>
        Certain data never leaves your device: in-progress workout and run drafts, draft food entries, theme preferences, and progress photo image files.
      </Para>

      <Heading colors={colors}>2. How Your Data Is Stored</Heading>
      <Para colors={colors}>Your fitness data is stored in two places:</Para>
      <BulletGroup>
        <Bullet colors={colors}>On your device in local storage, which serves as the primary, fast-access copy.</Bullet>
        <Bullet colors={colors}>In the cloud via Supabase, a hosted PostgreSQL database secured with row-level security policies. Each user can only read and write their own data. Data is transmitted over HTTPS/TLS encryption in transit and encrypted at rest.</Bullet>
      </BulletGroup>
      <Para colors={colors}>Cloud sync ensures your data persists across devices and survives app reinstallation.</Para>

      <Heading colors={colors}>3. How We Use Your Information</Heading>
      <BulletGroup>
        <Bullet colors={colors}>Provide, maintain, and improve the Service</Bullet>
        <Bullet colors={colors}>Authenticate your identity and secure your account</Bullet>
        <Bullet colors={colors}>Sync your fitness data across your devices</Bullet>
        <Bullet colors={colors}>Personalise the app based on your profile and training focus</Bullet>
      </BulletGroup>

      <Heading colors={colors}>4. Legal Basis for Processing (GDPR)</Heading>
      <Para colors={colors}>If you are in the EEA, UK, or Switzerland, we process your data on these bases:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Performance of a contract (Art. 6(1)(b)) -processing account, profile, and fitness data is necessary to provide the Service.</Bullet>
        <Bullet colors={colors}>Legitimate interest (Art. 6(1)(f)) -maintaining the security and integrity of the Service. We do not use your data for profiling, marketing, or advertising.</Bullet>
        <Bullet colors={colors}>Consent (Art. 6(1)(a)) -where we collect your email via the website for notifications. You may withdraw consent at any time.</Bullet>
      </BulletGroup>

      <Heading colors={colors}>5. What We Do Not Do</Heading>
      <BulletGroup>
        <Bullet colors={colors}>We do not sell, rent, license, or share your personal data with third parties.</Bullet>
        <Bullet colors={colors}>We do not include advertising SDKs, ad networks, or targeted advertising of any kind.</Bullet>
        <Bullet colors={colors}>We do not include analytics SDKs or telemetry. We do not track which screens you visit, how often you work out, or any behavioural data.</Bullet>
        <Bullet colors={colors}>We do not use your data to train machine learning models.</Bullet>
      </BulletGroup>

      <Heading colors={colors}>6. Third-Party Services</Heading>
      <BulletGroup>
        <Bullet colors={colors}>Supabase (authentication and database hosting) -processes your account credentials and stores your synced fitness data.</Bullet>
        <Bullet colors={colors}>USDA FoodData Central -used to look up nutritional information. No personal data is sent.</Bullet>
        <Bullet colors={colors}>Open Food Facts -used for barcode-based food lookups. Only the barcode number is sent.</Bullet>
      </BulletGroup>

      <Heading colors={colors}>7. Data Retention</Heading>
      <Para colors={colors}>We retain your data for as long as your account is active. If you delete your account, all associated data in our cloud database is permanently and irreversibly deleted. Local data can be removed by uninstalling the app.</Para>

      <Heading colors={colors}>8. Data Export and Deletion</Heading>
      <Para colors={colors}>You can export all of your data at any time from the Account screen in JSON and CSV formats. You can delete your account and all associated cloud data at any time from the Account screen. Account deletion is permanent and cannot be undone.</Para>

      <Heading colors={colors}>9. Data Security</Heading>
      <BulletGroup>
        <Bullet colors={colors}>HTTPS/TLS encryption for all data in transit</Bullet>
        <Bullet colors={colors}>Encryption at rest by our database hosting provider</Bullet>
        <Bullet colors={colors}>Row-level security policies ensuring users can only access their own data</Bullet>
        <Bullet colors={colors}>Hashed password storage</Bullet>
      </BulletGroup>
      <Para colors={colors}>No system is perfectly secure. While we strive to protect your data, we cannot guarantee absolute security.</Para>

      <Heading colors={colors}>10. Children and Age Requirements</Heading>
      <Para colors={colors}>The Service is not directed at children under 13. In jurisdictions where the minimum age for data processing is higher (e.g. 16 in certain EU member states), you must meet that requirement or have parental consent. If you believe a child has created an account, please contact us.</Para>

      <Heading colors={colors}>11. International Data Transfers</Heading>
      <Para colors={colors}>Your data may be processed outside your country of residence on Supabase cloud infrastructure. Where data is transferred from the EEA, UK, or Switzerland, we rely on appropriate safeguards as required by applicable law.</Para>

      <Heading colors={colors}>12. Your Rights</Heading>
      <Para colors={colors}>All users may access, correct, export, and delete their data via in-app tools.</Para>
      <Para colors={colors}>EEA, UK, and Swiss residents additionally have the right to object to processing, restrict processing, withdraw consent, and lodge a complaint with a supervisory authority (e.g. ICO in the UK, DPC in Ireland).</Para>

      <Heading colors={colors}>13. California Residents (CCPA/CPRA)</Heading>
      <Para colors={colors}>California residents have additional rights under the CCPA and CPRA:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Right to know what personal information we collect and why</Bullet>
        <Bullet colors={colors}>Right to delete your personal information</Bullet>
        <Bullet colors={colors}>Right to correct inaccurate information</Bullet>
        <Bullet colors={colors}>Right to opt-out of sale/sharing -we do not sell or share your data</Bullet>
        <Bullet colors={colors}>Right to non-discrimination for exercising your rights</Bullet>
      </BulletGroup>
      <Para colors={colors}>We collect: identifiers (name, email), biological sex, geolocation (GPS during runs), and health/fitness information. We do not sell your personal information. We respond to verifiable requests within 45 days.</Para>

      <Heading colors={colors}>14. Changes to This Policy</Heading>
      <Para colors={colors}>We may update this Privacy Policy from time to time. Material changes will be communicated through the app or website. Continued use after changes constitutes acceptance.</Para>

      <Heading colors={colors}>15. Contact Us</Heading>
      <Para colors={colors}>
        If you have questions, contact us at{' '}
        <Link href="mailto:helmfitness@outlook.com" colors={colors}>helmfitness@outlook.com</Link>.
      </Para>
    </>
  );
}

function TermsContent({ colors }: { colors: ThemeColors }) {
  return (
    <>
      <Para colors={colors}>
        These Terms of Service ("Terms") govern your access to and use of the Helm mobile application and the helmfit.com website (collectively, the "Service"), operated by Helm ("we", "us", "our"). By creating an account or using the Service, you agree to be bound by these Terms.
      </Para>

      <Heading colors={colors}>1. Eligibility</Heading>
      <Para colors={colors}>You must be at least 13 years of age to use the Service. If you are under 18, you represent that you have the consent of a parent or legal guardian. By using the Service, you represent that the information you provide during registration is accurate and complete.</Para>

      <Heading colors={colors}>2. Account Registration and Security</Heading>
      <Para colors={colors}>To use the Service, you must create an account with a valid email address and password. You are responsible for:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Maintaining the confidentiality of your login credentials</Bullet>
        <Bullet colors={colors}>All activity that occurs under your account</Bullet>
        <Bullet colors={colors}>Notifying us promptly if you suspect unauthorised use of your account</Bullet>
      </BulletGroup>

      <Heading colors={colors}>3. The Service</Heading>
      <Para colors={colors}>Helm is a fitness tracking application that allows you to log workouts, track runs with GPS, monitor nutrition, record body measurements, and track progress over time. The Service includes cloud synchronisation of your data across devices.</Para>
      <Para colors={colors}>The Service is provided on an "as-is" and "as-available" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</Para>

      <Heading colors={colors}>4. Health and Fitness Disclaimer</Heading>
      <Para colors={colors}>Helm is a fitness tracking tool. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Features such as one-rep max estimates, race predictions, and nutritional tracking are informational tools only.</Para>
      <BulletGroup>
        <Bullet colors={colors}>Consult a qualified healthcare professional before starting or modifying any exercise programme</Bullet>
        <Bullet colors={colors}>Consult a registered dietitian or medical professional before making significant dietary changes</Bullet>
        <Bullet colors={colors}>Do not rely on the Service as a substitute for professional medical advice</Bullet>
        <Bullet colors={colors}>Stop exercising and seek medical attention if you experience pain, dizziness, or other warning signs</Bullet>
      </BulletGroup>
      <Para colors={colors}>You acknowledge that all physical exercise carries inherent risks and you participate at your own risk.</Para>

      <Heading colors={colors}>5. Your Data</Heading>
      <Para colors={colors}>You retain ownership of all data and content you create through the Service. By using the Service, you grant us a limited licence to store, process, and transmit your data solely for the purpose of providing the Service. You can export or delete your data at any time. See our Privacy Policy for details.</Para>

      <Heading colors={colors}>6. Acceptable Use</Heading>
      <Para colors={colors}>You agree not to:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Reverse-engineer, decompile, or attempt to derive the source code of the Service</Bullet>
        <Bullet colors={colors}>Use the Service for any unlawful purpose</Bullet>
        <Bullet colors={colors}>Attempt to gain unauthorised access to any systems connected to the Service</Bullet>
        <Bullet colors={colors}>Interfere with or disrupt the integrity or performance of the Service</Bullet>
        <Bullet colors={colors}>Circumvent, disable, or interfere with security features of the Service</Bullet>
      </BulletGroup>

      <Heading colors={colors}>7. Intellectual Property</Heading>
      <Para colors={colors}>The Service, including all software, design, content, and underlying technology, is owned by Helm and protected by copyright, trademark, and other intellectual property laws. These Terms do not grant you rights to use the Helm name, logo, or trademarks.</Para>

      <Heading colors={colors}>8. Third-Party Services</Heading>
      <Para colors={colors}>The Service integrates with third-party services (Supabase, USDA FoodData Central, Open Food Facts). Your use of these integrations may be subject to those parties' terms. We are not responsible for the availability or practices of third-party services.</Para>

      <Heading colors={colors}>9. Updates and Changes</Heading>
      <Para colors={colors}>We may update the Service and these Terms from time to time. Material changes will be communicated through the app or website. Continued use after changes constitutes acceptance. If you do not agree, you should stop using the Service.</Para>

      <Heading colors={colors}>10. Termination</Heading>
      <Para colors={colors}>You may stop using the Service at any time by deleting your account. We reserve the right to suspend or terminate your access at any time, with or without cause and without notice, including for violation of these Terms.</Para>

      <Heading colors={colors}>11. Limitation of Liability</Heading>
      <Para colors={colors}>To the maximum extent permitted by law, Helm and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, or personal injury arising from your use of the Service.</Para>
      <Para colors={colors}>Our total aggregate liability shall not exceed the greater of (a) the amount you paid for the Service in the twelve months preceding the claim, or (b) fifty US dollars (USD $50). Some jurisdictions do not allow these limitations; in such cases, our liability is limited to the greatest extent permitted by law.</Para>

      <Heading colors={colors}>12. Indemnification</Heading>
      <Para colors={colors}>You agree to indemnify and hold harmless Helm and its developers from any claims, liabilities, damages, losses, and expenses arising from your use of the Service or violation of these Terms.</Para>

      <Heading colors={colors}>13. Governing Law</Heading>
      <Para colors={colors}>These Terms shall be governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. Before formal proceedings, you agree to attempt informal resolution by contacting us.</Para>

      <Heading colors={colors}>14. Severability</Heading>
      <Para colors={colors}>If any provision of these Terms is found unenforceable, that provision shall be limited to the minimum extent necessary and the remaining provisions shall remain in full force.</Para>

      <Heading colors={colors}>15. Entire Agreement</Heading>
      <Para colors={colors}>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Helm regarding the Service.</Para>

      <Heading colors={colors}>16. Contact Us</Heading>
      <Para colors={colors}>
        If you have questions, contact us at{' '}
        <Link href="mailto:helmfitness@outlook.com" colors={colors}>helmfitness@outlook.com</Link>.
      </Para>
    </>
  );
}

export function LegalScreen({ type, onBack }: LegalScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Pressable style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        </Text>
        <Text style={styles.effectiveDate}>Effective date: 10 April 2026</Text>

        {type === 'privacy' ? (
          <PrivacyContent colors={colors} />
        ) : (
          <TermsContent colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  effectiveDate: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.md,
  },
});
