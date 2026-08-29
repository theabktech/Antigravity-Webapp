import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  AdOptions,
  AppOpenAdOptions,
  BannerAdPluginEvents,
} from '@capacitor-community/admob';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Google AdMob Configuration
export const ADMOB_CONFIG = {
  // Live Banner Unit ID
  LIVE_BANNER_ID: 'ca-app-pub-7179009751628915/1200699279',
  // Official Google Test Banner Unit ID (guaranteed fallback during test mode)
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',

  // Live App Open / Startup Ad Unit ID
  LIVE_APP_OPEN_ID: 'ca-app-pub-7179009751628915/9024233452',
  // Official Google Test App Open Unit ID
  TEST_APP_OPEN_ID: 'ca-app-pub-3940256099942544/9257390308',

  // Official Google Test Interstitial Unit ID
  TEST_INTERSTITIAL_ID: 'ca-app-pub-3940256099942544/1033173712',
};

class AdMobService {
  private isInitialized = false;
  private isBannerVisible = false;
  private isInterstitialPrepared = false;
  private lastAppOpenTime = 0;
  private isAppListenerRegistered = false;

  isAdsDisabled(): boolean {
    try {
      return localStorage.getItem('agy_ads_disabled') === 'true';
    } catch {
      return false;
    }
  }

  setAdsDisabled(disabled: boolean): void {
    try {
      localStorage.setItem('agy_ads_disabled', disabled ? 'true' : 'false');
      if (disabled) {
        this.removeBanner();
      } else {
        this.showPersistentBanner();
      }
    } catch (e) {
      console.warn('Failed to persist ads disabled state:', e);
    }
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isInitialized) {
      return;
    }

    try {
      await AdMob.initialize({
        initializeForTesting: false,
      });
      this.isInitialized = true;
      console.log('[AdMob] Initialized successfully');

      // Listen for banner events
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('[AdMob] Persistent banner loaded');
        this.isBannerVisible = true;
      });

      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
        console.warn('[AdMob] Live banner load failed, loading test banner fallback:', err);
        this.loadFallbackTestBanner();
      });

      // Register App resume listener for App Open ads on return to foreground
      if (!this.isAppListenerRegistered) {
        this.isAppListenerRegistered = true;
        CapApp.addListener('appStateChange', (state) => {
          if (state.isActive) {
            console.log('[AdMob] App resumed to foreground, checking startup ad...');
            this.showAppStartupAd(false);
          }
        });
      }

      this.prepareInterstitial();
    } catch (e) {
      console.warn('[AdMob] Initialization failed:', e);
    }
  }

  private async loadFallbackTestBanner(): Promise<void> {
    if (this.isAdsDisabled()) return;

    try {
      const fallbackOptions: BannerAdOptions = {
        adId: ADMOB_CONFIG.TEST_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(fallbackOptions);
      this.isBannerVisible = true;
      console.log('[AdMob] Test banner displayed');
    } catch (err) {
      console.warn('[AdMob] Fallback banner failed:', err);
    }
  }

  /**
   * Loads and displays the App Startup / App Open Ad on launch and resume
   * @param force - If true, bypasses the 3-minute cooldown (used on cold boot)
   */
  async showAppStartupAd(force = true): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isAdsDisabled()) return;

    const now = Date.now();
    // 3-minute cooldown between app open ads on resume to avoid annoying users
    if (!force && now - this.lastAppOpenTime < 180000) {
      console.log('[AdMob] App open ad skipped due to cooldown');
      return;
    }

    try {
      await this.initialize();
      this.lastAppOpenTime = now;

      const options: AppOpenAdOptions = {
        adId: ADMOB_CONFIG.LIVE_APP_OPEN_ID,
      };

      console.log('[AdMob] Loading App Open ad...');
      await AdMob.loadAppOpen(options);
      await AdMob.showAppOpen();
      console.log('[AdMob] App Open ad shown');
    } catch (e) {
      console.warn('[AdMob] Live App Open failed, attempting test App Open:', e);
      try {
        await AdMob.loadAppOpen({ adId: ADMOB_CONFIG.TEST_APP_OPEN_ID });
        await AdMob.showAppOpen();
      } catch (err) {
        console.warn('[AdMob] Fallback startup ad also failed:', err);
      }
    }
  }

  /**
   * Displays persistent adaptive bottom banner across the entire app
   */
  async showPersistentBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isAdsDisabled()) return;

    try {
      await this.initialize();

      const options: BannerAdOptions = {
        adId: ADMOB_CONFIG.LIVE_BANNER_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      };

      await AdMob.showBanner(options);
      this.isBannerVisible = true;
      console.log('[AdMob] Persistent banner requested');
    } catch (e) {
      console.warn('[AdMob] Live banner request error, loading test banner fallback:', e);
      await this.loadFallbackTestBanner();
    }
  }

  async hideBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform() || !this.isBannerVisible) return;

    try {
      await AdMob.hideBanner();
      this.isBannerVisible = false;
    } catch (e) {
      console.warn('[AdMob] Hide banner failed:', e);
    }
  }

  async removeBanner(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await AdMob.removeBanner();
      this.isBannerVisible = false;
    } catch (e) {
      console.warn('[AdMob] Remove banner failed:', e);
    }
  }

  async prepareInterstitial(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isAdsDisabled()) return;

    try {
      const options: AdOptions = {
        adId: ADMOB_CONFIG.TEST_INTERSTITIAL_ID,
        isTesting: true,
      };
      await AdMob.prepareInterstitial(options);
      this.isInterstitialPrepared = true;
    } catch (e) {
      console.warn('[AdMob] Prepare interstitial failed:', e);
    }
  }

  async showInterstitial(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isAdsDisabled()) return;

    try {
      if (this.isInterstitialPrepared) {
        await AdMob.showInterstitial();
        this.isInterstitialPrepared = false;
        setTimeout(() => this.prepareInterstitial(), 5000);
      } else {
        await this.prepareInterstitial();
        await AdMob.showInterstitial();
      }
    } catch (e) {
      console.warn('[AdMob] Show interstitial failed:', e);
    }
  }
}

export const admobService = new AdMobService();
