import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../Toast';

const EditWidgetModal = ({
  visible,
  onClose,
  widget,
  onWidgetUpdated,
  themeStyles,
}) => {
  const { showAlert } = useContext(AuthContext);
  const [label, setLabel] = useState('');
  const [virtualPin, setVirtualPin] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form when widget changes
  useEffect(() => {
    if (widget && visible) {
      setLabel(widget.label || '');
      // Handle virtual_pin from both nested (config.virtual_pin) and flattened (virtual_pin) formats
      setVirtualPin(widget.virtual_pin || widget.config?.virtual_pin || '');
    }
  }, [widget, visible]);

  const handleUpdate = useCallback(async () => {
    if (!widget?._id) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Widget not found',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    if (isUpdating) return;

    // Validate virtual pin if provided (only for LED widgets)
    if (widget.type === 'led' && virtualPin?.trim()) {
      const pinValue = virtualPin.trim().toLowerCase();
      if (!/^v\d+$/.test(pinValue)) {
        showAlert({
          type: 'warning',
          title: 'Invalid Virtual Pin',
          message: 'Virtual pin must be in format v0, v1, v2, etc. (e.g., v0, v1, v2)',
          buttons: [{ text: 'OK' }],
        });
        return;
      }
    }

    try {
      setIsUpdating(true);
      
      const updateData = {};
      
      // Update label if changed
      if (label?.trim() && label.trim() !== widget.label) {
        updateData.label = label.trim();
      }
      
      // Update virtual pin if changed (only for LED widgets)
      if (widget.type === 'led') {
        // Get current pin from both possible locations
        const currentPin = (widget.virtual_pin || widget.config?.virtual_pin || '').toLowerCase();
        const newPin = virtualPin.trim().toLowerCase();
        
        if (newPin !== currentPin) {
          // Always update via config object
          updateData.config = {
            ...(widget.config || {}),
            virtual_pin: newPin || undefined, // Remove if empty (will auto-assign)
          };
        }
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        showToast.info('No changes to save');
        onClose();
        return;
      }

      const updatedWidget = await api.updateWidget(widget._id, updateData);

      if (updatedWidget) {
        onWidgetUpdated(); // Notify parent to refetch widgets
        showToast.success('Widget updated successfully');
        onClose();
      }
    } catch (err) {
      console.error('❌ Update widget error:', err);
      const errorMessage = err.message || 'Failed to update widget';
      showToast.error('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [widget, label, virtualPin, isUpdating, onWidgetUpdated, onClose, showAlert]);

  if (!widget) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, themeStyles.modalCard]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themeStyles.modalTitle]}>
              Edit Widget
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={themeStyles.modalTitle.color} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, themeStyles.modalSubtitle]}>
            Update widget settings
          </Text>

          <ScrollView style={styles.scrollContent}>
            <Text style={[styles.modalLabel, themeStyles.modalLabel]}>Widget Label</Text>
            <TextInput
              style={[styles.input, themeStyles.input]}
              placeholder="Widget label"
              placeholderTextColor={themeStyles.input.color + '80'}
              value={label}
              onChangeText={setLabel}
            />

            {widget.type === 'led' && (
              <>
                <Text style={[styles.modalLabel, themeStyles.modalLabel]}>
                  Virtual Pin
                </Text>
                <TextInput
                  style={[styles.input, themeStyles.input]}
                  placeholder="v0, v1, v2, etc."
                  placeholderTextColor={themeStyles.input.color + '80'}
                  value={virtualPin}
                  onChangeText={(text) => setVirtualPin(text.toLowerCase())}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={[styles.hint, themeStyles.modalSubtitle]}>
                  Virtual pin format: v followed by number (e.g., v0, v1, v2). 
                  This allows multiple LEDs on the same device.
                </Text>
              </>
            )}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalCancel]}
              onPress={onClose}
              disabled={isUpdating}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalConfirm]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalConfirmText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  scrollContent: {
    maxHeight: 400,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: '#e2e8f0',
  },
  modalConfirm: {
    backgroundColor: '#2563eb',
  },
  modalCancelText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default React.memo(EditWidgetModal);

