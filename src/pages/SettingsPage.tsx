import { useState } from 'react';
import { User, Lock, Bell, Database, Code, Workflow, Save, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'preferences' | 'notifications'>('profile');
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    displayName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
  });

  // API settings
  const [apiSettings, setApiSettings] = useState({
    ghlApiKey: '',
    ghlLocationId: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    defaultCloneOptions: {
      includeAssets: true,
      useBrowserAutomation: false,
      captureResponsive: true,
    },
    autoOptimize: false,
    darkMode: false,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    analysisComplete: true,
    exportReady: true,
    weeklyReports: false,
  });

  const handleSave = () => {
    // TODO: Save settings to database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Keys', icon: Code },
    { id: 'preferences', label: 'Preferences', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 p-4 h-fit">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lock size={20} />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Workflow size={28} />
                  API Keys & Integrations
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Your API keys are encrypted and securely stored. Never share them publicly.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">GoHighLevel Integration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GHL API Key
                        </label>
                        <input
                          type="password"
                          value={apiSettings.ghlApiKey}
                          onChange={(e) => setApiSettings({ ...apiSettings, ghlApiKey: e.target.value })}
                          placeholder="Enter your GoHighLevel API key"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Get your API key from GoHighLevel Settings → API
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GHL Location ID
                        </label>
                        <input
                          type="text"
                          value={apiSettings.ghlLocationId}
                          onChange={(e) => setApiSettings({ ...apiSettings, ghlLocationId: e.target.value })}
                          placeholder="Enter your Location ID"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Find your Location ID in GoHighLevel Settings → Business Profile
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Integrations</h3>
                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">GitHub</p>
                            <p className="text-sm text-gray-600">Push projects directly to GitHub</p>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Vercel</p>
                            <p className="text-sm text-gray-600">Deploy optimized sites instantly</p>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Clone Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.defaultCloneOptions.includeAssets}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            defaultCloneOptions: {
                              ...preferences.defaultCloneOptions,
                              includeAssets: e.target.checked
                            }
                          })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Include Assets</p>
                          <p className="text-sm text-gray-600">Download images, fonts, and other assets</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.defaultCloneOptions.useBrowserAutomation}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            defaultCloneOptions: {
                              ...preferences.defaultCloneOptions,
                              useBrowserAutomation: e.target.checked
                            }
                          })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Use Browser Automation</p>
                          <p className="text-sm text-gray-600">Capture dynamic content with Playwright</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.defaultCloneOptions.captureResponsive}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            defaultCloneOptions: {
                              ...preferences.defaultCloneOptions,
                              captureResponsive: e.target.checked
                            }
                          })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Capture Responsive Styles</p>
                          <p className="text-sm text-gray-600">Include mobile and tablet breakpoints</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.autoOptimize}
                          onChange={(e) => setPreferences({ ...preferences, autoOptimize: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Auto-Optimize</p>
                          <p className="text-sm text-gray-600">Automatically apply optimizations after cloning</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.darkMode}
                          onChange={(e) => setPreferences({ ...preferences, darkMode: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Dark Mode</p>
                          <p className="text-sm text-gray-600">Use dark theme for the interface</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Enable Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive important updates via email</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.analysisComplete}
                          onChange={(e) => setNotifications({ ...notifications, analysisComplete: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Analysis Complete</p>
                          <p className="text-sm text-gray-600">Notify when website analysis finishes</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.exportReady}
                          onChange={(e) => setNotifications({ ...notifications, exportReady: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Export Ready</p>
                          <p className="text-sm text-gray-600">Notify when export is ready to download</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyReports}
                          onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Weekly Reports</p>
                          <p className="text-sm text-gray-600">Receive weekly summary of your activity</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-end gap-4">
              {saved && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check size={20} />
                  <span className="font-medium">Settings saved!</span>
                </div>
              )}
              <Button onClick={handleSave} size="lg">
                <Save size={18} className="mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
