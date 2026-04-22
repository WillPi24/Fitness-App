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
      <Para colors={colors}>
        Helm is a fitness tracking tool, not a medical service. We do not provide medical advice, diagnosis, or treatment, and we do not collect or process clinical health data.
      </Para>

      <Heading colors={colors}>Data Controller</Heading>
      <Para colors={colors}>
        The data controller responsible for your personal data is Helm. Contact: helmfitness@outlook.com.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>EU representative. </Text>
        Helm is operated from the United Kingdom. We do not currently process personal data of individuals in the European Union on a scale that we consider to require the appointment of a representative under Article 27 of the EU GDPR. We keep this position under review and will appoint a representative if our processing changes in scope or scale.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Data Protection Officer. </Text>
        We are not required to appoint a Data Protection Officer under Article 37 GDPR, as we do not carry out large-scale monitoring or large-scale processing of special category data.
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
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Subscription information. </Text>
        If you subscribe to Full Sail, subscription status, purchase receipts, and a device identifier (IDFV on iOS, a vendor identifier on Android) are processed by RevenueCat on our behalf. Payment details are handled entirely by Apple or Google and are never received by us.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Device-local data. </Text>
        Certain data never leaves your device: in-progress workout and run drafts, draft food entries, theme preferences, and progress photo image files.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Providing data is required to use the Service. </Text>
        Providing your account information is a requirement for creating and using an account. You are not obliged to provide it, but if you choose not to, you will not be able to sign up, sync data across devices, or access Full Sail features.
      </Para>

      <Heading colors={colors}>2. Device Permissions</Heading>
      <Para colors={colors}>Helm asks for the following device permissions. You can decline or revoke any of them in your device settings; doing so disables the related feature but does not prevent you from using the rest of the Service.</Para>
      <BulletGroup>
        <Bullet colors={colors}>Location (when in use and in background) -used to record GPS routes during outdoor cardio sessions. Background location is only active while a run is in progress.</Bullet>
        <Bullet colors={colors}>Camera -used to scan food barcodes for calorie tracking and to capture progress photos.</Bullet>
        <Bullet colors={colors}>Photo library -used to import existing progress photos from your device.</Bullet>
      </BulletGroup>
      <Para colors={colors}>Helm does not request access to your contacts, health records (Apple Health / Google Fit), calendar, microphone for recording, or motion &amp; fitness sensors. We do not send push notifications. If we add push notifications in the future, we will update this policy and request your system-level permission first.</Para>

      <Heading colors={colors}>3. How Your Data Is Stored</Heading>
      <Para colors={colors}>Your fitness data is stored in two places:</Para>
      <BulletGroup>
        <Bullet colors={colors}>On your device in local storage, which serves as the primary, fast-access copy.</Bullet>
        <Bullet colors={colors}>In the cloud via Supabase, a hosted PostgreSQL database secured with row-level security policies. Each user can only read and write their own data. Data is transmitted over HTTPS/TLS encryption in transit and encrypted at rest.</Bullet>
      </BulletGroup>
      <Para colors={colors}>Cloud sync ensures your data persists across devices and survives app reinstallation. Subscription status is stored by RevenueCat, our subscription management provider, keyed to an anonymous subscriber identifier.</Para>

      <Heading colors={colors}>4. How We Use Your Information</Heading>
      <BulletGroup>
        <Bullet colors={colors}>Provide, maintain, and improve the Service</Bullet>
        <Bullet colors={colors}>Authenticate your identity and secure your account</Bullet>
        <Bullet colors={colors}>Sync your fitness data across your devices</Bullet>
        <Bullet colors={colors}>Personalise the app based on your profile and training focus</Bullet>
        <Bullet colors={colors}>Process and validate your Full Sail subscription, including restoring purchases on new devices</Bullet>
      </BulletGroup>

      <Heading colors={colors}>5. Legal Basis for Processing (GDPR)</Heading>
      <Para colors={colors}>If you are in the EEA, UK, or Switzerland, we process your data on these bases:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Performance of a contract (Art. 6(1)(b)) -processing account, profile, fitness, and subscription data is necessary to provide the Service.</Bullet>
        <Bullet colors={colors}>Legitimate interest (Art. 6(1)(f)) -maintaining the security and integrity of the Service. We do not use your data for profiling, marketing, or advertising.</Bullet>
      </BulletGroup>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Fitness data is not processed as health data. </Text>
        Helm tracks performance metrics (bodyweight, measurements, workouts, runs, nutrition) for self-directed fitness use. We do not interpret this data medically, do not provide diagnostic outputs, and do not combine it with medical history. We therefore treat it as ordinary personal data under Art. 6, not as data concerning health under Art. 9. If the scope of the Service ever changes in a way that requires Art. 9 treatment, we will update this policy and obtain explicit consent first.
      </Para>

      <Heading colors={colors}>6. What We Do Not Do</Heading>
      <BulletGroup>
        <Bullet colors={colors}>We do not sell, rent, license, or share your personal data with third parties for their own purposes.</Bullet>
        <Bullet colors={colors}>We do not include advertising SDKs, ad networks, or targeted advertising of any kind.</Bullet>
        <Bullet colors={colors}>We do not include behavioural analytics SDKs. We do not track which screens you visit, how often you work out, or any behavioural data. (RevenueCat collects limited SDK telemetry -app version, OS version, device model -as part of processing your subscription.)</Bullet>
        <Bullet colors={colors}>We do not include crash reporting, performance monitoring, or diagnostic SDKs. We do not receive crash logs or technical telemetry from your device.</Bullet>
        <Bullet colors={colors}>We do not send marketing emails or newsletters.</Bullet>
        <Bullet colors={colors}>We do not use your data to train machine learning models.</Bullet>
      </BulletGroup>

      <Heading colors={colors}>7. Third-Party Services</Heading>
      <BulletGroup>
        <Bullet colors={colors}>Supabase (authentication and database hosting) -processes your account credentials and stores your synced fitness data.</Bullet>
        <Bullet colors={colors}>RevenueCat (subscription management) -processes subscription status, purchase receipts, and a device identifier to validate your Full Sail entitlement.</Bullet>
        <Bullet colors={colors}>Apple App Store (iOS) and Google Play (Android) -process subscription payments directly. Your payment card details are never received by us.</Bullet>
        <Bullet colors={colors}>OpenFreeMap -provides map tiles during cardio tracking. Tile requests include the viewport region; no account data is shared.</Bullet>
        <Bullet colors={colors}>USDA FoodData Central -used to look up nutritional information. No personal data is sent.</Bullet>
        <Bullet colors={colors}>Open Food Facts -used for barcode-based food lookups. Only the barcode number is sent.</Bullet>
      </BulletGroup>
      <Para colors={colors}>All processors listed above are contractually or via their published privacy terms required to provide equivalent levels of data protection and confidentiality, including -where data is transferred from the EEA or UK to a country without an adequacy decision -through the standard contractual clauses approved by the European Commission and the UK Information Commissioner's Office.</Para>

      <Heading colors={colors}>8. Website</Heading>
      <Para colors={colors}>The helmfit.com website is a static marketing and information site. It does not use cookies, analytics, tracking pixels, or any other tracking technologies. It does not collect personal information from visitors. No account can be created on the website itself; accounts are created only in the mobile app.</Para>

      <Heading colors={colors}>9. Data Retention</Heading>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Account and fitness data. </Text>
        Retained for as long as your account is active. Account deletion permanently and irreversibly removes all associated data from our cloud database, typically within 30 days.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Database backups. </Text>
        Supabase maintains automated backups on a rolling window (typically up to 7 days). Deleted data is overwritten in backups on that rolling schedule.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Subscription records. </Text>
        Records held by RevenueCat, Apple, or Google may be retained per their own policies and UK financial-records law (generally six years for VAT and tax records).
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Local data. </Text>
        Removed by uninstalling the app or clearing app storage.
      </Para>

      <Heading colors={colors}>10. Data Export and Deletion</Heading>
      <Para colors={colors}>You can export all of your data at any time from the Account screen in JSON and CSV formats. You can delete your account and all associated cloud data at any time from the Account screen. Account deletion is permanent and cannot be undone. Cancelling a Full Sail subscription must be done separately through your Apple ID or Google Play account.</Para>

      <Heading colors={colors}>11. Data Security</Heading>
      <BulletGroup>
        <Bullet colors={colors}>HTTPS/TLS encryption for all data in transit</Bullet>
        <Bullet colors={colors}>Encryption at rest by our database hosting provider</Bullet>
        <Bullet colors={colors}>Row-level security policies ensuring users can only access their own data</Bullet>
        <Bullet colors={colors}>Hashed password storage</Bullet>
        <Bullet colors={colors}>No storage of payment card details -all billing is handled by Apple or Google</Bullet>
      </BulletGroup>
      <Para colors={colors}>No system is perfectly secure. If we become aware of a data breach affecting your personal information, we will notify affected users promptly and, where required, notify the relevant supervisory authority within 72 hours.</Para>

      <Heading colors={colors}>12. Children and Age Requirements</Heading>
      <Para colors={colors}>The Service is not directed at children under 13. In jurisdictions where the minimum age for data processing is higher (e.g. 16 in certain EU member states), you must meet that requirement or have parental consent. If you believe a child has created an account, please contact us.</Para>

      <Heading colors={colors}>13. International Data Transfers</Heading>
      <Para colors={colors}>Your data may be processed outside your country of residence on Supabase and RevenueCat infrastructure. Where data is transferred from the EEA, UK, or Switzerland to a country without an adequacy decision, we rely on appropriate safeguards including the EU standard contractual clauses and the UK International Data Transfer Addendum.</Para>

      <Heading colors={colors}>14. Your Rights</Heading>
      <Para colors={colors}>All users may access, correct, export, and delete their data via in-app tools.</Para>
      <Para colors={colors}>EEA, UK, and Swiss residents additionally have the right to object to processing, restrict processing, withdraw consent, and lodge a complaint with a supervisory authority (e.g. ICO in the UK, DPC in Ireland).</Para>

      <Heading colors={colors}>15. California Residents (CCPA/CPRA)</Heading>
      <Para colors={colors}>California residents have additional rights under the CCPA and CPRA:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Right to know what personal information we collect and why</Bullet>
        <Bullet colors={colors}>Right to delete your personal information</Bullet>
        <Bullet colors={colors}>Right to correct inaccurate information</Bullet>
        <Bullet colors={colors}>Right to opt-out of sale/sharing -we do not sell or share your data</Bullet>
        <Bullet colors={colors}>Right to non-discrimination for exercising your rights</Bullet>
      </BulletGroup>
      <Para colors={colors}>Categories of personal information we collect: identifiers (name, email, account ID, device identifier), biological sex, geolocation (GPS during runs), health/fitness information, and commercial information (Full Sail subscription status and purchase history). Sources: directly from you, and from Apple/Google via RevenueCat for subscription records. We disclose these only to the service providers listed in Section 7, for the purposes described there. We do not sell your personal information. We respond to verifiable requests within 45 days.</Para>

      <Heading colors={colors}>16. Changes to This Policy</Heading>
      <Para colors={colors}>We may update this Privacy Policy from time to time. Material changes will be communicated through the app or website. Continued use after changes constitutes acceptance.</Para>

      <Heading colors={colors}>17. Contact Us</Heading>
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

      <Heading colors={colors}>4. Subscriptions and Billing</Heading>
      <Para colors={colors}>Helm is free to download and use. A paid tier called Full Sail unlocks additional features (including advanced strength tools, advanced cardio tools, progress photos, barcode scanning, saved meals, workout templates, and micronutrient tracking). Subscription durations, pricing, and any free trial terms are shown in the app at the time of purchase.</Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Auto-renewal. </Text>
        Subscriptions automatically renew at the end of each billing period at the then-current price unless cancelled at least 24 hours before the end of the current period. Your account will be charged within 24 hours prior to the end of the current period.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Managing and cancelling. </Text>
        You can manage or cancel at any time:
      </Para>
      <BulletGroup>
        <Bullet colors={colors}>On iOS -via Settings → [your name] → Subscriptions, or through the App Store</Bullet>
        <Bullet colors={colors}>On Android -via Google Play → Payments &amp; subscriptions → Subscriptions</Bullet>
      </BulletGroup>
      <Para colors={colors}>Cancelling disables auto-renewal; your access continues until the end of the current billing period.</Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Free trials. </Text>
        If a free trial is offered and you do not cancel before it ends, your subscription will automatically begin at the stated price. Any unused portion of a trial is forfeited upon purchase.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Refunds. </Text>
        All payments are processed by Apple or Google. Refund requests are handled according to their respective policies. We cannot issue refunds directly, except where required by law.
      </Para>
      <Para colors={colors}>
        <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Price changes. </Text>
        If we change a subscription price, we will notify you in advance. You may cancel before the change takes effect.
      </Para>

      <Heading colors={colors}>5. Health and Fitness Disclaimer</Heading>
      <Para colors={colors}>Helm is a fitness tracking tool. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Features such as one-rep max estimates, race predictions, and nutritional tracking are informational tools only.</Para>
      <BulletGroup>
        <Bullet colors={colors}>Consult a qualified healthcare professional before starting or modifying any exercise programme</Bullet>
        <Bullet colors={colors}>Consult a registered dietitian or medical professional before making significant dietary changes</Bullet>
        <Bullet colors={colors}>Do not rely on the Service as a substitute for professional medical advice</Bullet>
        <Bullet colors={colors}>Stop exercising and seek medical attention if you experience pain, dizziness, or other warning signs</Bullet>
      </BulletGroup>
      <Para colors={colors}>You acknowledge that all physical exercise carries inherent risks and you participate at your own risk.</Para>

      <Heading colors={colors}>6. Your Data</Heading>
      <Para colors={colors}>You retain ownership of all data and content you create through the Service. By using the Service, you grant us a limited licence to store, process, and transmit your data solely for the purpose of providing the Service. You can export or delete your data at any time. See our Privacy Policy for details.</Para>

      <Heading colors={colors}>7. Acceptable Use</Heading>
      <Para colors={colors}>You agree not to:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Reverse-engineer, decompile, or attempt to derive the source code of the Service</Bullet>
        <Bullet colors={colors}>Use the Service for any unlawful purpose</Bullet>
        <Bullet colors={colors}>Attempt to gain unauthorised access to any systems connected to the Service</Bullet>
        <Bullet colors={colors}>Interfere with or disrupt the integrity or performance of the Service</Bullet>
        <Bullet colors={colors}>Circumvent, disable, or interfere with security features of the Service, including paid-feature gating</Bullet>
      </BulletGroup>

      <Heading colors={colors}>8. Intellectual Property</Heading>
      <Para colors={colors}>The Service, including all software, design, content, and underlying technology, is owned by Helm and protected by copyright, trademark, and other intellectual property laws. These Terms do not grant you rights to use the Helm name, logo, or trademarks.</Para>

      <Heading colors={colors}>9. Third-Party Services</Heading>
      <Para colors={colors}>The Service integrates with third-party services:</Para>
      <BulletGroup>
        <Bullet colors={colors}>Supabase -authentication and database hosting</Bullet>
        <Bullet colors={colors}>RevenueCat -subscription management</Bullet>
        <Bullet colors={colors}>Apple App Store and Google Play -payment processing for subscriptions</Bullet>
        <Bullet colors={colors}>OpenFreeMap -map tile rendering</Bullet>
        <Bullet colors={colors}>USDA FoodData Central -nutritional information lookups</Bullet>
        <Bullet colors={colors}>Open Food Facts -barcode-based food lookups</Bullet>
      </BulletGroup>
      <Para colors={colors}>Your use of these integrations may be subject to those parties' terms. We are not responsible for the availability or practices of third-party services.</Para>

      <Heading colors={colors}>10. Updates and Changes</Heading>
      <Para colors={colors}>We may update the Service and these Terms from time to time. Material changes will be communicated through the app or website. Continued use after changes constitutes acceptance. If you do not agree, you should stop using the Service.</Para>

      <Heading colors={colors}>11. Termination</Heading>
      <Para colors={colors}>You may stop using the Service at any time by deleting your account. Cancelling a Full Sail subscription must be done separately through your Apple ID or Google Play account (see Section 4). We reserve the right to suspend or terminate your access at any time, with or without cause and without notice, including for violation of these Terms.</Para>

      <Heading colors={colors}>12. Limitation of Liability</Heading>
      <Para colors={colors}>To the maximum extent permitted by law, Helm and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, loss of profits, or personal injury arising from your use of the Service.</Para>
      <Para colors={colors}>Our total aggregate liability shall not exceed the greater of (a) the amount you paid for the Service in the twelve months preceding the claim, or (b) fifty US dollars (USD $50). Some jurisdictions do not allow these limitations; in such cases, our liability is limited to the greatest extent permitted by law.</Para>

      <Heading colors={colors}>13. Indemnification</Heading>
      <Para colors={colors}>You agree to indemnify and hold harmless Helm and its developers from any claims, liabilities, damages, losses, and expenses arising from your use of the Service or violation of these Terms.</Para>

      <Heading colors={colors}>14. Governing Law</Heading>
      <Para colors={colors}>These Terms shall be governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales. Before formal proceedings, you agree to attempt informal resolution by contacting us.</Para>

      <Heading colors={colors}>15. Severability</Heading>
      <Para colors={colors}>If any provision of these Terms is found unenforceable, that provision shall be limited to the minimum extent necessary and the remaining provisions shall remain in full force.</Para>

      <Heading colors={colors}>16. Entire Agreement</Heading>
      <Para colors={colors}>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Helm regarding the Service.</Para>

      <Heading colors={colors}>17. Contact Us</Heading>
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
        <Text style={styles.effectiveDate}>Effective date: 21 April 2026</Text>

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
