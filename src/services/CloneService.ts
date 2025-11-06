import type { CloneOptions, CloneProject, ClonedAsset, WebsiteMetadata } from '../types';
import { loggingService } from './LoggingService';
import { performanceService } from './PerformanceService';
import { lighthouseService } from './LighthouseService';
import { seoAnalysisService } from './SEOAnalysisService';
import { securityScanService } from './SecurityScanService';
import { technologyDetectionService } from './TechnologyDetectionService';
import { supabase } from '../lib/supabase';
import { validateURL } from '../utils/security/validator';
import { sanitizeHTML } from '../utils/security/sanitizer';
import { cloneLimiter } from '../utils/security/rateLimiter';
import { securityLogger } from './SecurityLogger';
import { ComponentDetector } from './detection/ComponentDetector';
import { BrowserService } from './BrowserService';
import { wordPressAPIService } from './wordpress/WordPressAPIService';
import { smartCloneService } from './SmartCloneService';

export class CloneService {
  private projects: Map<string, CloneProject> = new Map();
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  async cloneWebsite(options: CloneOptions): Promise<CloneProject> {
    console.log('CloneService.cloneWebsite called with options:', options);

    // Validate URL
    const urlValidation = validateURL(options.source);
    if (!urlValidation.isValid) {
      await securityLogger.logValidationFailed('clone_url', urlValidation.error || 'Invalid');
      throw new Error(urlValidation.error || 'Invalid URL');
    }

    // Check rate limit (10 clones per hour)
    const rateLimitCheck = cloneLimiter.check('clone');
    if (!rateLimitCheck.allowed) {
      await securityLogger.logRateLimitExceeded('clone');
      throw new Error('Too many clone requests. Please try again later.');
    }

    // Use sanitized URL
    const sanitizedURL = urlValidation.sanitized || options.source;

    loggingService.info('clone', `Starting analysis for ${sanitizedURL}`, { options });

    const projectId = this.generateId();
    console.log('Generated project ID:', projectId);

    const project: CloneProject = {
      id: projectId,
      source: sanitizedURL,
      type: options.type,
      status: 'analyzing',
      progress: 0,
      currentStep: 'Initializing',
      createdAt: new Date(),
      assets: [],
    };

    this.projects.set(projectId, project);
    console.log('Project added to map, starting analysis...');

    try {
      await this.startAnalysis(projectId, options, project);
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis failed with error:', error);
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;

      loggingService.error('clone', `Analysis failed for ${options.source}`, {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    console.log('Returning project:', project);
    return project;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private async startAnalysis(projectId: string, options: CloneOptions, project: CloneProject): Promise<void> {
    let browserService: BrowserService | null = null;

    try {
      let html: string;

      // Use browser automation if enabled (for dynamic content like React/Vue)
      if (options.useBrowserAutomation) {
        console.log('startAnalysis: Browser automation ENABLED - launching browser');
        project.progress = 5;
        project.currentStep = 'Launching browser';
        options.onProgress?.(5, 'Launching browser');

        browserService = new BrowserService();
        await browserService.launch({ headless: true });

        console.log('startAnalysis: Step 1 - Capturing page with browser automation');
        project.progress = 10;
        project.currentStep = 'Loading website in browser';
        options.onProgress?.(10, 'Loading website in browser');

        // Use responsive capture if enabled (Phase 2)
        if (options.captureResponsive) {
          console.log('startAnalysis: Responsive capture ENABLED');
          project.currentStep = 'Capturing responsive breakpoints';
          options.onProgress?.(15, 'Capturing responsive breakpoints');

          const responsiveCaptureResult = await browserService.captureResponsive(options.source, undefined, true);
          html = responsiveCaptureResult.html;

          // Extract screenshot from capture result if available
          if ((responsiveCaptureResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(responsiveCaptureResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with responsive capture');
          }

          // Store responsive data in project metadata
          if (project.metadata) {
            project.metadata.responsiveData = {
              breakpoints: responsiveCaptureResult.responsiveStyles.length,
              mediaQueries: responsiveCaptureResult.mediaQueries.length,
              responsivePercentage: 0, // Will be calculated by ResponsiveAnalyzer
            };
          }

          console.log(`Responsive capture complete: ${responsiveCaptureResult.responsiveStyles.length} breakpoints, ${responsiveCaptureResult.mediaQueries.length} media queries`);
        } else if (options.captureInteractive) {
          // Use interactive capture if enabled (Phase 3)
          console.log('startAnalysis: Interactive capture ENABLED');
          project.currentStep = 'Capturing interactive states';
          options.onProgress?.(15, 'Capturing interactive states');

          const interactiveCaptureResult = await browserService.captureInteractiveStates(options.source, true);
          html = interactiveCaptureResult.html;

          // Extract screenshot from capture result if available
          if ((interactiveCaptureResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(interactiveCaptureResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with interactive capture');
          }

          // Store interactive data in project metadata
          if (project.metadata) {
            project.metadata.interactiveData = {
              totalInteractive: interactiveCaptureResult.totalInteractive,
              withHover: interactiveCaptureResult.statesDetected.hover,
              withFocus: interactiveCaptureResult.statesDetected.focus,
              withActive: interactiveCaptureResult.statesDetected.active,
              withPseudoElements: interactiveCaptureResult.interactiveElements.filter(
                e => e.pseudoElements.before || e.pseudoElements.after
              ).length,
            };
          }

          console.log(`Interactive capture complete: ${interactiveCaptureResult.totalInteractive} total, ${interactiveCaptureResult.statesDetected.hover} with hover`);
        } else if (options.captureAnimations) {
          // Use animation capture if enabled (Phase 4)
          console.log('startAnalysis: Animation capture ENABLED');
          project.currentStep = 'Detecting animations';
          options.onProgress?.(15, 'Detecting animations');

          const animationCaptureResult = await browserService.captureWithAnimations(options.source, true);
          html = animationCaptureResult.html;

          // Extract screenshot from capture result if available
          if ((animationCaptureResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(animationCaptureResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with animation capture');
          }

          // Store animation data in project metadata
          if (project.metadata) {
            project.metadata.animationData = {
              totalAnimated: animationCaptureResult.animations.totalAnimatedElements,
              withAnimations: animationCaptureResult.animations.elementsWithAnimations,
              withTransitions: animationCaptureResult.animations.elementsWithTransitions,
              withTransforms: animationCaptureResult.animations.elementsWithTransforms,
              keyframes: animationCaptureResult.animations.keyframes.length,
            };
          }

          console.log(`Animation capture complete: ${animationCaptureResult.animations.totalAnimatedElements} animated, ${animationCaptureResult.animations.keyframes.length} keyframes`);
        } else if (options.captureStyleAnalysis) {
          // Use style analysis if enabled (Phase 5)
          console.log('startAnalysis: Style analysis ENABLED');
          project.currentStep = 'Analyzing styles';
          options.onProgress?.(15, 'Analyzing styles');

          const styleAnalysisResult = await browserService.captureWithStyleAnalysis(options.source, true);
          html = styleAnalysisResult.html;

          // Extract screenshot from capture result if available
          if ((styleAnalysisResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(styleAnalysisResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with style analysis');
          }

          // Store style analysis data in project metadata
          if (project.metadata) {
            project.metadata.styleAnalysisData = {
              totalColors: styleAnalysisResult.styleAnalysis.colors.totalUnique,
              primaryColors: styleAnalysisResult.styleAnalysis.colors.mostUsed,
              totalFonts: styleAnalysisResult.styleAnalysis.typography.totalFonts,
              elementsWithShadows: styleAnalysisResult.styleAnalysis.visual.elementsWithShadows,
              elementsWithFilters: styleAnalysisResult.styleAnalysis.visual.elementsWithFilters,
              maxZIndex: styleAnalysisResult.styleAnalysis.visual.maxZIndex,
            };
          }

          console.log(`Style analysis complete: ${styleAnalysisResult.styleAnalysis.colors.totalUnique} colors, ${styleAnalysisResult.styleAnalysis.typography.totalFonts} fonts`);
        } else if (options.captureNavigation) {
          // Use navigation detection if enabled (Phase 6)
          console.log('startAnalysis: Navigation detection ENABLED');
          project.currentStep = 'Detecting navigation';
          options.onProgress?.(15, 'Detecting navigation');

          const navigationResult = await browserService.captureWithNavigation(options.source, true);
          html = navigationResult.html;

          // Extract screenshot from capture result if available
          if ((navigationResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(navigationResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with navigation detection');
          }

          // Store navigation data in project metadata
          if (project.metadata) {
            project.metadata.navigationData = {
              totalNavigations: navigationResult.navigation.totalNavigations,
              byType: navigationResult.navigation.byType,
              byMethod: navigationResult.navigation.byMethod,
              components: navigationResult.navigation.components.map((comp) => ({
                selector: comp.selector,
                type: comp.properties.type,
                confidence: comp.properties.confidence,
                linkCount: comp.properties.linkCount,
                detectionMethod: comp.detectionMethod,
              })),
            };
          }

          console.log(`Navigation detection complete: ${navigationResult.navigation.totalNavigations} navigations detected`);
        } else {
          // Standard capture with screenshot
          const captureResult = await browserService.capturePage(options.source, true);
          html = captureResult.html;

          console.log('startAnalysis: Capture result keys:', Object.keys(captureResult));
          console.log('startAnalysis: Elements in capture result:', captureResult.elements ? captureResult.elements.length : 'NONE');

          // Store elements with computed styles for later use
          if (captureResult.elements && captureResult.elements.length > 0) {
            console.log(`startAnalysis: Captured ${captureResult.elements.length} elements with computed styles`);
            console.log(`startAnalysis: Sample element:`, JSON.stringify(captureResult.elements[0], null, 2));

            // Store in project metadata for use during asset embedding
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            (project.metadata as any).elementsWithStyles = captureResult.elements;
          } else {
            console.log('startAnalysis: WARNING - No elements with computed styles received from capture');
          }

          // Extract screenshot from capture result if available
          if ((captureResult as any).screenshot) {
            if (!project.metadata) {
              project.metadata = {} as WebsiteMetadata;
            }
            project.metadata.screenshot = `data:image/png;base64,${(captureResult as any).screenshot}`;
            console.log('startAnalysis: Screenshot captured with page capture');
          } else {
            console.log('startAnalysis: No screenshot returned from capture');
          }
        }
        console.log('startAnalysis: Browser capture complete - HTML length:', html.length);
      } else {
        // Standard static HTML fetch (existing behavior)
        console.log('startAnalysis: Browser automation DISABLED - using standard fetch');
        console.log('startAnalysis: Step 1 - Fetching HTML');
        project.progress = 10;
        project.currentStep = 'Fetching HTML';
        options.onProgress?.(10, 'Fetching HTML');

        html = await this.fetchHtml(options.source);
        console.log('startAnalysis: HTML fetched, length:', html.length);
      }

      project.originalHtml = html;

      // Step 2: Check if this is a WordPress site (via REST API)
      console.log('startAnalysis: Step 2 - Checking for WordPress REST API');
      project.progress = 25;
      project.currentStep = 'Detecting WordPress via REST API';
      options.onProgress?.(25, '🔍 Detecting WordPress via REST API...');

      console.log('[WordPress] Probing /wp-json/ endpoint...');
      const wpDetection = await wordPressAPIService.detectWordPress(options.source, html);

      if (wpDetection.isWordPress && wpDetection.apiUrl) {
        // WordPress detected - detailed logging
        console.log('[WordPress] ✓ WordPress REST API detected!');
        console.log(`[WordPress] Site: ${wpDetection.siteInfo?.name || 'Unknown'}`);
        console.log(`[WordPress] Version: ${wpDetection.version || 'Unknown'}`);
        console.log(`[WordPress] API URL: ${wpDetection.apiUrl}`);
        console.log(`[WordPress] Confidence: ${wpDetection.confidence}%`);

        loggingService.success('clone', `WordPress detected at ${options.source}`, {
          projectId,
          siteName: wpDetection.siteInfo?.name,
          version: wpDetection.version,
          apiUrl: wpDetection.apiUrl
        });

        // Detect page builder
        if (wpDetection.pageBuilder?.isActive) {
          console.log(`[WordPress] Page Builder: ${wpDetection.pageBuilder.name} (${wpDetection.pageBuilder.version || 'unknown version'})`);
          project.currentStep = `WordPress detected: ${wpDetection.pageBuilder.name} page builder`;
          options.onProgress?.(27, `✓ WordPress detected with ${wpDetection.pageBuilder.name} page builder`);
        } else {
          project.currentStep = 'WordPress detected: Gutenberg (native blocks)';
          options.onProgress?.(27, '✓ WordPress detected with Gutenberg blocks');
        }

        // Start WordPress REST API cloning
        project.currentStep = 'Fetching posts via REST API';
        options.onProgress?.(30, '📥 Fetching posts via /wp/v2/posts...');
        console.log('[WordPress] Fetching posts from REST API...');

        // Clone using WordPress REST API (gets native blocks)
        const wpCloneResult = await wordPressAPIService.cloneWordPressSite(wpDetection.apiUrl, {
          maxPosts: 50,
          maxPages: 50,
          detectPageBuilder: true,
          blockOptions: {
            includeHTML: true,
            maxDepth: 10,
          },
        });

        console.log(`[WordPress] ✓ Fetched ${wpCloneResult.postsCloned} posts`);
        project.currentStep = 'Fetching pages via REST API';
        options.onProgress?.(35, `✓ Fetched ${wpCloneResult.postsCloned} posts. Fetching pages...`);

        console.log(`[WordPress] ✓ Fetched ${wpCloneResult.pagesCloned} pages`);
        project.currentStep = 'Parsing WordPress blocks';
        options.onProgress?.(40, `✓ Fetched ${wpCloneResult.pagesCloned} pages. Parsing blocks...`);

        console.log(`[WordPress] ✓ Parsed ${wpCloneResult.blocksCount} blocks`);
        console.log('[WordPress] Block types detected:', wpCloneResult.posts
          .flatMap(p => p.blocks || [])
          .map(b => `${b.namespace}/${b.name}`)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 10)
          .join(', '));

        project.currentStep = 'WordPress clone complete';
        options.onProgress?.(45, `✓ WordPress clone complete: ${wpCloneResult.postsCloned} posts, ${wpCloneResult.pagesCloned} pages, ${wpCloneResult.blocksCount} blocks`);

        // Store WordPress-specific data in project metadata
        if (!project.metadata) {
          project.metadata = {} as WebsiteMetadata;
        }

        project.metadata.wordPressData = {
          isWordPress: true,
          version: wpDetection.version,
          apiUrl: wpDetection.apiUrl,
          siteName: wpDetection.siteInfo?.name,
          pageBuilder: wpCloneResult.pageBuilder?.name || 'unknown',
          postsCloned: wpCloneResult.postsCloned,
          pagesCloned: wpCloneResult.pagesCloned,
          blocksCount: wpCloneResult.blocksCount,
          posts: wpCloneResult.posts,
        };

        loggingService.success('clone', `WordPress clone complete: ${wpCloneResult.postsCloned} posts, ${wpCloneResult.pagesCloned} pages, ${wpCloneResult.blocksCount} blocks parsed`, { projectId });
      } else if (wpDetection.isWordPress && !wpDetection.apiUrl) {
        // WordPress detected via HTML but REST API is disabled
        console.log('[WordPress] ✓ WordPress detected via HTML analysis');
        console.log(`[WordPress] Confidence: ${wpDetection.confidence}%`);
        console.log('[WordPress] REST API is disabled - using standard HTML parsing');

        if (wpDetection.version) {
          console.log(`[WordPress] Version: ${wpDetection.version}`);
        }

        if (wpDetection.pageBuilder?.isActive) {
          console.log(`[WordPress] Page Builder: ${wpDetection.pageBuilder.name}`);
          project.currentStep = `WordPress detected (REST API disabled): ${wpDetection.pageBuilder.name}`;
          options.onProgress?.(30, `✓ WordPress detected via HTML - ${wpDetection.pageBuilder.name} page builder (REST API disabled)`);
        } else {
          project.currentStep = 'WordPress detected (REST API disabled)';
          options.onProgress?.(30, '✓ WordPress detected via HTML - REST API disabled, using HTML parsing');
        }

        loggingService.warning('clone', 'WordPress detected but REST API is disabled - falling back to HTML parsing', {
          projectId,
          version: wpDetection.version,
          confidence: wpDetection.confidence
        });

        // Store WordPress detection data (no posts/pages since REST API is disabled)
        if (!project.metadata) {
          project.metadata = {} as WebsiteMetadata;
        }

        project.metadata.wordPressData = {
          isWordPress: true,
          version: wpDetection.version,
          apiUrl: undefined,
          siteName: undefined,
          pageBuilder: wpDetection.pageBuilder?.name || 'unknown',
          postsCloned: 0,
          pagesCloned: 0,
          blocksCount: 0,
          posts: [],
        };
      } else {
        // Not WordPress
        console.log('[WordPress] Not a WordPress site');
        project.currentStep = 'Not WordPress - using standard HTML parsing';
        options.onProgress?.(30, '✓ Not WordPress - proceeding with standard HTML parsing');
      }

      console.log('startAnalysis: Step 3 - Parsing HTML');
      project.progress = wpDetection.isWordPress ? 50 : 30;
      project.currentStep = 'Parsing HTML structure';
      options.onProgress?.(wpDetection.isWordPress ? 50 : 30, 'Parsing HTML structure');

      const parsedData = this.parseHtml(html, options.source);
      console.log('startAnalysis: HTML parsed');

      console.log('startAnalysis: Step 4 - Extracting metadata');
      project.progress = 50;
      project.currentStep = 'Extracting metadata';

      const metadata = this.extractMetadata(parsedData, html);
      project.metadata = { ...metadata, ...project.metadata }; // Merge with existing metadata (including WordPress data)
      console.log('startAnalysis: Metadata extracted:', metadata);

      loggingService.info('clone', `Detected framework: ${metadata.framework}`, { projectId });

      console.log('startAnalysis: Step 5 - Detecting page builder components');
      project.progress = 40;
      project.currentStep = 'Detecting page builder components';

      const detector = new ComponentDetector();
      const detection = detector.detect(html);
      project.detection = detection;
      console.log('startAnalysis: Component detection completed:', {
        builder: detection.builder,
        components: detection.components.length,
        confidence: detection.confidence,
      });

      loggingService.info('clone', `Detected builder: ${detection.builder || 'none'}`, {
        projectId,
        componentsCount: detection.components.length
      });

      // Download assets if requested
      console.log('startAnalysis: Checking includeAssets option:', options.includeAssets);
      if (options.includeAssets !== false) {
        console.log('startAnalysis: Step 5 - Downloading CSS (includeAssets is enabled)');
        project.progress = 50;
        project.currentStep = 'Downloading CSS files';

        console.log('startAnalysis: Found', parsedData.stylesheets.length, 'stylesheets and', parsedData.inlineStyles.length, 'inline styles');
        const cssAssets = await this.extractAndDownloadCSS(parsedData, options.source);
        console.log('startAnalysis: Downloaded', cssAssets.length, 'CSS assets');

        console.log('startAnalysis: Step 6 - Downloading images');
        project.progress = 60;
        project.currentStep = 'Downloading images';

        console.log('startAnalysis: Found', parsedData.images.length, 'images and', parsedData.backgroundImages.length, 'background images');
        const imageAssets = await this.extractAndDownloadImages(parsedData, options.source);
        console.log('startAnalysis: Downloaded', imageAssets.length, 'image assets');

        console.log('startAnalysis: Step 7 - Downloading fonts');
        project.progress = 65;
        project.currentStep = 'Downloading fonts';

        console.log('startAnalysis: Found', parsedData.fonts.length, 'fonts');
        const fontAssets = await this.extractAndDownloadFonts(parsedData, options.source);
        console.log('startAnalysis: Downloaded', fontAssets.length, 'font assets');

        const allAssets = [...cssAssets, ...imageAssets, ...fontAssets];
        project.assets = allAssets;

        console.log(`startAnalysis: Total assets downloaded: ${allAssets.length} (${cssAssets.length} CSS, ${imageAssets.length} images, ${fontAssets.length} fonts)`);
        loggingService.info('clone', `Downloaded ${allAssets.length} assets`, { projectId });

        console.log('startAnalysis: Step 8 - Embedding assets in HTML');
        project.progress = 70;
        project.currentStep = 'Embedding assets in HTML';

        const rewrittenHtml = this.embedAssetsInHtml(html, allAssets, project.metadata);
        project.originalHtml = rewrittenHtml;
        console.log('startAnalysis: HTML rewritten, new size:', new Blob([rewrittenHtml]).size, 'bytes');

        metadata.totalSize = this.calculateTotalSize(allAssets);
        metadata.assetCount = allAssets.length;
        console.log('startAnalysis: Metadata updated - total size:', metadata.totalSize, 'bytes, asset count:', metadata.assetCount);
      } else {
        console.log('startAnalysis: Asset downloading SKIPPED (includeAssets is false)');
      }

      // Step 9: Performance Analysis (if enabled)
      if (options.performanceAnalysis !== false) {
        console.log('startAnalysis: Step 9 - Analyzing performance');
        project.progress = 75;
        project.currentStep = 'Analyzing performance metrics';

        const metrics = await performanceService.analyzePerformance(html, '', '', options.source);
        project.originalScore = metrics.score;
        project.metrics = metrics;
        console.log('startAnalysis: Performance analyzed, score:', metrics.score);

        console.log('startAnalysis: Step 10 - Running Lighthouse audit');
        project.progress = 80;
        project.currentStep = 'Running Lighthouse audit';

        try {
          const lighthouseResults = await lighthouseService.runAuditWithRetry(options.source);
          metrics.lighthouse = lighthouseResults;
          project.originalScore = Math.round((metrics.score + lighthouseResults.performanceScore) / 2);
          console.log('startAnalysis: Lighthouse completed, score:', lighthouseResults.performanceScore);

          loggingService.success('clone', `Lighthouse audit completed - Score: ${lighthouseResults.performanceScore}`, {
            projectId,
            lighthouseScore: lighthouseResults.performanceScore,
          });
        } catch (error) {
          console.log('startAnalysis: Lighthouse failed, using custom metrics only');
          loggingService.warning('clone', 'Lighthouse audit failed, continuing with custom metrics', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } else {
        console.log('startAnalysis: Performance analysis SKIPPED');
      }

      // Step 11: SEO Analysis (if enabled)
      if (options.seoAnalysis) {
        console.log('startAnalysis: Step 11 - Running SEO analysis');
        project.progress = 85;
        project.currentStep = 'Analyzing SEO';

        try {
          const seoResults = await seoAnalysisService.analyzeSEO(options.source, html);
          project.seoAnalysis = seoResults;
          console.log('startAnalysis: SEO analysis completed, score:', seoResults.score);

          loggingService.success('clone', `SEO analysis completed - Score: ${seoResults.score}/100`, {
            projectId,
            seoScore: seoResults.score,
          });
        } catch (error) {
          console.log('startAnalysis: SEO analysis failed');
          loggingService.warning('clone', 'SEO analysis failed', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Step 12: Security Scan (if enabled)
      if (options.securityScan) {
        console.log('startAnalysis: Step 12 - Running security scan');
        project.progress = 90;
        project.currentStep = 'Scanning security';

        try {
          const securityResults = await securityScanService.scanSecurity(options.source, html);
          project.securityScan = securityResults;
          console.log('startAnalysis: Security scan completed, score:', securityResults.score);

          loggingService.success('clone', `Security scan completed - Score: ${securityResults.score}/100`, {
            projectId,
            securityScore: securityResults.score,
          });
        } catch (error) {
          console.log('startAnalysis: Security scan failed');
          loggingService.warning('clone', 'Security scan failed', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Step 13: Technology Detection (if enabled)
      if (options.technologyDetection) {
        console.log('startAnalysis: Step 13 - Detecting technologies');
        project.progress = 95;
        project.currentStep = 'Detecting technologies';

        try {
          const techStack = await technologyDetectionService.detectTechnologies(options.source, html);
          project.technologyStack = techStack;
          const totalTech = Object.values(techStack).reduce((sum, arr) => sum + arr.length, 0);
          console.log('startAnalysis: Technology detection completed, found:', totalTech, 'technologies');

          loggingService.success('clone', `Technology detection completed - Found ${totalTech} technologies`, {
            projectId,
            totalTechnologies: totalTech,
          });
        } catch (error) {
          console.log('startAnalysis: Technology detection failed');
          loggingService.warning('clone', 'Technology detection failed', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      console.log('startAnalysis: Step 14 - Saving project');
      project.progress = 100;
      project.currentStep = 'Analysis completed';
      project.status = 'completed';

      await this.saveProject(project);
      console.log('startAnalysis: Project saved successfully');

      loggingService.success('clone', `Successfully analyzed ${options.source}`, {
        projectId,
        score: project.metrics?.score || project.originalScore || 0,
      });
    } catch (error) {
      // Enhanced error logging with full details
      console.error('startAnalysis: Error occurred:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        fullError: error,
      });

      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch((saveError) => {
        console.error('Failed to save error state:', {
          message: saveError instanceof Error ? saveError.message : 'Unknown save error',
          stack: saveError instanceof Error ? saveError.stack : undefined,
        });
      });

      loggingService.error('clone', 'Analysis process error', {
        projectId,
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    } finally {
      // Always close browser if it was launched (prevent memory leaks)
      if (browserService) {
        console.log('startAnalysis: Closing browser instance');
        await browserService.close();
      }
    }
  }

  async downloadAssets(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.originalHtml) {
      throw new Error('No HTML to process');
    }

    loggingService.info('clone', `Starting asset download for project ${projectId}`);

    try {
      project.status = 'cloning';
      project.progress = 0;
      project.currentStep = 'Downloading assets';

      const parsedData = this.parseHtml(project.originalHtml, project.source);

      project.progress = 20;
      project.currentStep = 'Downloading CSS files';

      const cssAssets = await this.extractAndDownloadCSS(parsedData, project.source);

      project.progress = 40;
      project.currentStep = 'Downloading JavaScript files';

      const jsAssets = await this.extractAndDownloadJS(parsedData, project.source);

      project.progress = 60;
      project.currentStep = 'Downloading images';

      const imageAssets = await this.extractAndDownloadImages(parsedData, project.source);

      project.progress = 80;
      project.currentStep = 'Downloading fonts';

      const fontAssets = await this.extractAndDownloadFonts(parsedData, project.source);

      const allAssets = [...cssAssets, ...jsAssets, ...imageAssets, ...fontAssets];
      project.assets = allAssets;

      loggingService.info('clone', `Downloaded ${allAssets.length} assets`, { projectId });

      project.progress = 90;
      project.currentStep = 'Rewriting HTML with local paths';

      const rewrittenHtml = this.rewriteHtmlWithLocalPaths(project.originalHtml, allAssets);
      project.originalHtml = rewrittenHtml;

      if (project.metadata) {
        project.metadata.totalSize = this.calculateTotalSize(allAssets);
        project.metadata.assetCount = allAssets.length;
      }

      project.progress = 100;
      project.currentStep = 'Download completed';
      project.status = 'completed';

      await this.saveProject(project);

      loggingService.success('clone', `Successfully downloaded assets for project ${projectId}`);
    } catch (error) {
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch(() => {});

      loggingService.error('clone', 'Asset download error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async startCloning(projectId: string, options: CloneOptions, project: CloneProject): Promise<void> {
    try {
      project.progress = 10;
      project.currentStep = 'Fetching HTML';

      const html = await this.fetchHtml(options.source);
      project.originalHtml = html;

      project.progress = 20;
      project.currentStep = 'Parsing HTML structure';

      const parsedData = this.parseHtml(html, options.source);

      project.progress = 30;
      project.currentStep = 'Extracting metadata';

      const metadata = this.extractMetadata(parsedData, html);
      project.metadata = metadata;

      loggingService.info('clone', `Detected framework: ${metadata.framework}`, { projectId });

      if (options.includeAssets !== false) {
        project.progress = 40;
        project.currentStep = 'Extracting CSS files';

        const cssAssets = await this.extractAndDownloadCSS(parsedData, options.source);

        project.progress = 50;
        project.currentStep = 'Extracting JavaScript files';

        const jsAssets = await this.extractAndDownloadJS(parsedData, options.source);

        project.progress = 60;
        project.currentStep = 'Extracting images';

        const imageAssets = await this.extractAndDownloadImages(parsedData, options.source);

        project.progress = 70;
        project.currentStep = 'Extracting fonts';

        const fontAssets = await this.extractAndDownloadFonts(parsedData, options.source);

        const allAssets = [...cssAssets, ...jsAssets, ...imageAssets, ...fontAssets];
        project.assets = allAssets;

        loggingService.info('clone', `Extracted ${allAssets.length} assets`, { projectId });

        project.progress = 75;
        project.currentStep = 'Rewriting HTML with local paths';

        const rewrittenHtml = this.rewriteHtmlWithLocalPaths(html, allAssets);
        project.originalHtml = rewrittenHtml;

        metadata.totalSize = this.calculateTotalSize(allAssets);
        metadata.assetCount = allAssets.length;
      }

      project.progress = 80;
      project.currentStep = 'Analyzing performance metrics';

      const metrics = await performanceService.analyzePerformance(html, '', '', options.source);
      project.originalScore = metrics.score;
      project.metrics = metrics;

      project.progress = 90;
      project.currentStep = 'Running Lighthouse audit';

      try {
        const lighthouseResults = await lighthouseService.runAuditWithRetry(options.source);
        metrics.lighthouse = lighthouseResults;
        project.originalScore = Math.round((metrics.score + lighthouseResults.performanceScore) / 2);

        loggingService.success('clone', `Lighthouse audit completed - Score: ${lighthouseResults.performanceScore}`, {
          projectId,
          lighthouseScore: lighthouseResults.performanceScore,
        });
      } catch (error) {
        loggingService.warning('clone', 'Lighthouse audit failed, continuing with custom metrics', {
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      project.progress = 100;
      project.currentStep = 'Clone completed';
      project.status = 'completed';

      await this.saveProject(project);

      loggingService.success('clone', `Successfully cloned ${options.source}`, {
        projectId,
        score: metrics.score,
      });
    } catch (error) {
      project.status = 'error';
      project.currentStep = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      await this.saveProject(project).catch(() => {});

      loggingService.error('clone', 'Clone process error', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    // List of CORS proxies to try in order
    const corsProxies = [
      { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, name: 'AllOrigins' },
      { url: `https://corsproxy.io/?${encodeURIComponent(url)}`, name: 'CorsProxy.io' },
      { url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, name: 'CodeTabs' },
      { url: `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`, name: 'ThingProxy' },
      { url: url, name: 'Direct (no proxy)' }, // Last resort - direct fetch
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < corsProxies.length; i++) {
      const proxy = corsProxies[i];
      const proxyUrl = proxy.url;
      const proxyName = proxy.name;

      try {
        console.log(`fetchHtml: Attempting proxy ${i + 1}/${corsProxies.length} (${proxyName})`);
        loggingService.debug('clone', `Fetching HTML from ${url} via ${proxyName}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': this.userAgent,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log(`fetchHtml: Proxy ${proxyName} returned status ${response.status}`);
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        if (!html || html.length < 100) {
          console.log(`fetchHtml: Proxy ${proxyName} returned insufficient data (${html.length} bytes)`);
          throw new Error('Response too small, likely empty');
        }

        console.log(`fetchHtml: Success with ${proxyName} - ${html.length} bytes fetched`);
        loggingService.debug('clone', `Successfully fetched HTML from ${url} via ${proxyName}`, {
          size: html.length,
        });
        return html;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`fetchHtml: Proxy ${proxyName} failed:`, lastError.message);

        // If this isn't the last proxy, continue to the next one
        if (i < corsProxies.length - 1) {
          console.log(`fetchHtml: Trying next proxy...`);
          continue;
        }
      }
    }

    // All proxies failed
    const errorMsg = `All CORS proxies failed. Last error: ${lastError?.message || 'Unknown'}`;
    console.error('fetchHtml: All proxies exhausted');
    loggingService.error('clone', `Failed to fetch URL after trying all proxies: ${url}`, {
      error: lastError?.message,
      proxiesAttempted: corsProxies.length,
    });

    throw new Error(errorMsg);
  }

  private parseHtml(html: string, baseUrl: string): ParsedHTML {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = Array.from(doc.querySelectorAll('img')).map((img) => ({
      src: this.resolveUrl(img.getAttribute('src') || '', baseUrl),
      alt: img.getAttribute('alt') || '',
      width: parseInt(img.getAttribute('width') || '0'),
      height: parseInt(img.getAttribute('height') || '0'),
      element: img,
    }));

    const stylesheets = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(
      (link) => ({
        href: this.resolveUrl(link.getAttribute('href') || '', baseUrl),
        element: link,
      })
    );

    const inlineStyles = Array.from(doc.querySelectorAll('style')).map((style) => ({
      content: style.textContent || '',
      element: style,
    }));

    const scripts = Array.from(doc.querySelectorAll('script[src]')).map((script) => ({
      src: this.resolveUrl(script.getAttribute('src') || '', baseUrl),
      element: script,
    }));

    const inlineScripts = Array.from(doc.querySelectorAll('script:not([src])')).map((script) => ({
      content: script.textContent || '',
      element: script,
    }));

    const fonts = this.extractFontsFromStyles(doc, baseUrl);

    const backgroundImages = this.extractBackgroundImages(doc, baseUrl);

    return {
      document: doc,
      images,
      stylesheets,
      inlineStyles,
      scripts,
      inlineScripts,
      fonts,
      backgroundImages,
    };
  }

  private extractFontsFromStyles(doc: Document, baseUrl: string): Array<{ href: string }> {
    const fonts: Array<{ href: string }> = [];

    const fontLinks = Array.from(doc.querySelectorAll('link[rel*="font"]'));
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        fonts.push({ href: this.resolveUrl(href, baseUrl) });
      }
    });

    const styles = Array.from(doc.querySelectorAll('style'));
    styles.forEach(style => {
      const content = style.textContent || '';
      const fontFaceRegex = /@font-face\s*{[^}]*src:\s*url\(['"]?([^'"()]+)['"]?\)/g;
      let match;
      while ((match = fontFaceRegex.exec(content)) !== null) {
        fonts.push({ href: this.resolveUrl(match[1], baseUrl) });
      }
    });

    return fonts;
  }

  private extractBackgroundImages(doc: Document, baseUrl: string): Array<{ src: string }> {
    const bgImages: Array<{ src: string }> = [];

    const elementsWithStyle = Array.from(doc.querySelectorAll('[style*="background"]'));
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style') || '';
      const urlMatch = style.match(/url\(['"]?([^'"()]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        bgImages.push({ src: this.resolveUrl(urlMatch[1], baseUrl) });
      }
    });

    return bgImages;
  }

  private extractMetadata(parsed: ParsedHTML, html: string): WebsiteMetadata {
    const doc = parsed.document;

    const title = doc.querySelector('title')?.textContent || 'Untitled Website';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');

    const framework = this.detectFramework(html, doc);
    const responsive = this.checkResponsive(doc, parsed.inlineStyles);

    return {
      title,
      description,
      favicon,
      framework,
      responsive,
      totalSize: 0,
      assetCount: 0,
      pageCount: 1,
    };
  }

  private detectFramework(html: string, doc: Document): string {
    if (html.includes('__NEXT_DATA__') || html.includes('_next/static')) {
      return 'Next.js';
    }
    if (html.includes('react') || html.includes('data-reactroot') || html.includes('data-reactid')) {
      return 'React';
    }
    if (html.includes('__NUXT__')) {
      return 'Nuxt.js';
    }
    if (html.includes('v-cloak') || html.includes('v-if') || html.includes('v-for')) {
      return 'Vue';
    }
    if (html.includes('ng-version') || html.includes('ng-app') || html.includes('ngApp')) {
      return 'Angular';
    }
    if (doc.querySelector('script[src*="jquery"]')) {
      return 'jQuery';
    }
    if (html.includes('svelte-') || doc.querySelector('script[src*="svelte"]')) {
      return 'Svelte';
    }
    return 'Vanilla';
  }

  private checkResponsive(doc: Document, inlineStyles: Array<{ content: string }>): boolean {
    const viewport = doc.querySelector('meta[name="viewport"]');
    if (viewport) return true;

    for (const style of inlineStyles) {
      if (style.content.includes('@media')) {
        return true;
      }
    }

    return false;
  }

  private async extractAndDownloadCSS(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    console.log(`[CSS] Starting parallel download of ${parsed.stylesheets.length} external stylesheets...`);
    const startTime = Date.now();
    const assets: ClonedAsset[] = [];

    // Download external stylesheets in parallel (limit to 10)
    const stylesheetUrls = parsed.stylesheets.slice(0, 10).filter(s => s.href);
    const downloadPromises = stylesheetUrls.map(stylesheet =>
      this.downloadTextAsset(stylesheet.href, 'css')
    );

    const results = await Promise.allSettled(downloadPromises);

    let successCount = 0;
    let failCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        assets.push(result.value);
        successCount++;
      } else {
        failCount++;
        console.log(`[CSS] Failed to download: ${stylesheetUrls[index].href}`,
          result.status === 'rejected' ? result.reason : 'returned null');
      }
    });

    console.log(`[CSS] Downloaded ${successCount}/${stylesheetUrls.length} stylesheets in ${Date.now() - startTime}ms (${failCount} failed)`);

    // Add inline styles (no download needed)
    for (let i = 0; i < parsed.inlineStyles.length; i++) {
      const style = parsed.inlineStyles[i];
      if (style.content) {
        assets.push({
          type: 'css',
          originalUrl: `inline-style-${i}`,
          localPath: `./assets/css/inline-${i}.css`,
          size: new Blob([style.content]).size,
          content: style.content,
          format: 'css',
        });
      }
    }

    console.log(`[CSS] Total CSS assets: ${assets.length} (${successCount} external + ${parsed.inlineStyles.length} inline)`);
    return assets;
  }

  private async extractAndDownloadJS(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    const assets: ClonedAsset[] = [];

    for (const script of parsed.scripts.slice(0, 10)) {
      if (script.src) {
        const asset = await this.downloadTextAsset(script.src, 'js');
        if (asset) assets.push(asset);
      }
    }

    for (let i = 0; i < parsed.inlineScripts.length; i++) {
      const script = parsed.inlineScripts[i];
      if (script.content) {
        assets.push({
          type: 'js',
          originalUrl: `inline-script-${i}`,
          localPath: `./assets/js/inline-${i}.js`,
          size: new Blob([script.content]).size,
          content: script.content,
          format: 'js',
        });
      }
    }

    return assets;
  }

  private async extractAndDownloadImages(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    console.log(`[IMAGES] Starting parallel download of ${parsed.images.length} images and ${parsed.backgroundImages.length} background images...`);
    const startTime = Date.now();
    const assets: ClonedAsset[] = [];

    // Prepare all image downloads (regular + background, limit to 30 total)
    const imagesToDownload = [
      ...parsed.images.slice(0, 30).filter(img => img.src && !img.src.startsWith('data:')),
      ...parsed.backgroundImages.slice(0, 10).filter(bgImg => bgImg.src && !bgImg.src.startsWith('data:'))
    ];

    // Download all images in parallel
    const downloadPromises = imagesToDownload.map(async (img) => {
      const asset = await this.downloadBinaryAsset(img.src, 'image');
      if (asset && 'width' in img && 'height' in img && img.width && img.height) {
        asset.dimensions = { width: img.width, height: img.height };
      }
      return asset;
    });

    const results = await Promise.allSettled(downloadPromises);

    let successCount = 0;
    let failCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        assets.push(result.value);
        successCount++;
      } else {
        failCount++;
        console.log(`[IMAGES] Failed to download: ${imagesToDownload[index].src.substring(0, 100)}`,
          result.status === 'rejected' ? result.reason : 'returned null');
      }
    });

    console.log(`[IMAGES] Downloaded ${successCount}/${imagesToDownload.length} images in ${Date.now() - startTime}ms (${failCount} failed)`);
    return assets;
  }

  private async extractAndDownloadFonts(parsed: ParsedHTML, baseUrl: string): Promise<ClonedAsset[]> {
    console.log(`[FONTS] Starting parallel download of ${parsed.fonts.length} fonts...`);
    const startTime = Date.now();
    const assets: ClonedAsset[] = [];

    // Download fonts in parallel (limit to 10)
    const fontsToDownload = parsed.fonts.slice(0, 10).filter(f => f.href);
    const downloadPromises = fontsToDownload.map(font =>
      this.downloadBinaryAsset(font.href, 'font')
    );

    const results = await Promise.allSettled(downloadPromises);

    let successCount = 0;
    let failCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        assets.push(result.value);
        successCount++;
      } else {
        failCount++;
        console.log(`[FONTS] Failed to download: ${fontsToDownload[index].href}`,
          result.status === 'rejected' ? result.reason : 'returned null');
      }
    });

    console.log(`[FONTS] Downloaded ${successCount}/${fontsToDownload.length} fonts in ${Date.now() - startTime}ms (${failCount} failed)`);
    return assets;
  }

  private async downloadTextAsset(url: string, type: 'css' | 'js'): Promise<ClonedAsset | null> {
    const startTime = Date.now();
    try {
      // Use CORS proxy to download from source URL
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

      // 10 second timeout for text assets
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`[${type.toUpperCase()}] Timeout (10s) downloading: ${url.substring(0, 100)}`);
      }, 10000);

      const response = await fetch(corsProxyUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`[${type.toUpperCase()}] HTTP ${response.status} for: ${url.substring(0, 100)}`);
        return null;
      }

      const content = await response.text();
      const size = new Blob([content]).size;
      const duration = Date.now() - startTime;

      const asset: ClonedAsset = {
        type,
        originalUrl: url,
        localPath: this.generateLocalPath(url, type),
        size,
        content,
        format: type,
      };

      console.log(`[${type.toUpperCase()}] ✓ Downloaded ${url.substring(0, 80)} (${(size / 1024).toFixed(1)}KB in ${duration}ms)`);
      return asset;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[${type.toUpperCase()}] ✗ Failed after ${duration}ms: ${url.substring(0, 80)} - ${errorMsg}`);
      return null;
    }
  }

  private async downloadBinaryAsset(url: string, type: 'image' | 'font'): Promise<ClonedAsset | null> {
    const startTime = Date.now();
    try {
      // Use CORS proxy to download from source URL
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

      // 15 second timeout for binary assets (images/fonts can be larger)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`[${type.toUpperCase()}] Timeout (15s) downloading: ${url.substring(0, 100)}`);
      }, 15000);

      const response = await fetch(corsProxyUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`[${type.toUpperCase()}] HTTP ${response.status} for: ${url.substring(0, 100)}`);
        return null;
      }

      const blob = await response.blob();
      const size = blob.size;
      const base64Content = await this.blobToBase64(blob);
      const duration = Date.now() - startTime;

      const asset: ClonedAsset = {
        type,
        originalUrl: url,
        localPath: this.generateLocalPath(url, type === 'image' ? 'images' : 'fonts'),
        size,
        content: base64Content,
        format: this.getFileExtension(url),
      };

      console.log(`[${type.toUpperCase()}] ✓ Downloaded ${url.substring(0, 80)} (${(size / 1024).toFixed(1)}KB in ${duration}ms)`);
      return asset;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`[${type.toUpperCase()}] ✗ Failed after ${duration}ms: ${url.substring(0, 80)} - ${errorMsg}`);
      return null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('data:')) return url;

    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  private generateLocalPath(url: string, folder: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'file';
      const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      return `./assets/${folder}/${sanitized}`;
    } catch {
      return `./assets/${folder}/${Date.now()}`;
    }
  }

  private getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const ext = pathname.split('.').pop() || '';
      return ext.toLowerCase();
    } catch {
      return '';
    }
  }

  private embedAssetsInHtml(html: string, assets: ClonedAsset[], metadata?: WebsiteMetadata): string {
    let rewrittenHtml = html;
    let imagesEmbedded = 0;
    let cssInlined = 0;
    let fontsEmbedded = 0;
    let stylesApplied = 0;

    // Get elements with computed styles from metadata
    const elementsWithStyles = (metadata as any)?.elementsWithStyles || [];

    // FIRST: Apply computed styles to images to preserve their rendered dimensions
    // This must happen BEFORE we replace URLs with data URIs
    if (elementsWithStyles.length > 0) {
      console.log(`embedAssetsInHtml: Applying computed styles to images from ${elementsWithStyles.length} elements`);

      // Debug: Show sample element structure
      const sampleElement = elementsWithStyles.find((el: any) => el.tag?.toUpperCase() === 'IMG');
      if (sampleElement) {
        console.log('embedAssetsInHtml: Sample IMG element structure:', {
          tag: sampleElement.tag,
          hasPosition: !!sampleElement.position,
          position: sampleElement.position,
          attributes: sampleElement.attributes
        });
      }

      // Find all img elements in the HTML
      const imgRegex = /<img([^>]*)>/gi;
      rewrittenHtml = rewrittenHtml.replace(imgRegex, (match, attributes) => {
        // Extract src attribute to match with elements
        const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
        if (!srcMatch) return match;

        const src = srcMatch[1];

        // Find corresponding element with computed styles
        // Railway API returns: { tag: 'img', position: { x, y, width, height }, ... }
        const element = elementsWithStyles.find((el: any) =>
          el.tag?.toUpperCase() === 'IMG' && el.attributes?.src === src
        );

        if (element && element.position) {
          const { width, height } = element.position;

          // Only apply if dimensions are reasonable (not 0 or extremely large)
          if (width > 0 && width < 5000 && height > 0 && height < 5000) {
            // Check if style attribute already exists
            const styleMatch = attributes.match(/style=["']([^"']*)["']/i);
            let newAttributes = attributes;

            if (styleMatch) {
              // Append to existing style
              const existingStyle = styleMatch[1];
              const newStyle = `${existingStyle}; width: ${Math.round(width)}px; height: ${Math.round(height)}px;`;
              newAttributes = attributes.replace(/style=["'][^"']*["']/i, `style="${newStyle}"`);
            } else {
              // Add new style attribute
              newAttributes = attributes + ` style="width: ${Math.round(width)}px; height: ${Math.round(height)}px;"`;
            }

            stylesApplied++;
            return `<img${newAttributes}>`;
          }
        }

        return match;
      });

      console.log(`embedAssetsInHtml: Applied dimensions to ${stylesApplied} images`);
    }

    // SECOND: Now embed images and fonts as data URIs
    for (const asset of assets) {
      if (asset.originalUrl.startsWith('inline-')) continue;

      const escapedUrl = asset.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');

      if (asset.type === 'image' && asset.content?.startsWith('data:')) {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.content);
        imagesEmbedded++;
      } else if (asset.type === 'font' && asset.content?.startsWith('data:')) {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.content);
        fontsEmbedded++;
      }
    }

    // Now inline CSS stylesheets
    const cssAssets = assets.filter(a => a.type === 'css' && !a.originalUrl.startsWith('inline-'));

    for (const cssAsset of cssAssets) {
      if (!cssAsset.content) continue;

      // Find the <link> tag for this stylesheet
      const escapedUrl = cssAsset.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const linkRegex = new RegExp(`<link[^>]*href=["']${escapedUrl}["'][^>]*>`, 'gi');

      // Replace the <link> tag with an inline <style> tag
      const styleTag = `<style data-original-href="${cssAsset.originalUrl}">\n${cssAsset.content}\n</style>`;
      rewrittenHtml = rewrittenHtml.replace(linkRegex, styleTag);
      cssInlined++;
    }

    console.log(`embedAssetsInHtml: Embedded ${imagesEmbedded} images, ${fontsEmbedded} fonts as data URIs, inlined ${cssInlined} CSS files, applied ${stylesApplied} image dimensions`);
    loggingService.debug('clone', `Embedded ${imagesEmbedded + fontsEmbedded + cssInlined} assets in HTML, applied ${stylesApplied} styles`);
    return rewrittenHtml;
  }

  private rewriteHtmlWithLocalPaths(html: string, assets: ClonedAsset[]): string {
    let rewrittenHtml = html;
    let embedded = 0;
    let replaced = 0;

    for (const asset of assets) {
      if (asset.originalUrl.startsWith('inline-')) continue;

      const escapedUrl = asset.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');

      // Embed images as data URIs
      if (asset.type === 'image' && asset.content?.startsWith('data:')) {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.content);
        embedded++;
      }
      // Embed fonts as data URIs
      else if (asset.type === 'font' && asset.content?.startsWith('data:')) {
        rewrittenHtml = rewrittenHtml.replace(regex, asset.content);
        embedded++;
      }
      // For CSS and JS, we need to inline them differently
      // Keep original URLs for now - will be inlined in separate step
      else {
        replaced++;
      }
    }

    console.log(`rewriteHtmlWithLocalPaths: Embedded ${embedded} assets as data URIs, ${replaced} assets kept as URLs`);
    loggingService.debug('clone', `Rewrote HTML with ${assets.length} local paths`);
    return rewrittenHtml;
  }

  private calculateTotalSize(assets: ClonedAsset[]): number {
    return assets.reduce((total, asset) => total + asset.size, 0);
  }

  async saveProject(project: CloneProject): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare metadata with embedded detection/analysis data
      const metadataWithAnalysis = {
        ...(project.metadata || {}),
        detection: project.detection || null,
        seoAnalysis: project.seoAnalysis || null,
        securityScan: project.securityScan || null,
        technologyStack: project.technologyStack || null,
      };

      const { error } = await supabase
        .from('projects')
        .upsert({
          id: project.id,
          user_id: user.id,
          source: project.source,
          type: project.type,
          status: project.status,
          progress: project.progress,
          current_step: project.currentStep,
          original_html: project.originalHtml,
          optimized_html: project.optimizedHtml,
          original_score: project.originalScore,
          optimized_score: project.optimizedScore,
          metrics: project.metrics || {},
          assets: project.assets || [],
          metadata: metadataWithAnalysis,
          created_at: project.createdAt.toISOString(),
        });

      if (error) throw error;
      loggingService.info('clone', `Saved project ${project.id} to database`);
    } catch (error) {
      loggingService.error('clone', 'Failed to save project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getProject(id: string): Promise<CloneProject | null> {
    const cached = this.projects.get(id);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const project = this.mapDatabaseToProject(data);
      this.projects.set(id, project);
      return project;
    } catch (error) {
      loggingService.error('clone', 'Failed to get project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getAllProjects(): Promise<CloneProject[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = (data || []).map(row => this.mapDatabaseToProject(row));
      projects.forEach(project => this.projects.set(project.id, project));
      return projects;
    } catch (error) {
      loggingService.error('clone', 'Failed to get all projects', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return Array.from(this.projects.values());
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.projects.delete(id);
      loggingService.info('clone', `Deleted project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to delete project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async archiveProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;

      const project = this.projects.get(id);
      if (project) {
        project.archived = true;
        this.projects.set(id, project);
      }

      loggingService.info('clone', `Archived project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to archive project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async unarchiveProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: false })
        .eq('id', id);

      if (error) throw error;

      const project = this.projects.get(id);
      if (project) {
        project.archived = false;
        this.projects.set(id, project);
      }

      loggingService.info('clone', `Unarchived project ${id}`);
      return true;
    } catch (error) {
      loggingService.error('clone', 'Failed to unarchive project', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  private mapDatabaseToProject(row: any): CloneProject {
    // Extract detection/analysis data from metadata (for backward compatibility)
    const metadata = row.metadata || {};

    return {
      id: row.id,
      source: row.source,
      type: row.type,
      status: row.status,
      progress: row.progress,
      currentStep: row.current_step,
      createdAt: new Date(row.created_at),
      originalHtml: row.original_html,
      optimizedHtml: row.optimized_html,
      originalScore: row.original_score,
      optimizedScore: row.optimized_score,
      metrics: row.metrics,
      assets: row.assets,
      archived: row.archived || false,
      metadata: metadata,
      detection: metadata.detection || row.detection || null,
      seoAnalysis: metadata.seoAnalysis || row.seo_analysis || null,
      securityScan: metadata.securityScan || row.security_scan || null,
      technologyStack: metadata.technologyStack || row.technology_stack || null,
    };
  }

  /**
   * Health check for Railway backend Playwright service
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await smartCloneService.healthCheck();
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Smart clone using SmartCloneService (intelligently chooses between WordPress REST API and Playwright)
   */
  async smartClone(url: string, options: { preferREST?: boolean; forcePlaywright?: boolean } = {}) {
    return await smartCloneService.clone(url, options);
  }

  /**
   * Get rendered HTML via Playwright
   */
  async getRenderedHTML(url: string): Promise<string> {
    return await smartCloneService.getRenderedHTML(url);
  }

  /**
   * Take screenshot via Playwright
   */
  async takeScreenshot(url: string, fullPage: boolean = false): Promise<string> {
    return await smartCloneService.takeScreenshot(url, fullPage);
  }

  /**
   * Extract elements with computed styles via Playwright
   */
  async extractElementsWithStyles(url: string): Promise<any[]> {
    return await smartCloneService.extractElements(url);
  }
}

interface ParsedHTML {
  document: Document;
  images: Array<{ src: string; alt: string; width: number; height: number; element: Element }>;
  stylesheets: Array<{ href: string; element: Element }>;
  inlineStyles: Array<{ content: string; element: Element }>;
  scripts: Array<{ src: string; element: Element }>;
  inlineScripts: Array<{ content: string; element: Element }>;
  fonts: Array<{ href: string }>;
  backgroundImages: Array<{ src: string }>;
}

export const cloneService = new CloneService();
