import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { useMemo, useState, createContext } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type MailboxFilter =
  | 'inbox'
  | 'starred'
  | 'snoozed'
  | 'important'
  | 'sent'
  | 'drafts'
  | 'all';

export const MailFilterContext = createContext<{
  mailbox: MailboxFilter;
  setMailbox: (m: MailboxFilter) => void;
}>({ mailbox: 'inbox', setMailbox: () => {} });

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [mailbox, setMailbox] = useState<MailboxFilter>('inbox');
  const ctx = useMemo(() => ({ mailbox, setMailbox }), [mailbox]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MailFilterContext.Provider value={ctx}>
        <Drawer
          screenOptions={{ headerShown: false }}
          drawerContent={(props) => {
            const items: { key: MailboxFilter; label: string }[] = [
              { key: 'inbox', label: 'Inbox' },
              { key: 'starred', label: 'Starred' },
              { key: 'snoozed', label: 'Snoozed' },
              { key: 'important', label: 'Important' },
              { key: 'sent', label: 'Sent' },
              { key: 'drafts', label: 'Drafts' },
              { key: 'all', label: 'All Mail' },
            ];
            return (
              <View style={styles.drawerContent}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.drawerTitle}>Gmail</Text>
                </View>
                {items.map((it) => (
                  <Pressable
                    key={it.key}
                    style={[styles.drawerItem, mailbox === it.key && styles.drawerItemActive]}
                    onPress={() => {
                      setMailbox(it.key);
                      props.navigation.closeDrawer();
                      // Force navigation to refresh the screen
                      props.navigation.navigate('(tabs)', { screen: 'index' });
                    }}
                  >
                    <Text style={[styles.drawerText, mailbox === it.key && styles.drawerTextActive]}>
                      {it.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            );
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ title: 'Gmail' }} />
          <Drawer.Screen name="message/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
          <Drawer.Screen 
            name="compose" 
            options={({ navigation }) => ({ 
              title: 'Compose',
              drawerItemStyle: { display: 'none' },
              headerShown: true,
              headerLeft: () => (
                <Pressable
                  style={{ marginLeft: 16 }}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
                </Pressable>
              ),
            })} 
          />
          <Drawer.Screen name="modal" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>
      </MailFilterContext.Provider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 50,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EA4335',
  },
  drawerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawerItemActive: {
    backgroundColor: '#E8F0FE',
  },
  drawerText: {
    fontSize: 16,
    color: '#333',
  },
  drawerTextActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
});
