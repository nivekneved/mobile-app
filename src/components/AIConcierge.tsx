import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Animated, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { Text, Surface, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import * as Linking from 'expo-linking';
import { useSettings } from '../context/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const AIConcierge = () => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { mobileConfig, generalConfig } = useSettings();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Welcome to Travel Lounge Elite Concierge. How can I assist you with your dream Mauritius holiday today?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    const currentInput = message;
    setMessage('');
    setIsTyping(true);

    try {
      const apiBase = (process.env.EXPO_PUBLIC_WEB_URL || 'https://travellounge.mu').replace(/\/+$/, '');
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-8).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });
      const json = await res.json().catch(() => null);
      const replyText =
        json?.reply ||
        json?.message ||
        json?.content ||
        "I've noted your request. Tap 'Connect to WhatsApp' below to chat directly with our Travel Lounge concierge desk (+230 5256 9840).";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: String(replyText),
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I've noted your request. Tap 'Connect to WhatsApp' below to speak directly with our live Travel Lounge concierge desk (+230 5256 9840).",
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phone = '23052569840';
    const transcript = messages.map(m => `${m.sender === 'user' ? 'Client' : 'Concierge'}: ${m.text}`).join('\n\n');
    const intro = "Hi! I want to search flights using WhatsApp AI Assistant:\n\n";
    const encodedMessage = encodeURIComponent(intro + transcript);
    const whatsappUrl = `https://wa.me/${phone.replace(/\s+/g, '').replace('+', '')}?text=${encodedMessage}`;
    Linking.openURL(whatsappUrl);
    setIsOpen(false);
  };

  const fabBottomOffset = (insets.bottom || 16) + 72;

  return (
    <>
      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: fabBottomOffset }]} pointerEvents="box-none">
        <TouchableOpacity 
          style={[styles.fab, isOpen && styles.fabOpen]} 
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.8}
        >
          {isOpen ? <X color="#fff" size={22} /> : <MessageSquare color="#fff" size={22} />}
          {!isOpen && (
            <View style={styles.onlineBadge}>
               <View style={styles.ping} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isOpen && (
        <Portal>
          <Modal 
            visible={isOpen} 
            onDismiss={() => setIsOpen(false)}
            contentContainerStyle={styles.modalContent}
          >
          <Animated.View style={[
            styles.chatContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerBg} />
              <View style={styles.headerContent}>
                 <View style={styles.avatarRow}>
                    <Surface style={styles.botIcon} elevation={4}>
                       <Sparkles size={18} color="#fff" />
                    </Surface>
                    <View>
                       <Text style={styles.headerTitle}>AI CONCIERGE</Text>
                       <View style={styles.statusRow}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>ELITE ASSISTANCE ONLINE</Text>
                       </View>
                    </View>
                 </View>
                 <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)}>
                    <X size={20} color="rgba(255,255,255,0.4)" />
                 </TouchableOpacity>
              </View>
            </View>

            {/* Body */}
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.body}
            >
              <ScrollView 
                style={styles.messageList} 
                contentContainerStyle={styles.messageListContent}
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map(m => (
                  <View key={m.id} style={[styles.bubbleContainer, m.sender === 'user' ? styles.bubbleUserContainer : styles.bubbleBotContainer]}>
                    <View style={[styles.bubble, m.sender === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                      <Text style={[styles.bubbleText, m.sender === 'user' ? styles.bubbleUserText : styles.bubbleBotText]}>
                        {m.text}
                      </Text>
                    </View>
                    <Text style={styles.bubbleTime}>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                ))}
                {isTyping && (
                  <View style={styles.bubbleBotContainer}>
                    <View style={[styles.bubble, styles.bubbleBot]}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Tell me your requirements..."
                  placeholderTextColor={Colors.slate[400]}
                  style={styles.inputField}
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
                <TouchableOpacity 
                  style={[styles.sendIconBtn, !message.trim() && styles.sendIconBtnDisabled]}
                  onPress={handleSend}
                  disabled={!message.trim()}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.whatsappActionBtn}
                onPress={handleWhatsAppRedirect}
              >
                 <MessageSquare size={16} color="#fff" />
                 <Text style={styles.whatsappActionText}>CONNECT TO WHATSAPP</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Animated.View>
        </Modal>
      </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 1000,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabOpen: {
    backgroundColor: Colors.charcoal,
    transform: [{ rotate: '90deg' }],
  },
  onlineBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  ping: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#fff',
    opacity: 0.4,
  },
  modalContent: {
    margin: 20,
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 40,
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  header: {
    height: 100,
    position: 'relative',
    backgroundColor: Colors.charcoal,
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  botIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 24,
  },
  messageList: {
    height: 280,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  bubbleContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  bubbleUserContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleBotContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.slate[100],
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Outfit_500Medium',
  },
  bubbleUserText: {
    color: '#fff',
  },
  bubbleBotText: {
    color: Colors.charcoal,
  },
  bubbleTime: {
    fontSize: 8,
    color: Colors.slate[400],
    marginTop: 4,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputField: {
    backgroundColor: Colors.slate[50],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    fontFamily: 'Outfit_500Medium',
  },
  sendIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIconBtnDisabled: {
    opacity: 0.3,
  },
  whatsappActionBtn: {
    height: 54,
    backgroundColor: '#10B981',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'Outfit_700Bold',
  }
});
