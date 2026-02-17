import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { PhotosScreen, AlbumsScreen } from '../screens';
import { colors } from '../theme';
import { RootTabParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<RootTabParamList>();

const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  let iconName: IoniconsName;

  switch (routeName) {
    case 'Timeline':
      iconName = focused ? 'time' : 'time-outline';
      break;
    case 'Library':
      iconName = focused ? 'folder' : 'folder-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export const TabNavigator: React.FC = () => {
  const { selectedTab, setSelectedTab } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName={selectedTab}
      screenListeners={{
        state: (e) => {
          // Detect tab changes from the navigation state
          const state = e.data.state;
          if (state) {
            const currentRoute = state.routes[state.index];
            const tabName = currentRoute?.name as keyof RootTabParamList;
            if (tabName && (tabName === 'Timeline' || tabName === 'Library')) {
              if (tabName !== selectedTab) {
                setSelectedTab(tabName);
              }
            }
          }
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundDark,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
      })}
    >
      <Tab.Screen name="Timeline" component={PhotosScreen} />
      <Tab.Screen
        name="Library"
        component={AlbumsScreen}
        options={{ tabBarLabel: 'Folders' }}
      />
    </Tab.Navigator>
  );
};

