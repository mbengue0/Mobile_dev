import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDrawerStatus } from '@react-navigation/drawer';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const drawerStatus = useDrawerStatus();
  const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mail',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mail-outline" size={24} color={color} />
          ),
          headerLeft: () => (
            <Pressable
              style={{ marginLeft: 16 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <MaterialIcons name="menu" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <Pressable style={{ marginRight: 16 }}>
                <MaterialIcons name="search" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
              <Pressable>
                <MaterialIcons name="account-circle" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Meet',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="videocam" size={24} color={color} />
          ),
          headerLeft: () => (
            <Pressable
              style={{ marginLeft: 16 }}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <MaterialIcons name="menu" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
