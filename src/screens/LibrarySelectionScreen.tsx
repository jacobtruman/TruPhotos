import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors, spacing, borderRadius, typography, commonStyles } from '../theme';
import { FloatingRefreshButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { PlexLibrary } from '../types';

const ItemSeparator = () => <View style={styles.separator} />;

export const LibrarySelectionScreen: React.FC = () => {
  const { libraries, selectLibrary, refreshLibraries, clearProfile, clearServer, logout, isLoading, selectedServer } = useAuth();

  // Refresh libraries when the screen mounts to ensure we have the latest data
  useEffect(() => {
    refreshLibraries();
  }, [refreshLibraries]);

  const renderLibrary = ({ item }: { item: PlexLibrary }) => (
    <TouchableOpacity
      style={styles.libraryCard}
      onPress={() => selectLibrary(item)}
      activeOpacity={0.7}
    >
      <View style={styles.libraryIcon}>
        <Ionicons name="images" size={28} color={colors.primary} />
      </View>
      <View style={styles.libraryInfo}>
        <Text style={styles.libraryName}>{item.title}</Text>
        <Text style={styles.libraryDetails}>Photo Library</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );

  const listEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Photo Libraries Found</Text>
      <Text style={styles.emptySubtitle}>
        This profile doesn't have access to any photo libraries on this server.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshLibraries}>
        <Ionicons name="refresh" size={20} color={colors.primary} />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.switchProfileButton} onPress={clearProfile}>
        <Ionicons name="people" size={20} color={colors.textPrimary} />
        <Text style={styles.switchProfileButtonText}>Switch Profile</Text>
      </TouchableOpacity>
    </View>
  ), [refreshLibraries, clearProfile]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />

      <View style={styles.header}>
        <Text style={styles.title}>Select a Library</Text>
        {selectedServer && (
          <Text style={styles.subtitle}>
            on {selectedServer.name}
          </Text>
        )}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={clearServer}>
            <Ionicons name="server-outline" size={18} color={colors.primary} />
            <Text style={styles.headerButtonText}>Change Server</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={[styles.headerButtonText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding photo libraries...</Text>
        </View>
      ) : (
        <FlatList
          data={libraries}
          renderItem={renderLibrary}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.libraryList}
          ListEmptyComponent={listEmptyComponent}
          ItemSeparatorComponent={ItemSeparator}
        />
      )}

      <FloatingRefreshButton onPress={refreshLibraries} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: commonStyles.containerDark,
  header: commonStyles.headerCentered,
  title: {
    ...commonStyles.title,
    marginBottom: spacing.xs,
  },
  subtitle: commonStyles.subtitle,
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  headerButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  loadingContainer: commonStyles.centered,
  loadingText: commonStyles.loadingText,
  libraryList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  libraryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  libraryIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  libraryDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: commonStyles.separator,
  emptyContainer: commonStyles.centered,
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  refreshButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  switchProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  switchProfileButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});

