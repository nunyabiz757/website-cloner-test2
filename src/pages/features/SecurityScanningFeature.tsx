import { Shield, Check, AlertTriangle, Lock, Eye, Key } from 'lucide-react';
import { FeatureHero } from '../../components/features/FeatureHero';
import { FeatureSection } from '../../components/features/FeatureSection';
import { FeatureCTA } from '../../components/features/FeatureCTA';
import { FeatureFAQ } from '../../components/features/FeatureFAQ';
import { Card } from '../../components/ui/Card';

export function SecurityScanningFeature() {
  const faqs = [
    {
      question: 'Does security scanning detect all types of malware and vulnerabilities?',
      answer: 'Our scanner detects common web vulnerabilities including XSS, SQL injection attempts, outdated libraries, insecure configurations, and malware signatures. However, no scanner is 100% comprehensive. We focus on vulnerabilities relevant to cloned websites—malicious scripts, insecure resources, exposed credentials, and common attack vectors. For production environments, complement our scanning with penetration testing and continuous monitoring.',
    },
    {
      question: 'Will security scanning slow down the cloning process?',
      answer: 'Security scanning adds 10-30 seconds to clone time for typical websites. The scan runs in parallel with other post-processing tasks like performance optimization, so the impact on total clone time is minimal. You can disable security scanning if speed is critical, but we recommend keeping it enabled—discovering security issues before deployment prevents costly breaches later.',
    },
    {
      question: 'What happens if malware or security issues are found?',
      answer: 'When security issues are detected, we flag them in the analysis report with severity ratings (Critical, High, Medium, Low). The cloned website is still generated, but you receive detailed warnings about specific issues found. For malicious scripts, we can automatically sanitize or remove them if you enable the "Auto-fix security issues" option. For other vulnerabilities, we provide remediation guidance.',
    },
    {
      question: 'Can I scan existing websites without cloning them?',
      answer: 'Yes. You can run security scanning on any URL without performing a full clone. This is useful for ongoing security monitoring of live websites or pre-migration security assessments. The security scan provides the same comprehensive report as clone-time scanning, identifying vulnerabilities, outdated libraries, and configuration issues.',
    },
    {
      question: 'Does the scanner comply with security standards like OWASP?',
      answer: 'Yes. Our scanner is based on OWASP (Open Web Application Security Project) guidelines, specifically checking for OWASP Top 10 vulnerabilities. We test for injection flaws, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, cross-site scripting, insecure deserialization, using components with known vulnerabilities, and insufficient logging.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <FeatureHero
        icon={Shield}
        title="Security Scanning & Vulnerability Detection"
        description="Comprehensive security analysis for cloned websites. Detect malware, vulnerabilities, and security misconfigurations before deployment."
        gradient="from-red-600 to-pink-600"
      />

      <FeatureSection title="Why Security Scanning is Critical for Web Cloning">
        <p className="text-lg leading-relaxed mb-6">
          Website security is not optional—it's a fundamental requirement for protecting user data, maintaining trust, and avoiding costly breaches. When cloning websites, security vulnerabilities from the source site can be unknowingly carried over to your cloned version. Malicious scripts, outdated libraries with known exploits, insecure configurations, and hidden backdoors may exist in the original site's code without visible signs.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          The consequences of deploying a compromised website are severe. Data breaches expose customer information, resulting in legal liability under regulations like GDPR and CCPA. Malware infections can steal credentials, inject spam content, or redirect visitors to phishing sites. Google blacklists compromised sites, destroying organic traffic overnight. Recovery from security incidents is expensive—the average cost of a data breach in 2024 is $4.45 million, with small businesses often facing bankruptcy after major breaches.
        </p>
        <p className="text-lg leading-relaxed">
          Our Security Scanning feature performs comprehensive vulnerability assessments on cloned websites, identifying security issues before deployment. We scan for malware, detect outdated libraries with known CVEs (Common Vulnerabilities and Exposures), check for XSS (Cross-Site Scripting) and SQL injection vulnerabilities, verify HTTPS implementation, analyze Content Security Policies, and check for exposed credentials or API keys. Every scan generates a detailed security report with prioritized remediation steps, helping you deliver secure websites to clients.
        </p>
      </FeatureSection>

      <FeatureSection title="How Security Scanning Works" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
          <Card className="p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Eye className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Code Analysis</h3>
            <p className="text-gray-700">
              Every script, stylesheet, and HTML element is analyzed for malicious code patterns. We detect obfuscated JavaScript, base64-encoded payloads, suspicious iframes, and hidden form submissions often used in attacks.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Lock className="text-pink-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Vulnerability Testing</h3>
            <p className="text-gray-700">
              We test for OWASP Top 10 vulnerabilities including XSS, SQL injection, broken authentication, insecure configurations, and sensitive data exposure. Each vulnerability is verified and documented with proof-of-concept examples.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Key className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Dependency Scanning</h3>
            <p className="text-gray-700">
              All third-party libraries, frameworks, and CDN resources are cataloged and checked against vulnerability databases. Outdated libraries with known security issues are flagged with update recommendations.
            </p>
          </Card>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          Security scanning begins immediately after website cloning completes, running as part of the post-processing pipeline. The scan typically takes 30-90 seconds for average websites and 2-5 minutes for large sites with complex codebases. Scanning happens in parallel with other analysis tasks like SEO auditing and performance optimization, minimizing impact on total processing time.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Our scanning engine uses multiple detection methods to identify security issues. Static code analysis examines JavaScript, HTML, and CSS for suspicious patterns—obfuscated code using tools like JavaScript Obfuscator, eval() statements that execute arbitrary code, base64-encoded strings that might hide malicious payloads, and external script sources from unknown domains. Dynamic analysis simulates user interactions to detect runtime vulnerabilities like DOM-based XSS that only manifest during execution.
        </p>
        <p className="text-lg leading-relaxed">
          Dependency scanning is critical because third-party libraries represent the majority of code in modern websites. We extract all JavaScript libraries from script tags and inline code, identify library names and versions using signature matching, and query vulnerability databases including the National Vulnerability Database (NVD), Snyk vulnerability database, and npm security advisories. When vulnerable libraries are found, we provide specific version recommendations for safe alternatives and assess exploitability based on how the library is used in your specific context.
        </p>
      </FeatureSection>

      <FeatureSection title="Key Security Issues We Detect">
        <p className="text-lg leading-relaxed mb-6">
          Our security scanner checks for dozens of vulnerability types. Here are the most critical categories and what we look for in each:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-red-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Malware & Malicious Scripts</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Malware comes in many forms on websites. We detect cryptominers (scripts that hijack CPU to mine cryptocurrency), keyloggers (capturing user input including passwords), form hijackers (stealing credit card data), SEO spam injectors (hidden links to boost spam sites), and redirect malware (sending users to phishing sites). Common malware patterns include suspicious iframes loading external content, JavaScript making unauthorized network requests, hidden form submissions to attacker-controlled servers, and obfuscated code designed to hide malicious intent. If malware is detected, we provide detailed analysis of what the malicious code does and recommend removal steps.
            </p>
          </div>

          <div className="border-l-4 border-orange-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Cross-Site Scripting (XSS) Vulnerabilities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              XSS vulnerabilities allow attackers to inject malicious scripts into your website, potentially stealing user sessions, defacing content, or redirecting users. We test for reflected XSS (malicious scripts in URL parameters), stored XSS (malicious content saved to databases), and DOM-based XSS (client-side code vulnerabilities). Our scanner identifies unescaped user input in HTML output, missing Content Security Policy headers, innerHTML usage with untrusted data, and dangerouslySetInnerHTML in React applications. Each XSS vulnerability is verified with proof-of-concept payloads and rated by severity based on attack surface and potential impact.
            </p>
          </div>

          <div className="border-l-4 border-yellow-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Insecure Dependencies & Outdated Libraries</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Using outdated JavaScript libraries is one of the most common security mistakes. Libraries like jQuery, Bootstrap, Angular, React, and countless npm packages frequently have security updates. We identify every third-party library in your cloned site, determine exact versions, and cross-reference against CVE databases. For example, jQuery versions before 3.5.0 have XSS vulnerabilities. Lodash versions before 4.17.21 have prototype pollution issues. Moment.js is no longer maintained and should be replaced with alternatives. For each vulnerable library, we provide the CVE identifier, vulnerability description, exploitability assessment, and recommended safe version.
            </p>
          </div>

          <div className="border-l-4 border-purple-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">HTTPS & SSL/TLS Configuration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Proper HTTPS implementation is mandatory for website security. We verify SSL/TLS certificates are valid and not expired, check certificate chain completeness, test for mixed content issues (HTTPS pages loading HTTP resources), verify HSTS (HTTP Strict Transport Security) headers are configured, and ensure secure protocol versions (TLS 1.2 or 1.3) are used. Mixed content is particularly problematic—browsers block or warn about HTTPS pages loading images, scripts, or stylesheets over HTTP. Our scanner identifies every insecure resource and provides HTTPS alternatives.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Content Security Policy (CSP) Analysis</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Content Security Policy headers tell browsers which resources are allowed to load, providing defense-in-depth against XSS attacks. We analyze existing CSP headers for weaknesses—overly permissive policies allowing 'unsafe-inline' or 'unsafe-eval', missing CSP headers entirely, and policies that don't cover all resource types. A strong CSP significantly reduces XSS risk even if vulnerabilities exist in your code. We provide recommended CSP configurations tailored to your specific site's resource requirements, balancing security and functionality.
            </p>
          </div>

          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Exposed Credentials & API Keys</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Developers sometimes accidentally commit API keys, passwords, or secrets to code. We scan JavaScript files for common credential patterns—AWS access keys, Google API keys, Stripe secret keys, database connection strings, JWT secrets, and OAuth tokens. We use regex patterns matching known key formats and entropy analysis to detect high-entropy strings that might be secrets. Exposed credentials should be rotated immediately and removed from code. We recommend using environment variables and secure secret management services instead of hardcoding credentials.
            </p>
          </div>

          <div className="border-l-4 border-teal-600 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Security Headers & Browser Protections</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Modern browsers offer security features activated by HTTP headers. We check for X-Frame-Options (prevents clickjacking attacks), X-Content-Type-Options (prevents MIME-sniffing attacks), Referrer-Policy (controls referrer information leakage), Permissions-Policy (restricts browser feature access), and X-XSS-Protection (legacy XSS protection for older browsers). Missing security headers leave websites vulnerable to attacks that are trivial to prevent. We provide recommended header configurations with explanations of what each header protects against.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Security Report & Remediation Guidance" className="bg-gray-50">
        <p className="text-lg leading-relaxed mb-6">
          After scanning completes, you receive a comprehensive security report categorizing all findings by severity and providing clear remediation steps. The report is designed for both technical developers and non-technical stakeholders:
        </p>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Security Score & Risk Assessment</h3>
              <p className="text-gray-700 leading-relaxed">
                A single 0-100 security score summarizes overall security posture. Scores are calculated by weighting vulnerabilities by severity—critical issues like exposed API keys or active malware heavily impact the score, while informational findings like missing security headers have minor impact. Scores help communicate security status to non-technical clients and track improvement over time. Scores above 80 indicate good security. Scores below 50 indicate serious vulnerabilities requiring immediate remediation.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Severity Classification</h3>
              <p className="text-gray-700 leading-relaxed">
                Every vulnerability is classified as Critical (immediate action required), High (fix within 7 days), Medium (fix within 30 days), Low (fix when convenient), or Informational (best practice recommendations). Critical issues include active malware, exposed credentials, and easily exploitable XSS vulnerabilities. High severity includes outdated libraries with known exploits and missing HTTPS. Medium severity includes weak CSP policies and informational security headers. This prioritization helps teams focus on highest-impact fixes first.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Step-by-Step Remediation</h3>
              <p className="text-gray-700 leading-relaxed">
                Each vulnerability includes detailed remediation guidance—specific code changes needed, recommended library versions, configuration adjustments, and best practices to prevent recurrence. For example, an XSS vulnerability report might show the exact line of vulnerable code, explain why it's vulnerable, provide sanitized code as a replacement, and link to OWASP documentation for further reading. This actionable guidance enables even junior developers to fix security issues correctly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Check className="text-green-600 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compliance Checking</h3>
              <p className="text-gray-700 leading-relaxed">
                For clients in regulated industries, we map security findings to compliance frameworks including GDPR (data protection), PCI-DSS (payment card security), HIPAA (healthcare data), and SOC 2 (service organization controls). The report highlights which vulnerabilities create compliance violations, helping you prioritize fixes that address regulatory requirements. This is particularly valuable for agencies serving healthcare, finance, or e-commerce clients where compliance is legally mandated.
              </p>
            </div>
          </div>
        </div>
      </FeatureSection>

      <FeatureSection title="Real-World Security Incident Prevention">
        <p className="text-lg leading-relaxed mb-6">
          Security scanning has prevented serious incidents for agencies and clients. Here are real scenarios where vulnerability detection avoided costly breaches:
        </p>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">E-Commerce Site Malware Detection</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              An agency cloned an e-commerce site for platform migration. Security scanning detected obfuscated JavaScript in the footer that was exfiltrating form data to an attacker-controlled server. The malware specifically targeted checkout forms, capturing credit card numbers, CVV codes, and customer addresses. The original site owner was unaware of the compromise—the malware had been present for 6 weeks.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The security report flagged this as a Critical vulnerability with detailed analysis of the malicious code. The agency removed the malware from the cloned site and notified the original site owner. Investigation revealed the malware was injected through a compromised WordPress plugin. Had the agency deployed the clone without security scanning, they would have migrated the malware to the new platform, potentially making them liable for compromised customer data. The detection saved the client from a PCI-DSS violation and potential credit card fraud liability.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Exposed API Key Discovery</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A SaaS company cloned their marketing site, which included integration with various third-party services. Security scanning detected an AWS access key hardcoded in a JavaScript file used for uploading user avatars to S3 storage. The key had broad permissions including s3:DeleteBucket and ec2:TerminateInstances, far exceeding what the feature required.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The security report classified this as Critical—exposed AWS keys are frequently exploited by automated scanners minutes after exposure. The agency immediately rotated the exposed key, implemented proper IAM roles with least-privilege permissions, and moved credentials to server-side code instead of client-side JavaScript. Without detection, the exposed key could have resulted in AWS resource abuse, data breaches, and hosting bills potentially reaching tens of thousands of dollars from cryptocurrency mining on hijacked EC2 instances.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Vulnerable Library Exploitation Prevention</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A news publisher migrated their website using our cloning tool. Security scanning identified jQuery 1.11.3, which had known XSS vulnerabilities (CVE-2015-9251) allowing attackers to inject malicious scripts through crafted HTML attributes. The site had public comment sections, making the XSS vulnerability actively exploitable by any commenter posting malicious HTML.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The agency upgraded jQuery to version 3.6.0, which included fixes for all known vulnerabilities. They also implemented Content Security Policy headers as defense-in-depth. Two weeks after launch, server logs showed multiple attempts to exploit jQuery XSS vulnerabilities—exactly the attack vector that had been patched. The CSP headers blocked these attempts. Without security scanning and remediation, the site would likely have been compromised, potentially being used to serve malware to readers or redirect to phishing sites.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Healthcare HIPAA Compliance</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              A healthcare provider cloned their patient portal for redesign. Security scanning revealed multiple HIPAA compliance violations—no HTTPS enforcement (allowing patient data transmission over unencrypted HTTP), missing security headers, and session cookies without Secure and HttpOnly flags. These issues created serious privacy risks for Protected Health Information (PHI).
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              The security report mapped findings to specific HIPAA requirements, demonstrating non-compliance with the Security Rule's encryption standards (§164.312(e)(1)). The agency implemented HTTPS with HSTS headers, added all recommended security headers, configured secure session management, and documented changes for HIPAA audit compliance. The healthcare provider avoided a potential OCR (Office for Civil Rights) violation, which carries penalties of $100 to $50,000 per violation with annual maximum of $1.5 million. More importantly, patient privacy was protected through proper security controls.
            </p>
          </div>
        </div>
      </FeatureSection>

      <FeatureFAQ faqs={faqs} />

      <FeatureCTA
        title="Start Scanning for Security Vulnerabilities"
        description="Join agencies using our security scanning to deliver safer websites and protect clients from breaches."
      />
    </div>
  );
}
