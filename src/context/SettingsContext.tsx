import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_SETTINGS = '@tl_settings_cache_v1';
const CACHE_KEY_BLOCKS = '@tl_blocks_cache_v1';

interface MobileConfig {
  supportPhone?: string;
  supportEmail?: string;
  appVersion?: string;
  primaryColor?: string;
}

interface GeneralConfig {
  siteTitle?: string;
  logoUrl?: string;
  logoHeight?: string;
  logoWidth?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber1?: string;
  whatsappNumber2?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  ui_labels?: Record<string, string>;
  [key: string]: any;
}

interface SettingsContextType {
  mobileConfig: MobileConfig | null;
  generalConfig: GeneralConfig | null;
  contentBlocks: Record<string, any>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig | null>(null);
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig | null>(null);
  const [contentBlocks, setContentBlocks] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage cache instantly on mount
  useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedSettingsJson, cachedBlocksJson] = await Promise.all([
          AsyncStorage.getItem(CACHE_KEY_SETTINGS),
          AsyncStorage.getItem(CACHE_KEY_BLOCKS)
        ]);

        if (cachedSettingsJson) {
          const parsed = JSON.parse(cachedSettingsJson);
          if (parsed.mobile_config) setMobileConfig(parsed.mobile_config);
          if (parsed.general_config) setGeneralConfig(parsed.general_config);
        }

        if (cachedBlocksJson) {
          setContentBlocks(JSON.parse(cachedBlocksJson));
        }

        if (cachedSettingsJson || cachedBlocksJson) {
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('SettingsContext: Error reading cache:', err);
      }
    };

    loadCache();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [
        { data: settings, error: settingsError },
        { data: blocks, error: blocksError }
      ] = await Promise.all([
        supabase.from('site_settings').select('key, value'),
        supabase.from('content_blocks').select('section_key, content').eq('page_slug', 'mobile-home')
      ]);

      if (settingsError) throw settingsError;
      if (blocksError) throw blocksError;

      const cachePayload: Record<string, any> = {};

      if (settings) {
        settings.forEach((item: any) => {
          if (item.key === 'mobile_config') {
            setMobileConfig(item.value);
            cachePayload.mobile_config = item.value;
          } else if (item.key === 'general_config') {
            setGeneralConfig(item.value);
            cachePayload.general_config = item.value;
          }
        });
        AsyncStorage.setItem(CACHE_KEY_SETTINGS, JSON.stringify(cachePayload)).catch(() => {});
      }

      if (blocks) {
        const blockMap: Record<string, any> = {};
        blocks.forEach((b: any) => {
          blockMap[b.section_key] = b.content;
        });
        setContentBlocks(blockMap);
        AsyncStorage.setItem(CACHE_KEY_BLOCKS, JSON.stringify(blockMap)).catch(() => {});
      }

    } catch (err) {
      console.error('SettingsContext: Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        mobileConfig,
        generalConfig,
        contentBlocks,
        isLoading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
