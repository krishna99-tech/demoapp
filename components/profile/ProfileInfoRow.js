// ProfileInfoRow.jsx - WhatsApp/Modern Profile Row
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Platform, 
  Pressable,
} from 'react-native';
import { ChevronRight, Eye, EyeOff } from 'lucide-react-native';

// Safe hex + opacity utility
const alpha = (hex, opacity) => {
  const o = Math.round(opacity * 255).toString(16).padStart(2, "0");
  return hex + o;
};

const ProfileInfoRow = ({
  icon,
  label,
  value,
  Colors,
  isEditing = false,
  onChangeText,
  placeholder,
  onPress,
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  maxLength,
  editable = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = secureTextEntry && isEditing;
  // Read-only mode (clickable)
  if (!isEditing) {
    return (
      <TouchableOpacity
        style={[
          styles.infoRow, 
          { 
            borderBottomColor: Colors.border,
            backgroundColor: Colors.surface
          }
        ]}
        onPress={onPress}
        activeOpacity={onPress ? 0.6 : 1}
        disabled={!onPress}
      >
        <View style={[
          styles.infoIcon, 
          { 
            backgroundColor: alpha(Colors.primary, 0.1),
          }
        ]}>
          {icon}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.infoValue, { color: Colors.text }]} numberOfLines={1}>
            {value || placeholder || 'Not set'}
          </Text>
        </View>
        {onPress && <ChevronRight size={20} color={Colors.textSecondary} />}
      </TouchableOpacity>
    );
  }

  // Editing mode
  return (
    <View style={[
      styles.infoRow, 
      { 
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface
      }
    ]}>
      <View style={[
        styles.infoIcon, 
        { 
          backgroundColor: alpha(Colors.primary, 0.1),
        }
      ]}>
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>
          {label}
        </Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[
              styles.inputField,
              multiline && styles.inputFieldMultiline,
              isPasswordField && styles.inputFieldPassword,
              { 
                color: Colors.text,
                borderBottomColor: Colors.primary
              }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "center"}
            selectionColor={Colors.primary}
            clearButtonMode="never"
            secureTextEntry={isPasswordField && !showPassword}
            maxLength={maxLength}
            editable={editable}
          />
          {isPasswordField && (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} color={Colors.textSecondary} />
              ) : (
                <Eye size={18} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressed: {
    opacity: 0.7,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputField: {
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 2,
    minHeight: 44, // Touch target
  },
  inputFieldMultiline: {
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputFieldPassword: {
    paddingRight: 40,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -9 }],
    padding: 4,
  },
});

export default ProfileInfoRow;
