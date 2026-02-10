import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getVersionString } from '../constants/version';
import AppIcon from '../../assets/icon-design.svg';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface InfoItemProps {
  icon: IoniconsName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.infoItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>{title}</Text>
      {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
    </View>
    {onPress && (
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    )}
  </TouchableOpacity>
);

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleClose = () => {
    navigation.goBack();
  };

  const handlePrivacyPolicy = async () => {
    // TODO: Replace with your actual privacy policy URL
    await Linking.openURL('https://github.com/jacobtruman/TruPhotos/blob/main/PRIVACY.md');
  };

  const handleOpenSource = async () => {
    // Opens the GitHub repository
    await Linking.openURL('https://github.com/jacobtruman/TruPhotos');
  };

  const handleLicense = async () => {
    // Opens the MIT License file
    await Linking.openURL('https://github.com/jacobtruman/TruPhotos/blob/main/LICENSE');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appSection}>
          <View style={styles.appIcon}>
            <AppIcon width={150} height={95} />
          </View>
          <Text style={styles.appName}>Tru Photos</Text>
          <Text style={styles.appTagline}>Browse and manage your Plex photos</Text>
          <Text style={styles.version}>{getVersionString(Platform.OS as 'ios' | 'android')}</Text>
        </View>

        {/* Technical Info */}
        <Text style={styles.sectionTitle}>Technical</Text>
        <View style={styles.section}>
          <InfoItem
            icon="logo-react"
            title="Built With"
            subtitle="React Native"
          />
          <InfoItem
            icon="server-outline"
            title="Plex Integration"
            subtitle="Powered by Plex Media Server"
          />
        </View>

        {/* Legal */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.section}>
          <InfoItem
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <InfoItem
            icon="shield-checkmark-outline"
            title="License"
            subtitle="MIT License"
            onPress={handleLicense}
          />
          <InfoItem
            icon="code-slash-outline"
            title="Open Source"
            subtitle="View on GitHub"
            onPress={handleOpenSource}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  appSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appIcon: {
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  appTagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  version: {
    ...typography.caption,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  infoSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

