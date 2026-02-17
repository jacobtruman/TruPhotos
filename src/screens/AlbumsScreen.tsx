import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlbumCard, ProfileButton, LibraryDropdown, LoadingState } from '../components';
import { colors, spacing, commonStyles } from '../theme';
import { Album, RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAlbumsFromLibrary, convertPlexAlbumsToAlbums } from '../services/plexService';
import { useFolderCounts } from '../hooks/useFolderCounts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AlbumsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { selectedServer, selectedLibrary } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom hook to fetch folder counts
  const serverToken = selectedServer?.accessToken || null;
  const folderCounts = useFolderCounts(albums, selectedServer, serverToken);

  const fetchAlbums = useCallback(async () => {
    if (!selectedServer || !selectedLibrary) {
      setLoading(false);
      setError('No server or library selected');
      return;
    }

    const accessToken = selectedServer.accessToken;
    if (!accessToken) {
      setLoading(false);
      setError('No server access token');
      return;
    }

    try {
      setError(null);
      const plexAlbums = await getAlbumsFromLibrary(selectedServer, accessToken, selectedLibrary.key);
      const fetchedAlbums = convertPlexAlbumsToAlbums(plexAlbums, selectedServer, accessToken);
      setAlbums(fetchedAlbums);
    } catch (err) {
      console.error('Failed to fetch albums:', err);
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedServer, selectedLibrary]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlbums();
  }, [fetchAlbums]);

  const handleAlbumPress = (album: Album) => {
    const libraryName = selectedLibrary?.title || 'Library';

    navigation.navigate('AlbumDetail', {
      albumId: album.id,
      albumKey: album.key,
      albumRatingKey: album.ratingKey,
      albumTitle: album.title,
      breadcrumb: album.title,
      breadcrumbHistory: [
        {
          title: libraryName,
          isLibrary: true,
        },
        {
          title: album.title,
          albumId: album.id,
          albumKey: album.key,
          albumRatingKey: album.ratingKey,
        },
      ],
    });
  };

  const renderAlbum = ({ item }: { item: Album }) => (
    <AlbumCard
      album={item}
      itemCount={folderCounts[item.id]}
      onPress={() => handleAlbumPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <LibraryDropdown />
        <ProfileButton />
      </View>
    </View>
  );

  if (loading || error) {
    return (
      <LoadingState
        loading={loading}
        error={error}
        loadingText="Loading folders..."
        header={renderHeader()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleContainer}>
            <LibraryDropdown />
            <Text style={styles.albumCount}>{albums.length} folders</Text>
          </View>
          <ProfileButton />
        </View>
      </View>
      {albums.length === 0 ? (
        <LoadingState
          empty={true}
          emptyText="No folders found"
          emptyHint="This library doesn't have any folders"
        />
      ) : (
        <FlatList
          data={albums}
          renderItem={renderAlbum}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: commonStyles.container,
  header: commonStyles.header,
  headerRow: commonStyles.headerRow,
  headerTitleContainer: commonStyles.headerTitleContainer,
  albumCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: 4,
    paddingBottom: spacing.xl,
  },
});

