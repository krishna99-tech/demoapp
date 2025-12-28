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
            padding: 20
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
            borderColor: alpha(Colors.primary, 0.2)
          }
        ]}>
          {icon}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>
            {label}
          </Text>
          <Text style={[styles.infoValue, { color: Colors.text }]} numberOfLines={1}>
            {value || placeholder || 'Not set'}
          </Text>
        </View>
        {onPress && <ChevronRight size={20} color={Colors.textMuted} />}
      </TouchableOpacity>
    );
  }

  // Editing mode
  return (
    <View style={[
      styles.infoRow, 
      { 
        borderBottomColor: Colors.border,
        padding: 20
      }
    ]}>
      <View style={[
        styles.infoIcon, 
        { 
          backgroundColor: alpha(Colors.primary, 0.1),
          borderColor: alpha(Colors.primary, 0.2)
        }
      ]}>
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: Colors.textMuted }]}>
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
                backgroundColor: Colors.surfaceLight,
                borderColor: Colors.primary
              }
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
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
                <EyeOff size={18} color={Colors.textMuted} />
              ) : (
                <Eye size={18} color={Colors.textMuted} />
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
    backgroundColor: '#fff',
    minHeight: 60,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFF0F3',
  },
  rowPressed: {
    backgroundColor: '#F7F7FA',
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    backgroundColor: '#ECE5DD', // WhatsApp light icon-pill bg
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#667781', // WhatsApp muted label color
    marginBottom: 3,
    marginLeft: 2,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "700",
    color: '#222E34', // WhatsApp dark main text
    marginBottom: 1,
    marginLeft: 2,
  },
  inputField: {
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: 'transparent',
    borderBottomColor: '#25D366', // WhatsApp green
    borderBottomWidth: 2,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 12,
    paddingBottom: 8,
    marginHorizontal: 2,
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
