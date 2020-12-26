import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions
} from 'react-native';

import { theme } from '@constants';

const FormattedInput: React.FC<{
  style?: StyleProp<ViewStyle>;
  placeholderText?: string;
  value: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  password?: boolean;
  textContentType?: string;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  autoFocus?: boolean;
  blurOnSubmit?: boolean;
  error?: boolean;
  editable?: boolean;
  ref?(ref): void;
  formatter?(text: string): string;
  onChangeText?(text: string): void;
  onSubmit?(text: string): void;
}> = ({
  style,
  placeholderText,
  value,
  keyboardType = 'default',
  returnKeyType,
  password = false,
  textContentType = 'none',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  autoFocus = false,
  blurOnSubmit = !multiline,
  error = false,
  editable = true,
  ref = (ref) => {},
  formatter = (text: string) => text,
  onChangeText = (text: string) => {},
  onSubmit = (text: string) => {}
}) => {
  const handleTextChange = React.useCallback(
    (text: string) => {
      onChangeText(formatter(text));
    },
    [formatter, onChangeText]
  );

  const handleSubmit = React.useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      onSubmit(e.nativeEvent.text);
    },
    [onSubmit]
  );

  return (
    <TextInput
      ref={ref}
      style={[
        styles.input,
        style,
        error && { backgroundColor: theme.COLORS.INPUT_ERROR_LIGHT, borderColor: theme.COLORS.INPUT_ERROR },
        !editable && { opacity: 0.7 }
      ]}
      autoFocus={autoFocus}
      blurOnSubmit={blurOnSubmit}
      editable={editable}
      placeholder={placeholderText}
      placeholderTextColor={theme.COLORS.MUTED}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={numberOfLines}
      value={value}
      onChangeText={handleTextChange}
      onSubmitEditing={handleSubmit}
      keyboardType={keyboardType}
      returnKeyType={returnKeyType}
      // @ts-ignore
      textContentType={textContentType}
      secureTextEntry={password}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 4,
    paddingHorizontal: 8,
    height: 38,
    borderRadius: 4,
    backgroundColor: theme.COLORS.SUPER_LIGHT_BLUE_GRAY,
    borderColor: theme.COLORS.LIGHT_BORDER,
    borderWidth: 1
  }
});

export default FormattedInput;
