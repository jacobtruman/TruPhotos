import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { PlexProfile } from '../types';

export const ProfileSelectionScreen: React.FC = () => {
  const { profiles, selectProfile, logout, user } = useAuth();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedProfileForPin, setSelectedProfileForPin] = useState<PlexProfile | null>(null);
  const [pin, setPin] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

  const focusPinInput = useCallback(() => {
    // Use requestAnimationFrame to ensure the modal is fully rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    });
  }, []);

  useEffect(() => {
    if (pinModalVisible) {
      focusPinInput();
    }
  }, [pinModalVisible, focusPinInput]);

  const handleProfilePress = async (profile: PlexProfile) => {
    if (isSwitching) return; // Prevent multiple taps

    if (profile.pin) {
      setSelectedProfileForPin(profile);
      setPinModalVisible(true);
    } else {
      setIsSwitching(true);
      try {
        await selectProfile(profile);
      } catch (error) {
        console.error('Failed to switch profile:', error);
        Alert.alert('Error', 'Failed to switch profile. Please try again.');
      } finally {
        setIsSwitching(false);
      }
    }
  };

  const handlePinSubmit = async () => {
    if (!selectedProfileForPin || isSwitching) return;

    // Validate PIN is not empty
    if (!pin || pin.trim().length === 0) {
      Alert.alert('PIN Required', 'Please enter your PIN.');
      return;
    }

    setIsSwitching(true);
    try {
      // Pass the PIN to the API for validation
      await selectProfile(selectedProfileForPin, pin);
      setPinModalVisible(false);
      setPin('');
      setSelectedProfileForPin(null);
    } catch {
      // Expected error when PIN is incorrect - only show UI alert, no console logging
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    } finally {
      setIsSwitching(false);
    }
  };

  const renderProfile = ({ item }: { item: PlexProfile }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleProfilePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.thumb ? (
          <Image source={{ uri: item.thumb }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={40} color={colors.textMuted} />
          </View>
        )}
        {item.pin && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color={colors.textPrimary} />
          </View>
        )}
        {item.admin && (
          <View style={styles.adminBadge}>
            <Ionicons name="star" size={12} color={colors.primary} />
          </View>
        )}
      </View>
      <Text style={styles.profileName} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select a Profile</Text>
        {user && (
          <Text style={styles.subtitle}>Signed in as {user.username}</Text>
        )}
      </View>

      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.profileGrid}
        columnWrapperStyle={styles.row}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>

      {/* PIN Entry Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter PIN</Text>
            <Text style={styles.modalSubtitle}>
              Enter PIN for {selectedProfileForPin?.title}
            </Text>
            <TextInput
              ref={pinInputRef}
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              placeholder="••••"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handlePinSubmit}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setPinModalVisible(false);
                  setPin('');
                  setSelectedProfileForPin(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handlePinSubmit}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isSwitching && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  profileGrid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  row: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    width: 140,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.xs,
  },
  adminBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: spacing.xs,
  },
  profileName: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  logoutText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pinInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    width: 120,
    alignSelf: 'center',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalSubmitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    ...typography.body,
    color: colors.backgroundDark,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
});
