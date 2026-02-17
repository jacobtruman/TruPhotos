import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Album } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';

interface AlbumCardProps {
  album: Album;
  itemCount?: number;
  size?: number;
  onPress: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const CONTAINER_PADDING = 8; // 4px on each side
const DEFAULT_SIZE = (SCREEN_WIDTH - CONTAINER_PADDING - (NUM_COLUMNS * 8)) / NUM_COLUMNS; // Account for container padding + folder margins
const TAB_HEIGHT = 12;

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, itemCount, size = DEFAULT_SIZE, onPress }) => {
  // Use itemCount prop if provided, otherwise fall back to album.photoCount
  const count = itemCount !== undefined ? itemCount : album.photoCount;
  const countText = count > 0 ? `${count} items` : '';
  const hasCoverPhoto = !!album.coverPhoto?.uri && album.coverPhoto.uri.trim() !== '';
  const hasUltraBlurColors = !!album.ultraBlurColors;

  return (
    <TouchableOpacity
      style={[styles.container, styles.margin, { width: size }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Folder tab at top */}
      <View style={[styles.folderTab, { width: size * 0.4 }]} />

      {/* Main folder body */}
      <View style={[styles.folderBody, { width: size, height: size - TAB_HEIGHT }]}>
        {hasCoverPhoto ? (
          <>
            <Image
              source={{ uri: album.coverPhoto!.uri }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Dim overlay for background image */}
            <View style={styles.imageDimOverlay} />

            {/* 4-corner gradient overlay using all UltraBlurColors */}
            {hasUltraBlurColors ? (
              <View style={styles.gradientOverlay}>
                {/* Vertical blend from top to bottom */}
                <LinearGradient
                  colors={[
                    album.ultraBlurColors!.topLeft,
                    album.ultraBlurColors!.bottomLeft,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.gradientOverlay, styles.gradientOpacity]}
                />
                <LinearGradient
                  colors={[
                    album.ultraBlurColors!.topRight,
                    album.ultraBlurColors!.bottomRight,
                  ]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradientOverlay, styles.gradientOpacity]}
                />
                {/* Horizontal blend from left to right */}
                <LinearGradient
                  colors={[
                    album.ultraBlurColors!.topLeft,
                    album.ultraBlurColors!.topRight,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.gradientOverlay, styles.gradientOpacity]}
                />
                <LinearGradient
                  colors={[
                    album.ultraBlurColors!.bottomLeft,
                    album.ultraBlurColors!.bottomRight,
                  ]}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.gradientOverlay, styles.gradientOpacity]}
                />
              </View>
            ) : (
              <View style={styles.imageOverlay} />
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="folder-open" size={32} color={colors.primary} />
          </View>
        )}

        {/* Title and count overlaid on folder tile */}
        <View style={styles.infoOverlay}>
          <Text style={styles.title} numberOfLines={1}>
            {album.title}
          </Text>
          {countText ? <Text style={styles.count}>{countText}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  margin: {
    margin: 4,
  },
  gradientOpacity: {
    opacity: 0.2,
  },
  folderTab: {
    height: TAB_HEIGHT,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
    marginBottom: -2, // Overlap slightly with body
    backgroundColor: colors.primaryDark,
    opacity: 0.3,
  },
  folderBody: {
    borderRadius: borderRadius.md,
    borderTopLeftRadius: 0, // Flat where tab connects
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  imageDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  title: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  count: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

