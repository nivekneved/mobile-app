import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

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

// AsyncStorage keys — prefixed to avoid collisions with other cached data
const CACHE_KEYS = {
  mobileConfig:  '@tl_settings/mobile_config',
  generalConfig: '@tl_settings/general_config',
  contentBlocks: '@tl_settings/content_blocks',
} as const;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig | null>(null);
  const [generalConfig, setGeneralConfig] = useState<GeneralConfig | null>(null);
  const [contentBlocks, setContentBlocks] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // OFFLINE-1: Load persisted settings from AsyncStorage instantly on startup.
  // If cache exists, state is set synchronously and isLoading is cleared before
  // the Supabase fetch completes — returning users see zero loading delay.
  const loadFromCache = async (): Promise<boolean> => {
    try {
      const [cachedMobile, cachedGeneral, cachedBlocks] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.mobileConfig),
        AsyncStorage.getItem(CACHE_KEYS.generalConfig),
        AsyncStorage.getItem(CACHE_KEYS.contentBlocks),
      ]);

      let cacheHit = false;

      if (cachedMobile) { setMobileConfig(JSON.parse(cachedMobile)); cacheHit = true; }
      if (cachedGeneral) { setGeneralConfig(JSON.parse(cachedGeneral)); cacheHit = true; }
      if (cachedBlocks)  { setContentBlocks(JSON.parse(cachedBlocks));  cacheHit = true; }

      return cacheHit;
    } catch (err) {
      // Non-fatal — proceed without cache
      console.warn('SettingsContext: Cache read failed:', err);
      return false;
    }
  };

  // OFFLINE-2: Persist freshly fetched settings to AsyncStorage in the background.
  // Called only after a successful Supabase response.
  const persistToCache = async (
    mobile: MobileConfig | null,
    general: GeneralConfig | null,
    blocks: Record<string, any>,
  ): Promise<void> => {
    try {
      await Promise.all([
        mobile  ? AsyncStorage.setItem(CACHE_KEYS.mobileConfig,  JSON.stringify(mobile))  : Promise.resolve(),
        general ? AsyncStorage.setItem(CACHE_KEYS.generalConfig, JSON.stringify(general)) : Promise.resolve(),
        Object.keys(blocks).length > 0
                ? AsyncStorage.setItem(CACHE_KEYS.contentBlocks, JSON.stringify(blocks))  : Promise.resolve(),
      ]);
    } catch (err) {
      // Non-fatal — fresh data is already in state; next launch will retry
      console.warn('SettingsContext: Cache write failed:', err);
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // FIX-1: Run both queries in parallel (was sequential — 2 round-trips → 1)
      const [
        { data: settings, error: settingsError },
        { data: blocks, error: blocksError }
      ] = await Promise.all([
        supabase.from('site_settings').select('key, value'),
        supabase.from('content_blocks').select('section_key, content').eq('page_slug', 'mobile-home')
      ]);

      if (settingsError) throw settingsError;
      if (blocksError) throw blocksError;

      let freshMobile: MobileConfig | null = null;
      let freshGeneral: GeneralConfig | null = null;

      if (settings) {
        settings.forEach((item: any) => {
          if (item.key === 'mobile_config') {
            freshMobile = item.value;
            setMobileConfig(item.value);
          } else if (item.key === 'general_config') {
            freshGeneral = item.value;
            setGeneralConfig(item.value);
          }
        });
      }

      let freshBlocks: Record<string, any> = {};
      if (blocks) {
        blocks.forEach((b: any) => {
          freshBlocks[b.section_key] = b.content;
        });
        setContentBlocks(freshBlocks);
      }

      // OFFLINE-3: Persist fresh data to cache in the background (non-blocking)
      persistToCache(freshMobile, freshGeneral, freshBlocks);

    } catch (err) {
      // OFFLINE-4: On network failure, cached state is already in place from
      // loadFromCache(). Do NOT reset state — let cached data keep rendering.
      console.error('SettingsContext: Error fetching settings (using cache if available):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // OFFLINE-5: Stale-while-revalidate startup sequence:
    // 1. Load cache instantly → clear loading spinner for returning users
    // 2. Fetch fresh data from Supabase in parallel (background revalidation)
    const init = async () => {
      const cacheHit = await loadFromCache();
      // If cache provided data, hide loading immediately so the UI is unblocked
      if (cacheHit) setIsLoading(false);
      // Always revalidate from network regardless of cache hit
      await fetchSettings();
    };
    init();
  }, []);

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
