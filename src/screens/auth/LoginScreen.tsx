import { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const theme = useTheme();
  const { login, verifyOtp } = useApp();
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(RNTextInput | null)[]>([]);

  const otpValue = otp.join('');

  const handleSendOtp = async () => {
    if (phone.length === 10) {
      setError('');
      setIsSending(true);
      try {
        await login(phone);
        setShowOtp(true);
      } catch (e: any) {
        setError(e?.message || 'Failed to send OTP. Check your number and try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length === 6) {
      setError('');
      setIsVerifying(true);
      try {
        await verifyOtp(otpValue);
      } catch (e: any) {
        setError(e?.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!digit && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const inputTheme = { colors: { primary: '#0D9488' } };

  return (
    <View style={styles.container}>
      {/* Top wave background */}
      <View style={styles.topBg}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Ionicons name="receipt-outline" size={38} color="#0D9488" />
          </View>
          <Text style={styles.appName}>Smart Billing</Text>
          <Text style={styles.tagline}>Quotations & Invoices, made easy</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Card header strip */}
          <View style={styles.cardStrip}>
            <Ionicons
              name={showOtp ? 'keypad' : 'phone-portrait'}
              size={20}
              color="#fff"
            />
            <Text style={styles.cardStripText}>
              {showOtp ? 'Verify OTP' : 'Sign In'}
            </Text>
          </View>

          <View style={styles.cardBody}>
            {!showOtp ? (
              <>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Welcome Back!
                </Text>
                <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
                  Enter your mobile number to continue
                </Text>

                <TextInput
                  label="Mobile Number"
                  value={phone}
                  onChangeText={setPhone}
                  mode="outlined"
                  keyboardType="phone-pad"
                  maxLength={10}
                  theme={inputTheme}
                  left={<TextInput.Icon icon="phone" color="#0D9488" />}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    phone.length !== 10 && styles.btnDisabled,
                  ]}
                  onPress={handleSendOtp}
                  disabled={phone.length !== 10 || isSending}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSending ? 'Sending...' : 'Send OTP'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Enter OTP
                </Text>
                <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
                  Sent to{' '}
                  <Text style={{ color: '#0D9488', fontWeight: '700' }}>
                    +91 {phone}
                  </Text>
                </Text>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                  {otp.map((digit, idx) => (
                    <RNTextInput
                      key={idx}
                      ref={(r) => { otpRefs.current[idx] = r; }}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : {},
                        { color: theme.colors.onSurface, borderColor: digit ? '#0D9488' : '#E2E8F0' },
                      ]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    otpValue.length !== 6 && styles.btnDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={otpValue.length !== 6 || isVerifying}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {isVerifying ? 'Verifying...' : 'Verify & Login'}
                  </Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </TouchableOpacity>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={() => { setShowOtp(false); setOtp(['', '', '', '', '', '']); }}
                  style={styles.backLink}
                >
                  <Ionicons name="chevron-back" size={16} color="#0D9488" />
                  <Text style={styles.backLinkText}>Change Number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <Text style={styles.footer}>
          By continuing you agree to our{' '}
          <Text style={{ color: '#0D9488', fontWeight: '600' }}>
            Terms of Service
          </Text>
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDFA',
  },
  topBg: {
    backgroundColor: '#0D9488',
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -40,
  },
  logoWrap: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  cardStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0D9488',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  cardStripText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: Spacing.xxl,
  },
  cardTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  cardSub: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.lg,
    backgroundColor: '#fff',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    backgroundColor: '#F8FAFC',
  },
  otpBoxFilled: {
    backgroundColor: '#F0FDFA',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0D9488',
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    ...Shadow.sm,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#fff',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: 2,
  },
  backLinkText: {
    fontSize: FontSize.md,
    color: '#0D9488',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: FontSize.sm,
    color: '#94A3B8',
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: '#EF4444',
    textAlign: 'center',
  },
});
