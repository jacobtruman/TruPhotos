import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors, commonStyles } from '../theme';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingText?: string;
  errorText?: string;
  errorHint?: string;
  emptyText?: string;
  emptyHint?: string;
  children?: ReactNode;
  header?: ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading = false,
  error = null,
  empty = false,
  loadingText = 'Loading...',
  errorText,
  errorHint = 'Pull down to retry',
  emptyText = 'No items found',
  emptyHint,
  children,
  header,
}) => {
  if (loading) {
    return (
      <View style={commonStyles.container}>
        {header}
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={commonStyles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.container}>
        {header}
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{errorText || error}</Text>
          {errorHint && <Text style={commonStyles.errorHint}>{errorHint}</Text>}
        </View>
      </View>
    );
  }

  if (empty) {
    return (
      <View style={commonStyles.container}>
        {header}
        <View style={commonStyles.centered}>
          <Text style={commonStyles.emptyText}>{emptyText}</Text>
          {emptyHint && <Text style={commonStyles.emptyHint}>{emptyHint}</Text>}
          {children}
        </View>
      </View>
    );
  }

  return null;
};

