import { DetectionResult, DetectedComponent } from '../detection/ComponentDetector';

interface Project {
  name: string;
  url: string;
  html: string;
  detection?: DetectionResult;
}

export class WXRExporter {
  public generateWXR(project: Project): string {
    const components = project.detection?.components || [];
    const filteredComponents = components.filter(c => c.metadata.confidence > 0.8);

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
    <title>${this.escapeXML(project.name)}</title>
    <link>${this.escapeXML(project.url)}</link>
    <description>Cloned website content</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <language>en-US</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>${this.escapeXML(project.url)}</wp:base_site_url>
    <wp:base_blog_url>${this.escapeXML(project.url)}</wp:base_blog_url>

    ${this.generatePages(project, filteredComponents)}
</channel>
</rss>`;
  }

  private generatePages(project: Project, components: DetectedComponent[]): string {
    const mainPage = `
    <item>
        <title>${this.escapeXML(project.name)} - Home</title>
        <link>${this.escapeXML(project.url)}</link>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <dc:creator><![CDATA[admin]]></dc:creator>
        <guid isPermaLink="false">${this.escapeXML(project.url)}</guid>
        <description></description>
        <content:encoded><![CDATA[${project.html}]]></content:encoded>
        <excerpt:encoded><![CDATA[]]></excerpt:encoded>
        <wp:post_id>1</wp:post_id>
        <wp:post_date><![CDATA[${new Date().toISOString().slice(0, 19).replace('T', ' ')}]]></wp:post_date>
        <wp:post_date_gmt><![CDATA[${new Date().toISOString().slice(0, 19).replace('T', ' ')}]]></wp:post_date_gmt>
        <wp:comment_status><![CDATA[open]]></wp:comment_status>
        <wp:ping_status><![CDATA[open]]></wp:ping_status>
        <wp:post_name><![CDATA[home]]></wp:post_name>
        <wp:status><![CDATA[publish]]></wp:status>
        <wp:post_parent>0</wp:post_parent>
        <wp:menu_order>0</wp:menu_order>
        <wp:post_type><![CDATA[page]]></wp:post_type>
        <wp:post_password><![CDATA[]]></wp:post_password>
        <wp:is_sticky>0</wp:is_sticky>
        <wp:postmeta>
            <wp:meta_key><![CDATA[_wp_page_template]]></wp:meta_key>
            <wp:meta_value><![CDATA[default]]></wp:meta_value>
        </wp:postmeta>
    </item>`;

    // Component pages (as drafts)
    const componentPages = components.map((comp, index) => `
    <item>
        <title>${this.escapeXML(project.name)} - ${this.capitalize(comp.type)} ${index + 1}</title>
        <link>${this.escapeXML(project.url)}/${comp.type}-${index + 1}</link>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <dc:creator><![CDATA[admin]]></dc:creator>
        <guid isPermaLink="false">${this.escapeXML(project.url)}/${comp.type}-${index + 1}</guid>
        <description></description>
        <content:encoded><![CDATA[${comp.html}]]></content:encoded>
        <excerpt:encoded><![CDATA[]]></excerpt:encoded>
        <wp:post_id>${index + 2}</wp:post_id>
        <wp:post_date><![CDATA[${new Date().toISOString().slice(0, 19).replace('T', ' ')}]]></wp:post_date>
        <wp:post_date_gmt><![CDATA[${new Date().toISOString().slice(0, 19).replace('T', ' ')}]]></wp:post_date_gmt>
        <wp:comment_status><![CDATA[open]]></wp:comment_status>
        <wp:ping_status><![CDATA[open]]></wp:ping_status>
        <wp:post_name><![CDATA[${comp.type}-${index + 1}]]></wp:post_name>
        <wp:status><![CDATA[draft]]></wp:status>
        <wp:post_parent>0</wp:post_parent>
        <wp:menu_order>0</wp:menu_order>
        <wp:post_type><![CDATA[page]]></wp:post_type>
        <wp:post_password><![CDATA[]]></wp:post_password>
        <wp:is_sticky>0</wp:is_sticky>
        <wp:postmeta>
            <wp:meta_key><![CDATA[_component_type]]></wp:meta_key>
            <wp:meta_value><![CDATA[${comp.type}]]></wp:meta_value>
        </wp:postmeta>
        <wp:postmeta>
            <wp:meta_key><![CDATA[_component_builder]]></wp:meta_key>
            <wp:meta_value><![CDATA[${comp.builder || 'none'}]]></wp:meta_value>
        </wp:postmeta>
        <wp:postmeta>
            <wp:meta_key><![CDATA[_component_confidence]]></wp:meta_key>
            <wp:meta_value><![CDATA[${comp.metadata.confidence}]]></wp:meta_value>
        </wp:postmeta>
        <wp:postmeta>
            <wp:meta_key><![CDATA[_wp_page_template]]></wp:meta_key>
            <wp:meta_value><![CDATA[default]]></wp:meta_value>
        </wp:postmeta>
    </item>`);

    return mainPage + componentPages.join('\n');
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
