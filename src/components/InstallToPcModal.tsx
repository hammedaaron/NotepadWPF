import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  Zap, 
  FileCode, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Laptop,
  HelpCircle,
  Clock,
  Key,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { PwaInstallInfo } from '../hooks/usePwaInstall';
import { 
  downloadWindowsDesktopShortcutScript, 
  downloadWindowsBatchLauncher, 
  downloadPortableOfflinePackage,
  downloadWindowsCertificateHelperScript
} from '../utils/pcDesktopInstaller';

interface InstallToPcModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  pwaInfo: PwaInstallInfo;
}

export const InstallToPcModal: React.FC<InstallToPcModalProps> = ({
  isOpen,
  onClose,
  isDark,
  pwaInfo
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'certificate' | 'shortcut' | 'portable' | 'guide'>('direct');
  const [customAppUrl, setCustomAppUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // If running inside dev environment, suggest the origin or default
      return window.location.origin;
    }
    return 'https://notepad-wpf.vercel.app';
  });
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotice = (text: string) => {
    setDownloadedNotice(text);
    setTimeout(() => setDownloadedNotice(null), 3500);
  };

  const handlePromptInstall = async () => {
    const installed = await pwaInfo.promptInstall();
    if (installed) {
      showNotice('Installation initiated!');
    }
  };

  const handleDownloadShortcut = () => {
    downloadWindowsDesktopShortcutScript(customAppUrl);
    showNotice('Downloaded Install-Notepad-XR-Desktop.bat');
  };

  const handleDownloadLauncher = () => {
    downloadWindowsBatchLauncher(customAppUrl);
    showNotice('Downloaded Launch-NotepadXR.bat');
  };

  const handleDownloadCertificateScript = () => {
    downloadWindowsCertificateHelperScript();
    showNotice('Downloaded Trust-NotepadXR-Certificate.bat');
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadPortableOfflinePackage(customAppUrl);
      showNotice('Downloaded Notepad-XR-Windows-Portable.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const isDevUrl = customAppUrl.includes('ais-dev-') || customAppUrl.includes('run.app');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all ${
          isDark 
            ? 'bg-[#1f1f22] border-[#38383c] text-[#f0f0f3]' 
            : 'bg-white border-[#d8d8de] text-[#1a1a1e]'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between select-none ${
          isDark ? 'border-[#2d2d30] bg-[#1a1a1c]' : 'border-[#e8e8ec] bg-[#f8f8fa]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm ${
              isDark 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                : 'bg-blue-100 border border-blue-200 text-blue-700'
            }`}>
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Install Notepad-XR to PC</h2>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Windows Trusted
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8e8e93]' : 'text-[#6e6e73]'}`}>
                Direct desktop installation, Windows certificate trust & offline tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#2d2d30] text-[#8e8e93] hover:text-white' : 'hover:bg-[#ebebee] text-[#6e6e73] hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b px-6 pt-2 gap-2 text-xs font-medium select-none overflow-x-auto no-scrollbar ${
          isDark ? 'border-[#2d2d30] bg-[#18181a]' : 'border-[#e8e8ec] bg-[#f4f4f7]'
        }`}>
          {[
            { id: 'direct', label: '1-Click Direct Install', icon: Zap },
            { id: 'certificate', label: 'Windows Certificate Trust (.bat)', icon: Key },
            { id: 'shortcut', label: 'Desktop Shortcut (.bat)', icon: FileCode },
            { id: 'portable', label: 'Offline Package (.zip)', icon: Package },
            { id: 'guide', label: 'Browser Guide', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-t border-x transition-all whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'bg-[#1f1f22] border-[#38383c] border-b-transparent text-white font-semibold shadow-sm'
                      : 'bg-white border-[#d8d8de] border-b-transparent text-blue-700 font-semibold shadow-sm'
                    : isDark
                    ? 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242428]'
                    : 'border-transparent text-[#6e6e73] hover:text-[#1a1a1e] hover:bg-[#eaecee]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {downloadedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {downloadedNotice}
              </span>
            </div>
          )}

          {/* TAB 1: 1-Click Direct Native Install */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#26262b] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Native Windows 11 Fluent App</h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-[#a1a1a6]' : 'text-[#555]'}`}>
                      Installs Notepad-XR directly to your Windows PC with a standalone borderless window, Windows Start Menu launcher, and Taskbar pinning.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] opacity-80">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline Capable</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> Instant 0-Second Setup</span>
                      <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-400" /> Auto-Updating</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
                  {pwaInfo.isStandalone ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Already Installed & Running as Standalone PC App
                    </div>
                  ) : pwaInfo.canInstall ? (
                    <button
                      onClick={handlePromptInstall}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" /> Install Application to PC Now
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Install directly from your browser menu:</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('guide')}
                        className="px-4 py-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 border border-blue-500/30 text-xs font-medium transition-all cursor-pointer"
                      >
                        View 2-Click Browser Instructions →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Notice regarding AI Studio sandbox vs Public URL */}
              {isDevUrl && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold">Why did opening the external window require AI Studio login?</div>
                    <div className="text-[11.5px] opacity-90 leading-relaxed">
                      The internal development URL (<code className="font-mono text-[10.5px]">ais-dev-...</code>) is a protected private container. To run or install outside the AI Studio editor without login prompts, use the <strong>Shared App URL</strong> or deploy to any custom URL (Vercel / GitHub / Cloud Run).
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-[#242428] border-[#333]' : 'bg-white border-[#e5e7eb]'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5 text-blue-400">
                    <Monitor className="w-3.5 h-3.5" /> Full Window Controls Overlay
                  </div>
                  <p className="opacity-75 text-[11.5px] leading-relaxed">
                    Operates like a native desktop app without browser tabs, bookmarks, or address bars.
                  </p>
                </div>
                <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  isDark ? 'bg-[#242428] border-[#333]' : 'bg-white border-[#e5e7eb]'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Local File Access
                  </div>
                  <p className="opacity-75 text-[11.5px] leading-relaxed">
                    Supports opening `.txt`, `.md`, `.json`, `.docx`, `.pdf` directly from File Explorer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Certificate Trust Helper */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#26262b] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Windows Trusted Certificate Configuration</h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-[#a1a1a6]' : 'text-[#555]'}`}>
                      Windows blocks unsigned `.msix` or `.appx` packages unless the signing certificate is added to the <strong>Trusted People</strong> store. This 1-click script configures Windows to trust Notepad-XR automatically.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/30 text-[11.5px] border border-black/20 dark:border-white/10 space-y-2">
                  <div className="font-semibold text-emerald-400">How to Trust Any PWABuilder / MSIX Certificate in Windows:</div>
                  <ol className="list-decimal list-inside space-y-1 opacity-90 leading-relaxed">
                    <li>Download the 1-click script below: <strong className="text-white">Trust-NotepadXR-Certificate.bat</strong>.</li>
                    <li>Right-click the downloaded file and select <strong>"Run as Administrator"</strong>.</li>
                    <li>Windows will register the certificate in <code className="text-blue-300 font-mono">Cert:\LocalMachine\TrustedPeople</code> and enable sideloading.</li>
                    <li>Now double-click your Notepad-XR `.msix` package — it will install smoothly with <strong>0 certificate errors</strong>!</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadCertificateScript}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download 1-Click Windows Certificate Trust Script (.bat)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Windows Desktop Shortcut Script (.bat) */}
          {activeTab === 'shortcut' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#26262b] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Automated Windows Desktop Shortcut (.bat)</h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-[#a1a1a6]' : 'text-[#555]'}`}>
                      Download a 1-click Windows batch script that automatically builds a native Desktop Shortcut and Start Menu entry for Notepad-XR on Windows 10/11.
                    </p>
                  </div>
                </div>

                {/* Target App URL Input */}
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium opacity-80 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" /> Target App URL (Public Shared or Deployed Domain):
                  </label>
                  <input
                    type="text"
                    value={customAppUrl}
                    onChange={(e) => setCustomAppUrl(e.target.value)}
                    placeholder="https://your-domain.com or Shared URL"
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      isDark ? 'bg-[#18181b] border-[#38383c] text-white' : 'bg-white border-[#ccc] text-black'
                    }`}
                  />
                  <div className="text-[10.5px] opacity-60">
                    Note: If using outside AI Studio, ensure this points to your shared public link or custom deployed domain.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/30 font-mono text-[11px] opacity-85 text-emerald-400 border border-black/20 dark:border-white/10 space-y-1">
                  <div>1. Download <span className="text-white font-bold">Install-Notepad-XR-Desktop.bat</span></div>
                  <div>2. Double-click the file to run it</div>
                  <div>3. Instantly launches Notepad-XR in an isolated 1280x820 desktop window</div>
                </div>

                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  <button
                    onClick={handleDownloadShortcut}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Windows Desktop Installer (.bat)
                  </button>
                  <button
                    onClick={handleDownloadLauncher}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isDark 
                        ? 'border-[#444] hover:bg-[#333] text-[#ddd]' 
                        : 'border-[#ccc] hover:bg-[#eee] text-[#333]'
                    }`}
                  >
                    Download Simple Launcher (.bat)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Portable Offline ZIP Package */}
          {activeTab === 'portable' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#26262b] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Portable Standalone Package (.zip)</h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-[#a1a1a6]' : 'text-[#555]'}`}>
                      A complete zip bundle containing executable launch scripts and portable configuration. Unzip anywhere (USB drive, Desktop, Documents) and run with zero setup.
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  isDark ? 'bg-[#1e1e22] border-[#333]' : 'bg-white border-[#e5e7eb]'
                }`}>
                  <div className="font-medium">Inside the ZIP Archive:</div>
                  <ul className="list-disc list-inside text-[11.5px] opacity-80 space-y-0.5">
                    <li><span className="font-mono text-blue-400">Launch-NotepadXR.bat</span> — Instant double-click launcher</li>
                    <li><span className="font-mono text-purple-400">Install-Desktop-Shortcut.bat</span> — Creates Windows desktop shortcut</li>
                    <li><span className="font-mono text-emerald-400">README.txt</span> — Instructions & offline guide</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" /> 
                    {isDownloadingZip ? 'Packaging ZIP Archive...' : 'Download Portable Package (.zip)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 2-Click Browser Install Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Edge Instructions */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-[#242428] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
                }`}>
                  <div className="flex items-center gap-2 font-semibold text-xs text-blue-400">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center font-bold text-[10px]">1</span>
                    Microsoft Edge (Recommended for Windows)
                  </div>
                  <ol className="text-xs space-y-2 list-decimal list-inside opacity-85 leading-relaxed">
                    <li>Click the <strong className="font-semibold text-white dark:text-white">...</strong> (Menu) button in Edge top right.</li>
                    <li>Hover over <strong className="font-semibold text-white dark:text-white">Apps</strong>.</li>
                    <li>Click <strong className="font-semibold text-blue-400">"Install this site as an app"</strong>.</li>
                    <li>Check <strong className="font-semibold text-emerald-400">Pin to Taskbar</strong> and <strong className="font-semibold text-emerald-400">Pin to Start</strong>!</li>
                  </ol>
                </div>

                {/* Chrome Instructions */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-[#242428] border-[#38383e]' : 'bg-[#f9fafb] border-[#e5e7eb]'
                }`}>
                  <div className="flex items-center gap-2 font-semibold text-xs text-amber-400">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center font-bold text-[10px]">2</span>
                    Google Chrome / Brave
                  </div>
                  <ol className="text-xs space-y-2 list-decimal list-inside opacity-85 leading-relaxed">
                    <li>Click the <strong className="font-semibold text-white dark:text-white">...</strong> (Menu) icon in top right.</li>
                    <li>Select <strong className="font-semibold text-white dark:text-white">Save and share</strong> (or Cast, save and share).</li>
                    <li>Click <strong className="font-semibold text-amber-400">"Install Notepad-XR..."</strong>.</li>
                    <li>Click <strong className="font-semibold text-emerald-400">Install</strong> in the confirmation box!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs select-none ${
          isDark ? 'border-[#2d2d30] bg-[#1a1a1c]' : 'border-[#e8e8ec] bg-[#f8f8fa]'
        }`}>
          <span className={`opacity-60 flex items-center gap-1.5 text-[11px]`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Offline data stored locally in your browser/OS
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isDark 
                ? 'border-[#444] hover:bg-[#2d2d30] text-[#ccc]' 
                : 'border-[#ccc] hover:bg-[#eaeaea] text-[#444]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
