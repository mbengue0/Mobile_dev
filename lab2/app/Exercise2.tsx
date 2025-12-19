import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export  function SocialFeed() {
  const posts = [
    {
      id: 1,
      userName: 'Mouhamed lam',
      avatar: 'https://placehold.co/50x50',
      time: '2 hours ago',
      content: 'Beautiful day at the park! 🌳☀️',
      image: 'lab2/assets/images/65309088-park-afternoon-in-sunny-day-with-blue-sky-beautiful-day-in-the-park-with-blue-sky.jpg',
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      userName: 'Habib diop',
      avatar: 'https://placehold.co/50x50',
      time: '4 hours ago',
      content: 'Just finished reading an amazing book! 📚',
      likes: 42,
      comments: 12
    },
    {
      id: 3,
      userName: 'Fallou Seye',
      avatar: 'https://placehold.co/50x50',
      time: '1 day ago',
      content: 'Coffee and coding ☕💻 #programming',
      image: 'https://placehold.co/300x200',
      likes: 18,
      comments: 3
    }
  ];

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SocialApp</Text>
        <TouchableOpacity>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <ScrollView style={styles.feed}>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            
            {/* User Info Row */}
            <View style={styles.userInfo}>
              <Image source={{ uri: post.avatar }} style={styles.avatar} />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{post.userName}</Text>
                <Text style={styles.time}>{post.time}</Text>
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.content}>{post.content}</Text>
            
            {/* Post Image (if exists) */}
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>👍 Like ({post.likes})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>💬 Comment ({post.comments})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>↗️ Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerText}>🔍 Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerText}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1877F2', 
  },
  icon: {
    fontSize: 20,
  },

  feed: {
    flex: 1,
  },

  post: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    padding: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    padding: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});