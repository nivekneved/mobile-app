import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import { 
  ActivityIndicator, 
  Text, 
  Title, 
  Paragraph, 
  useTheme,
} from 'react-native-paper';
import { supabase } from '../src/lib/supabase';
import PremiumCard from '../src/components/PremiumCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NewsScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('editorial_posts')
        .select(`
          *,
          admins:author_id (name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderPostItem = ({ item }) => (
    <PremiumCard style={styles.card}>
      {item.featured_image && (
        <Image source={{ uri: item.featured_image }} style={styles.cardImage} />
      )}
      <PremiumCard.Content style={styles.cardContent}>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {new Date(item.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          {item.admins?.name && (
            <Text style={styles.metaText}>By {item.admins.name}</Text>
          )}
        </View>
        <Title style={styles.cardTitle}>{item.title}</Title>
        <Paragraph numberOfLines={3} style={styles.cardPara}>
          {item.excerpt}
        </Paragraph>
      </PremiumCard.Content>
    </PremiumCard>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#DC2626" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.preHeader}>EDITORIAL</Text>
            <Text style={styles.mainHeader}>Travel Insights</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No news articles found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  preHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 4,
    marginBottom: 8,
  },
  mainHeader: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -1,
  },
  listContent: {
    paddingBottom: 40,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    paddingtop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  cardPara: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
