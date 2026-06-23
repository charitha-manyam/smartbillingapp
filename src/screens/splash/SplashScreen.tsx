import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale   = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fades + scales in
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Tagline fades in
      Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Hold for 1 second
      Animated.delay(1000),
      // Fade out entire screen
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={require('../../../assets/splash-logo.png')}
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        Smart Billing
      </Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Simple & Smart Invoicing
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.70,
    height: width * 0.70,
  },
  appName: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: '700',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
});
