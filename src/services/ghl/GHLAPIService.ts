import { loggingService } from '../LoggingService';
import type { GHLAPICredentials, GHLAccount, GHLFunnel, GHLPage, GHLConversionResult } from '../../types/ghl.types';

export class GHLAPIService {
  private apiKey: string | null = null;
  private locationId: string | null = null;
  private baseURL = 'https://rest.gohighlevel.com/v1';
  private useMockResponses = true; // Set to false when real API credentials are available

  /**
   * Set API credentials
   */
  setCredentials(credentials: GHLAPICredentials): void {
    this.apiKey = credentials.apiKey;
    this.locationId = credentials.locationId || null;
    loggingService.info('ghl-api', 'API credentials set');
  }

  /**
   * Clear API credentials
   */
  clearCredentials(): void {
    this.apiKey = null;
    this.locationId = null;
    loggingService.info('ghl-api', 'API credentials cleared');
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get current account information
   */
  async getAccount(): Promise<GHLAccount> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockGetAccount();
    }

    try {
      const response = await fetch(`${this.baseURL}/locations/${this.locationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        locationId: data.id,
      };
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to get account', error);
      throw error;
    }
  }

  /**
   * Get all funnels for the account
   */
  async getFunnels(): Promise<GHLFunnel[]> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockGetFunnels();
    }

    try {
      const response = await fetch(`${this.baseURL}/funnels?locationId=${this.locationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.funnels || [];
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to get funnels', error);
      throw error;
    }
  }

  /**
   * Create a new funnel
   */
  async createFunnel(name: string): Promise<GHLFunnel> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockCreateFunnel(name);
    }

    try {
      const response = await fetch(`${this.baseURL}/funnels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: this.locationId,
          name,
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to create funnel', error);
      throw error;
    }
  }

  /**
   * Create a new page in a funnel
   */
  async createPage(funnelId: string, name: string, html: string): Promise<GHLPage> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockCreatePage(funnelId, name, html);
    }

    try {
      const response = await fetch(`${this.baseURL}/funnels/${funnelId}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          html,
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to create page', error);
      throw error;
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(funnelId: string, pageId: string, html: string): Promise<GHLPage> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockUpdatePage(funnelId, pageId, html);
    }

    try {
      const response = await fetch(`${this.baseURL}/funnels/${funnelId}/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to update page', error);
      throw error;
    }
  }

  /**
   * Upload an asset (image/font) to GHL
   */
  async uploadAsset(file: File): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockUploadAsset(file);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('locationId', this.locationId || '');

      const response = await fetch(`${this.baseURL}/medias/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to upload asset', error);
      throw error;
    }
  }

  /**
   * Get all locations for the account
   */
  async getLocations(): Promise<import('../../types/ghl.types').GHLLocation[]> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockGetLocations();
    }

    try {
      const response = await fetch(`${this.baseURL}/locations`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to get locations', error);
      throw error;
    }
  }

  /**
   * Get all websites for a location
   */
  async getWebsites(locationId: string): Promise<import('../../types/ghl.types').GHLWebsite[]> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockGetWebsites(locationId);
    }

    try {
      const response = await fetch(`${this.baseURL}/locations/${locationId}/websites`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.websites || [];
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to get websites', error);
      throw error;
    }
  }

  /**
   * Create a new website
   */
  async createWebsite(locationId: string, name: string): Promise<import('../../types/ghl.types').GHLWebsite> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockCreateWebsite(locationId, name);
    }

    try {
      const response = await fetch(`${this.baseURL}/locations/${locationId}/websites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          locationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to create website', error);
      throw error;
    }
  }

  /**
   * Create a new page in a website
   */
  async createWebsitePage(websiteId: string, name: string, html: string): Promise<GHLPage> {
    if (!this.isConfigured()) {
      throw new Error('GHL API credentials not set');
    }

    if (this.useMockResponses) {
      return this.mockCreateWebsitePage(websiteId, name, html);
    }

    try {
      const response = await fetch(`${this.baseURL}/websites/${websiteId}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          html,
        }),
      });

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to create website page', error);
      throw error;
    }
  }

  /**
   * Import GHL clone result to GHL account
   */
  async importGHLClone(
    cloneResult: import('../../types/ghl.types').GHLCloneResult
  ): Promise<{ success: boolean; url?: string; message: string }> {
    loggingService.info('ghl-api', 'Importing GHL clone to GHL account');

    const { destination, clonedPages } = cloneResult;

    try {
      if (destination.type === 'new-funnel') {
        // Create new funnel and import pages
        const funnel = await this.createFunnel(`Cloned: ${cloneResult.sourceUrl}`);

        for (const page of clonedPages) {
          await this.createPage(funnel.id, page.name, page.html);
        }

        return {
          success: true,
          url: `https://app.gohighlevel.com/location/${destination.locationId}/funnels/${funnel.id}`,
          message: `Successfully cloned ${clonedPages.length} pages to new funnel`,
        };
      } else if (destination.type === 'existing-funnel') {
        // Add pages to existing funnel
        if (!destination.funnelId) {
          throw new Error('Funnel ID is required for existing funnel destination');
        }

        for (const page of clonedPages) {
          await this.createPage(destination.funnelId, page.name, page.html);
        }

        return {
          success: true,
          url: `https://app.gohighlevel.com/location/${destination.locationId}/funnels/${destination.funnelId}`,
          message: `Successfully cloned ${clonedPages.length} pages to existing funnel`,
        };
      } else if (destination.type === 'new-website') {
        // Create new website and import pages
        if (!destination.locationId) {
          throw new Error('Location ID is required for new website destination');
        }

        const website = await this.createWebsite(destination.locationId, `Cloned: ${cloneResult.sourceUrl}`);

        for (const page of clonedPages) {
          await this.createWebsitePage(website.id, page.name, page.html);
        }

        return {
          success: true,
          url: website.url,
          message: `Successfully cloned ${clonedPages.length} pages to new website`,
        };
      } else if (destination.type === 'existing-website') {
        // Add pages to existing website
        if (!destination.websiteId) {
          throw new Error('Website ID is required for existing website destination');
        }

        for (const page of clonedPages) {
          await this.createWebsitePage(destination.websiteId, page.name, page.html);
        }

        return {
          success: true,
          url: `https://app.gohighlevel.com/location/${destination.locationId}/websites/${destination.websiteId}`,
          message: `Successfully cloned ${clonedPages.length} pages to existing website`,
        };
      } else {
        // Download only - no import needed
        return {
          success: true,
          message: 'Clone completed. Download HTML files manually.',
        };
      }
    } catch (error) {
      loggingService.error('ghl-api', 'Failed to import GHL clone', error);
      throw error;
    }
  }

  /**
   * Import WordPress conversion result to GHL
   */
  async importWordPressConversion(
    conversionResult: GHLConversionResult,
    funnelName?: string
  ): Promise<{ funnelId: string; pageId: string; url: string }> {
    loggingService.info('ghl-api', 'Importing WordPress conversion to GHL');

    // Step 1: Create or select funnel
    const funnel = await this.createFunnel(funnelName || `Converted: ${conversionResult.originalUrl}`);

    // Step 2: Upload assets
    loggingService.info('ghl-api', `Uploading ${conversionResult.assets.length} assets`);
    const uploadedAssets = new Map<string, string>();

    for (const asset of conversionResult.assets) {
      try {
        // In real implementation, we'd fetch the asset and upload
        // For now, just track it
        if (this.useMockResponses) {
          uploadedAssets.set(asset.originalUrl, `https://storage.gohighlevel.com/mock/${Date.now()}`);
        }
      } catch (error) {
        loggingService.warning('ghl-api', `Failed to upload asset: ${asset.originalUrl}`);
      }
    }

    // Step 3: Replace asset URLs in HTML
    let finalHTML = conversionResult.ghlHTML;
    for (const [originalUrl, ghlUrl] of uploadedAssets.entries()) {
      finalHTML = finalHTML.replace(new RegExp(originalUrl, 'g'), ghlUrl);
    }

    // Step 4: Create page
    const page = await this.createPage(
      funnel.id,
      `Converted Page - ${new Date().toLocaleDateString()}`,
      finalHTML
    );

    loggingService.success('ghl-api', `Successfully imported to GHL: ${page.url}`);

    return {
      funnelId: funnel.id,
      pageId: page.id,
      url: page.url,
    };
  }

  // ========================================
  // MOCK RESPONSES (for testing without GHL account)
  // ========================================

  private mockGetAccount(): GHLAccount {
    loggingService.info('ghl-api', '[MOCK] Getting account');
    return {
      id: 'mock-account-123',
      name: 'Mock GHL Account',
      locationId: 'mock-location-456',
    };
  }

  private mockGetFunnels(): GHLFunnel[] {
    loggingService.info('ghl-api', '[MOCK] Getting funnels');
    return [
      {
        id: 'mock-funnel-1',
        name: 'Sample Funnel 1',
        pages: [],
      },
      {
        id: 'mock-funnel-2',
        name: 'Sample Funnel 2',
        pages: [],
      },
    ];
  }

  private mockCreateFunnel(name: string): GHLFunnel {
    loggingService.info('ghl-api', `[MOCK] Creating funnel: ${name}`);
    return {
      id: `mock-funnel-${Date.now()}`,
      name,
      pages: [],
    };
  }

  private mockCreatePage(funnelId: string, name: string, html: string): GHLPage {
    loggingService.info('ghl-api', `[MOCK] Creating page: ${name} in funnel ${funnelId}`);
    return {
      id: `mock-page-${Date.now()}`,
      name,
      url: `https://mockghl.com/page/${Date.now()}`,
      html,
    };
  }

  private mockUpdatePage(funnelId: string, pageId: string, html: string): GHLPage {
    loggingService.info('ghl-api', `[MOCK] Updating page ${pageId} in funnel ${funnelId}`);
    return {
      id: pageId,
      name: 'Updated Page',
      url: `https://mockghl.com/page/${pageId}`,
      html,
    };
  }

  private mockUploadAsset(file: File): string {
    loggingService.info('ghl-api', `[MOCK] Uploading asset: ${file.name}`);
    return `https://storage.gohighlevel.com/mock/${Date.now()}-${file.name}`;
  }

  private mockGetLocations(): import('../../types/ghl.types').GHLLocation[] {
    loggingService.info('ghl-api', '[MOCK] Getting locations');
    return [
      { id: 'loc-1', name: 'Main Location', address: '123 Main St', phone: '555-0100' },
      { id: 'loc-2', name: 'Branch Office', address: '456 Oak Ave', phone: '555-0200' },
      { id: 'loc-3', name: 'Downtown Store', address: '789 Pine Rd', phone: '555-0300' },
    ];
  }

  private mockGetWebsites(locationId: string): import('../../types/ghl.types').GHLWebsite[] {
    loggingService.info('ghl-api', `[MOCK] Getting websites for location ${locationId}`);
    return [
      {
        id: 'web-1',
        name: 'Main Website',
        url: 'https://example.com',
        locationId,
        pages: [],
      },
      {
        id: 'web-2',
        name: 'Landing Pages',
        url: 'https://landing.example.com',
        locationId,
        pages: [],
      },
    ];
  }

  private mockCreateWebsite(locationId: string, name: string): import('../../types/ghl.types').GHLWebsite {
    loggingService.info('ghl-api', `[MOCK] Creating website: ${name} for location ${locationId}`);
    return {
      id: `mock-website-${Date.now()}`,
      name,
      url: `https://mockghl.com/website/${Date.now()}`,
      locationId,
      pages: [],
    };
  }

  private mockCreateWebsitePage(websiteId: string, name: string, html: string): GHLPage {
    loggingService.info('ghl-api', `[MOCK] Creating website page: ${name} in website ${websiteId}`);
    return {
      id: `mock-page-${Date.now()}`,
      name,
      url: `https://mockghl.com/page/${Date.now()}`,
      html,
    };
  }

  /**
   * Enable/disable mock responses
   */
  setMockMode(enabled: boolean): void {
    this.useMockResponses = enabled;
    loggingService.info('ghl-api', `Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const ghlAPIService = new GHLAPIService();
