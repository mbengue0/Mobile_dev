import { useContext, useMemo, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MailFilterContext } from '../_layout';
import SearchBar from '@/components/SearchBar';
import EmailItem from '@/components/EmailItem';
import ComposeButton from '@/components/ComposeButton';
import { listEmails, searchEmails, toggleStar, archiveEmail, deleteEmail } from '@/data/mockEmails';

export default function MailScreen() {
  const router = useRouter();
  const { mailbox } = useContext(MailFilterContext);
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const data = useMemo(() => searchEmails(query, listEmails(mailbox)), [query, mailbox, refreshKey]);

  const onToggleStar = useCallback((id: string) => {
    toggleStar(id);
    setRefreshKey(prev => prev + 1);
  }, []);
  const onPressItem = useCallback((item: { id: string }) => {
    router.push({ pathname: '/message/[id]', params: { id: item.id } });
  }, [router]);
  const onArchive = useCallback((id: string) => {
    archiveEmail(id);
    setRefreshKey(prev => prev + 1);
  }, []);
  const onDelete = useCallback((id: string) => {
    deleteEmail(id);
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SearchBar value={query} onChangeText={setQuery} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        extraData={refreshKey}
        renderItem={({ item }) => (
          <EmailItem item={{ ...item }} onPress={onPressItem} onToggleStar={onToggleStar} onArchive={onArchive} onDelete={onDelete} />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
        removeClippedSubviews
        initialNumToRender={12}
        windowSize={10}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
      />
      <ComposeButton onPress={() => router.push('/compose')} />
    </View>
  );
}

const styles = StyleSheet.create({
  sep: { height: 1, backgroundColor: '#eee' },
});
