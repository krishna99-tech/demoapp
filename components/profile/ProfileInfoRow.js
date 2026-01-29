import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

const ProfileInfoRow = ({
  icon,
  label,
  value,
  Colors,
  isEditing,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const shouldSecureText = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[
      styles.container, 
      { borderBottomColor: Colors.border },
      { alignItems: multiline ? 'flex-start' : 'center' }
    ]}>
      <View style={[styles.iconContainer, multiline && styles.iconContainerMultiline]}>
        {icon}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.label, { color: Colors.textSecondary }]}>{label}</Text>
        
        {isEditing && editable ? (
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                { color: Colors.text },
                multiline && styles.multilineInput
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={Colors.textSecondary + '80'}
              keyboardType={keyboardType}
              secureTextEntry={shouldSecureText}
              multiline={multiline}
              numberOfLines={numberOfLines}
              maxLength={maxLength}
              textAlignVertical={multiline ? 'top' : 'center'}
              editable={editable}
            />
            
            {secureTextEntry && (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text 
            style={[styles.value, { color: Colors.text }]}
            numberOfLines={multiline ? numberOfLines : 1}
          >
            {value || placeholder || 'Not set'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  iconContainerMultiline: {
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    minHeight: 24,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ProfileInfoRow;