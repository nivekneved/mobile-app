import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../theme/colors';

interface HtmlRendererProps {
  html?: string | null;
  style?: object;
}

interface ParsedBlock {
  type: 'image' | 'heading' | 'paragraph' | 'list' | 'blockquote';
  content?: string;
  src?: string;
  alt?: string;
  level?: number;
  items?: string[];
}

/**
 * Parses and renders HTML or rich text strings into React Native components (Text, Image, View).
 */
export const HtmlRenderer: React.FC<HtmlRendererProps> = ({ html, style }) => {
  const { width } = useWindowDimensions();

  if (!html) return null;

  // Extract src and alt from an <img> tag string
  const parseImageTag = (imgTagStr: string): { src: string; alt?: string } | null => {
    const srcMatch = imgTagStr.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return null;
    const altMatch = imgTagStr.match(/alt=["']([^"']+)["']/i);
    return {
      src: srcMatch[1],
      alt: altMatch ? altMatch[1] : undefined,
    };
  };

  // Decode basic HTML entities
  const decodeEntities = (str: string): string => {
    return str
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  // Parse HTML into structured blocks
  const parseBlocks = (rawHtml: string): ParsedBlock[] => {
    const blocks: ParsedBlock[] = [];
    const clean = rawHtml.replace(/\r\n/g, '\n');

    // Regex matching major block elements
    const tagRegex = /<(p|h[1-6]|ul|ol|blockquote|img)\b[^>]*>([\s\S]*?)<\/\1>|<img\b[^>]*\/?>/gi;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(clean)) !== null) {
      // Check for plain text outside tags before this match
      const textBefore = clean.substring(lastIndex, match.index).trim();
      if (textBefore) {
        const cleanedText = decodeEntities(textBefore.replace(/<[^>]+>/g, '')).trim();
        if (cleanedText) {
          blocks.push({ type: 'paragraph', content: cleanedText });
        }
      }

      const fullTag = match[0];
      const tagName = (match[1] || 'img').toLowerCase();
      const innerContent = match[2] || '';

      if (tagName === 'img' || fullTag.toLowerCase().startsWith('<img')) {
        const imgData = parseImageTag(fullTag);
        if (imgData) {
          blocks.push({ type: 'image', src: imgData.src, alt: imgData.alt });
        }
      } else if (tagName === 'p') {
        // If paragraph contains <img> tags inside it
        if (/<img/i.test(innerContent)) {
          const imgMatches = innerContent.match(/<img\b[^>]*\/?>/gi);
          if (imgMatches) {
            imgMatches.forEach((imgTag) => {
              const imgData = parseImageTag(imgTag);
              if (imgData) {
                blocks.push({ type: 'image', src: imgData.src, alt: imgData.alt });
              }
            });
          }
          const textOnly = decodeEntities(innerContent.replace(/<img\b[^>]*\/?>/gi, '').replace(/<[^>]+>/g, '')).trim();
          if (textOnly) {
            blocks.push({ type: 'paragraph', content: textOnly });
          }
        } else {
          blocks.push({ type: 'paragraph', content: innerContent });
        }
      } else if (tagName.startsWith('h')) {
        const level = parseInt(tagName.substring(1), 10);
        const cleanedH = decodeEntities(innerContent.replace(/<[^>]+>/g, '')).trim();
        if (cleanedH) {
          blocks.push({ type: 'heading', level, content: cleanedH });
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        const liMatches = innerContent.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi);
        if (liMatches) {
          const items = liMatches
            .map((li) => decodeEntities(li.replace(/<[^>]+>/g, '')).trim())
            .filter(Boolean);
          if (items.length > 0) {
            blocks.push({ type: 'list', items });
          }
        }
      } else if (tagName === 'blockquote') {
        const cleanedBQ = decodeEntities(innerContent.replace(/<[^>]+>/g, '')).trim();
        if (cleanedBQ) {
          blocks.push({ type: 'blockquote', content: cleanedBQ });
        }
      }

      lastIndex = tagRegex.lastIndex;
    }

    // Process remaining trailing content
    const textAfter = clean.substring(lastIndex).trim();
    if (textAfter) {
      const cleanedText = decodeEntities(textAfter.replace(/<[^>]+>/g, '')).trim();
      if (cleanedText) {
        blocks.push({ type: 'paragraph', content: cleanedText });
      }
    }

    // Fallback: If no block HTML tags were detected, parse as plain text paragraphs
    if (blocks.length === 0 && clean.trim()) {
      const paragraphs = clean.split(/\n\s*\n/);
      paragraphs.forEach((p) => {
        const cleaned = decodeEntities(p.replace(/<[^>]+>/g, '')).trim();
        if (cleaned) {
          blocks.push({ type: 'paragraph', content: cleaned });
        }
      });
    }

    return blocks;
  };

  // Helper to render inline HTML tags like <strong>, <em>, <a>, <br> inside paragraphs
  const renderInlineContent = (rawText: string) => {
    if (!rawText) return null;

    // Handle <br> conversions first
    const formatted = rawText.replace(/<br\s*\/?>/gi, '\n');

    // Split text into tokens based on <strong>, <b>, <em>, <i>, <a> tags
    const inlineRegex = /<(strong|b|em|i|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(formatted)) !== null) {
      if (match.index > lastIdx) {
        const plainSegment = decodeEntities(formatted.substring(lastIdx, match.index).replace(/<[^>]+>/g, ''));
        if (plainSegment) {
          elements.push(<Text key={`text-${lastIdx}`}>{plainSegment}</Text>);
        }
      }

      const tag = match[1].toLowerCase();
      const attribs = match[2];
      const content = decodeEntities(match[3].replace(/<[^>]+>/g, ''));

      if (tag === 'strong' || tag === 'b') {
        elements.push(
          <Text key={`bold-${match.index}`} style={styles.boldText}>
            {content}
          </Text>
        );
      } else if (tag === 'em' || tag === 'i') {
        elements.push(
          <Text key={`italic-${match.index}`} style={styles.italicText}>
            {content}
          </Text>
        );
      } else if (tag === 'a') {
        const hrefMatch = attribs.match(/href=["']([^"']+)["']/i);
        const url = hrefMatch ? hrefMatch[1] : null;
        elements.push(
          <Text
            key={`link-${match.index}`}
            style={styles.linkText}
            onPress={() => url && Linking.openURL(url).catch(() => {})}
          >
            {content}
          </Text>
        );
      }

      lastIdx = inlineRegex.lastIndex;
    }

    if (lastIdx < formatted.length) {
      const remainingSegment = decodeEntities(formatted.substring(lastIdx).replace(/<[^>]+>/g, ''));
      if (remainingSegment) {
        elements.push(<Text key={`text-${lastIdx}`}>{remainingSegment}</Text>);
      }
    }

    return elements.length > 0 ? elements : decodeEntities(formatted.replace(/<[^>]+>/g, ''));
  };

  const blocks = parseBlocks(html);

  return (
    <View style={[styles.container, style]}>
      {blocks.map((block, index) => {
        if (block.type === 'image' && block.src) {
          return (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: block.src }}
                style={styles.image}
                resizeMode="cover"
              />
              {block.alt && !block.alt.startsWith('http') && (
                <Text style={styles.imageCaption}>{block.alt}</Text>
              )}
            </View>
          );
        }

        if (block.type === 'heading') {
          const headingStyle =
            block.level === 1
              ? styles.h1
              : block.level === 2
              ? styles.h2
              : styles.h3;
          return (
            <Text key={index} style={[styles.heading, headingStyle]}>
              {block.content}
            </Text>
          );
        }

        if (block.type === 'list' && block.items) {
          return (
            <View key={index} style={styles.listContainer}>
              {block.items.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{renderInlineContent(item)}</Text>
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'blockquote' && block.content) {
          return (
            <View key={index} style={styles.blockquoteContainer}>
              <Text style={styles.blockquoteText}>
                {renderInlineContent(block.content)}
              </Text>
            </View>
          );
        }

        if (block.content) {
          return (
            <Text key={index} style={styles.paragraph}>
              {renderInlineContent(block.content)}
            </Text>
          );
        }

        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: '#334155', // slate-700
    marginBottom: 16,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A', // slate-900
  },
  italicText: {
    fontStyle: 'italic',
  },
  linkText: {
    color: Colors.primary || '#0284C7',
    textDecorationLine: 'underline',
  },
  heading: {
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 12,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
  },
  imageWrapper: {
    marginVertical: 16,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  imageCaption: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  listContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: Colors.primary || '#0284C7',
    fontWeight: 'bold',
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  blockquoteContainer: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary || '#0284C7',
    paddingLeft: 14,
    marginVertical: 14,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 4,
  },
  blockquoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#475569',
    lineHeight: 24,
  },
});
export default HtmlRenderer;
