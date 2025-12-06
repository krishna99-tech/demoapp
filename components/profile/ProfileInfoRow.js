// ProfileInfoRow.jsx - FULLY EDITABLE VERSION
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';

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
  onPress
}) => {
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
        <TextInput
          style={[
            styles.inputField,
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
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={Colors.primary}
          clearButtonMode="never"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRow: { 
    flexDirection: "row", 
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 16,
    borderWidth: 1,
  },
  infoLabel: { 
    fontSize: 13, 
    fontWeight: '500',
    marginBottom: 4 
  },
  infoValue: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
  inputField: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44, // Touch target
  },
});

export default ProfileInfoRow;
