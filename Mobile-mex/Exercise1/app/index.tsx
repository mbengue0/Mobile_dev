import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Sample post data
const POSTS = [
  {
    id: '1',
    userName: 'Habib Ndiaye',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    timestamp: '2 hours ago',
    content: 'Just finished an amazing React Native project! ',
    image: null,
  },
  {
    id: '2',
    userName: 'Malick Maniang',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    timestamp: '5 hours ago',
    content: 'Beautiful sunset at the beach today. Nature is amazing! ',
    image: 'https://picsum.photos/400/300?random=1',
  },
  {
    id: '3',
    userName: 'Mike Mbengue',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    timestamp: '1 day ago',
    content: 'Learning new things every day. Keep growing! ',
    image: null,
  },
  {
    id: '4',
    userName: 'Nafi Diagne',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    timestamp: '2 days ago',
    content: 'Coffee and code - the perfect combination ',
    image: 'https://picsum.photos/400/300?random=2',
  },
];

export default function SocialFeed() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SocialFeed</Text>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <ScrollView style={styles.feed}>
        {POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* User Info Row */}
            <View style={styles.userInfoRow}>
              <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
              <View style={styles.userTextInfo}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.timestamp}>{post.timestamp}</Text>
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Post Image (if exists) */}
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}> Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}> Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}> Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#4267B2',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 24,
  },
  feed: {
    flex: 1,
  },
  postCard: {
    backgroundColor: 'white',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#050505',
  },
  timestamp: {
    fontSize: 12,
    color: '#65676b',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#050505',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
    paddingTop: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '600',
  },
});