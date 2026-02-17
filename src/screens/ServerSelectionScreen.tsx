import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { colors, spacing, borderRadius, typography, commonStyles } from '../theme';
import { FloatingRefreshButton } from '../components';
import { useAuth } from '../context/AuthContext';
import { PlexServer } from '../types';

const ItemSeparator = () => <View style={styles.separator} />;

export const ServerSelectionScreen: React.FC = () => {
  const { servers, selectServer, refreshServers, isLoading, selectedProfile } = useAuth();
  const [selectingServerId, setSelectingServerId] = useState<string | null>(null);

  const handleSelectServer = async (server: PlexServer) => {
    setSelectingServerId(server.machineIdentifier);
    try {
      await selectServer(server);
    } catch (error) {
      console.error(`ServerSelectionScreen: Failed to select server "${server.name}":`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Connection Failed',
        `Could not connect to "${server.name}".\n\n${errorMessage}\n\nThis may be because:\n• The server is offline\n• Your profile doesn't have remote access\n• The server is not reachable from this network`,
        [{ text: 'OK' }]
      );
    } finally {
      setSelectingServerId(null);
    }
  };

  const renderServer = ({ item }: { item: PlexServer }) => {
    const isSelecting = selectingServerId === item.machineIdentifier;

    return (
    <TouchableOpacity
      style={[styles.serverCard, isSelecting && styles.serverCardSelecting]}
      onPress={() => handleSelectServer(item)}
      activeOpacity={0.7}
      disabled={selectingServerId !== null}
    >
      <View style={styles.serverIcon}>
        <MaterialIcons
          name="storage"
          size={28}
          color={colors.primary}
        />
      </View>
      <View style={styles.serverInfo}>
        <Text style={styles.serverName}>{item.name}</Text>
        <Text style={styles.serverDetails}>
          {item.address}:{item.port}
        </Text>
        <View style={styles.serverBadges}>
          {item.owned && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Owned</Text>
            </View>
          )}
          {item.localAddresses && (
            <View style={[styles.badge, styles.localBadge]}>
              <Text style={styles.badgeText}>Local</Text>
            </View>
          )}
        </View>
        {isSelecting && (
          <Text style={styles.connectingText}>Connecting...</Text>
        )}
      </View>
      {isSelecting ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
      )}
    </TouchableOpacity>
    );
  };

  const listEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="server-outline" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Servers Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn't find any Plex servers with photo libraries.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshServers}>
        <Ionicons name="refresh" size={20} color={colors.primary} />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  ), [refreshServers]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundDark} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select a Server</Text>
        {selectedProfile && (
          <Text style={styles.subtitle}>
            Welcome, {selectedProfile.title}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding your servers...</Text>
        </View>
      ) : (
        <FlatList
          data={servers}
          renderItem={renderServer}
          keyExtractor={(item) => item.machineIdentifier}
          contentContainerStyle={styles.serverList}
          ListEmptyComponent={listEmptyComponent}
          ItemSeparatorComponent={ItemSeparator}
        />
      )}

      <FloatingRefreshButton onPress={refreshServers} />
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
  loadingContainer: commonStyles.centered,
  loadingText: commonStyles.loadingText,
  serverList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  serverCardSelecting: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  connectingText: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  serverIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serverInfo: {
    flex: 1,
  },
  serverName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  serverDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  serverBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  localBadge: {
    backgroundColor: colors.info,
  },
  badgeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: '600',
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
});
