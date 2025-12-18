import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Define TypeScript interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const UserPosts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoadingUsers(true);
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userData: User[] = await response.json();
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch posts when selectedUser changes
  useEffect(() => {
    const fetchPosts = async (): Promise<void> => {
      if (!selectedUser) {
        setPosts([]);
        return;
      }

      try {
        setLoadingPosts(true);
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts?userId=${selectedUser}`
        );
        const postData: Post[] = await response.json();
        setPosts(postData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [selectedUser]);

  const selectedUserData = users.find(user => user.id === selectedUser);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a User:</Text>
      
      {loadingUsers ? (
        <ActivityIndicator size="small" style={styles.loader} />
      ) : (
        <Picker
          selectedValue={selectedUser}
          onValueChange={(itemValue: number | undefined) => setSelectedUser(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a user..." value={undefined} />
          {users.map(user => (
            <Picker.Item key={user.id} label={user.name} value={user.id} />
          ))}
        </Picker>
      )}

      {selectedUser && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            Posts by: {selectedUserData?.name}
          </Text>
          <Text style={styles.userEmail}>{selectedUserData?.email}</Text>
        </View>
      )}

      {loadingPosts ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.postItem}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postBody}>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedUser ? 'No posts found' : 'Select a user to see their posts'}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  picker: { 
    backgroundColor: '#f8f8f8',
    marginBottom: 20
  },
  loader: {
    marginVertical: 20
  },
  userInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5
  },
  userName: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 16
  },
  userEmail: {
    color: '#666',
    fontSize: 14
  },
  postItem: { 
    marginBottom: 15, 
    padding: 15, 
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  postTitle: { 
    fontWeight: 'bold', 
    marginBottom: 5,
    fontSize: 16,
    color: '#333'
  },
  postBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 50
  }
});

export default UserPosts;