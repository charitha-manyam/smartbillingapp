import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius, Shadow } from '../../constants';
import { useApp } from '../../context/AppContext';

export default function LoginScreen() {
  const theme = useTheme();
  const { googleLogin } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin();
    } catch (e: any) {
      const msg = e?.message || e?.code || String(e) || 'Unknown error';
      if (msg.includes('cancelled') || msg.includes('SIGN_IN_CANCELLED')) {
        // user cancelled — no error shown
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top hero section */}
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

      {/* Card */}
      <View style={styles.cardWrap}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardStrip}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.cardStripText}>Sign In</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
              Sign in with your Google account to continue
            </Text>

            <TouchableOpacity
              style={[styles.googleBtn, isLoading && styles.btnDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#3B82F6" size="small" />
              ) : (
                <View style={styles.googleIcon}>
                  {/* Google 'G' logo using coloured quadrants */}
                  <Text style={styles.googleG}>G</Text>
                </View>
              )}
              <Text style={styles.googleBtnText}>
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        <Text style={styles.footer}>
          By continuing you agree to our{' '}
          <Text style={{ color: '#0D9488', fontWeight: '600' }}>
            Terms of Service
          </Text>
        </Text>
      </View>
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
  cardWrap: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
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
    marginBottom: Spacing.xxl,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Shadow.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
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
