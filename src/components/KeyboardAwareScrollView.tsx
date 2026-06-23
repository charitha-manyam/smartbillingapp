import { forwardRef, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleProp,
  ViewStyle,
  ScrollViewProps,
  Keyboard,
  TextInput,
} from 'react-native';

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const KeyboardAwareScrollView = forwardRef<ScrollView, Props>(
  ({ children, style, contentContainerStyle, ...rest }, ref) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollOffset = useRef(0);

    const assignRef = (node: ScrollView | null) => {
      (internalRef as React.MutableRefObject<ScrollView | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<ScrollView | null>).current = node;
    };

    useEffect(() => {
      if (Platform.OS !== 'android') return;
      const sub = Keyboard.addListener('keyboardDidShow', (e) => {
        const focusedInput = TextInput.State.currentlyFocusedInput();
        if (!focusedInput) return;
        focusedInput.measure((_x, _y, _w, height, _pageX, pageY) => {
          const visibleBottom = e.endCoordinates.screenY;
          const inputBottom = pageY + height + 24;
          if (inputBottom > visibleBottom) {
            const scrollBy = inputBottom - visibleBottom;
            internalRef.current?.scrollTo({
              y: scrollOffset.current + scrollBy,
              animated: true,
            });
          }
        });
      });
      return () => sub.remove();
    }, []);

    if (Platform.OS === 'android') {
      return (
        <ScrollView
          ref={assignRef}
          style={[{ flex: 1 }, style]}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => { scrollOffset.current = e.nativeEvent.contentOffset.y; }}
          {...rest}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <KeyboardAvoidingView style={[{ flex: 1 }, style]} behavior="padding">
        <ScrollView
          ref={assignRef}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);
