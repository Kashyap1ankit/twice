// App.tsx - React component for app redirect
import React, { useState, useEffect } from "react";
import "./App.css";

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  // Your development server info (get this from expo start output)
  DEV_SERVER_IP: "10.149.34.129", // Replace with your IP
  DEV_SERVER_PORT: "8081", // Replace with your port

  // App info
  APP_SCHEME: "twice",
  APP_SLUG: "twice-expo",
  BUNDLE_ID: "com.ankur.twice",

  // Store URLs (when you publish)
  APP_STORE_URL: "https://apps.apple.com/app/your-app-id",
  PLAY_STORE_URL:
    "https://play.google.com/store/apps/details?id=com.ankur.twice",
};

const App = () => {
  const [status, setStatus] = useState("Detecting your device...");
  const [showDebug, setShowDebug] = useState(false);
  const [platform, setPlatform] = useState({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: true,
  });

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;
    const isDesktop = !isMobile;

    setPlatform({ isIOS, isAndroid, isMobile, isDesktop });

    // Initialize page based on platform
    if (isDesktop) {
      setStatus("💻 Please open this link on your mobile device");
    } else {
      setStatus("📱 Ready to open the Twice app");

      // Auto-attempt to open app if coming from share link
      const routePath = getRoutePath();
      if (routePath) {
        setTimeout(() => {
          openApp();
        }, 1500);
      }
    }
  }, []);

  // Handle page visibility
  useEffect(() => {
    let appOpenAttempted = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpenAttempted = true;
      } else if (appOpenAttempted) {
        setStatus(
          "🔄 App didn't open? Try the buttons below or check if the app is installed"
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Get route path from current URL
  // Get route path from current URL (maps web path → app path)
  const getRoutePath = () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes("/share/profile/")) {
      const profileId = currentPath.split("/").pop();
      return `wallet/${profileId}`; // ✅ goes to /wallet/123
    } else if (currentPath.includes("/share/forget")) {
      return "forget"; // ✅ goes to /forget
    }
    return ""; // ✅ normal open (index.ts)
  };

  // Open app with a specific route
  const openWithRoute = (routePath) => {
    const devServerUrl = `http://${CONFIG.DEV_SERVER_IP}:${CONFIG.DEV_SERVER_PORT}`;
    const encodedDevUrl = encodeURIComponent(devServerUrl);

    const devDeepLink = `exp+${
      CONFIG.APP_SLUG
    }://expo-development-client/?url=${encodedDevUrl}${
      routePath ? "/--/" + routePath : ""
    }`;

    const prodDeepLink = `${CONFIG.APP_SCHEME}://${routePath}`;

    setStatus(`Opening Twice app at /${routePath || "index"}...`);

    if (platform.isIOS) {
      window.location.href = devDeepLink;

      setTimeout(() => {
        window.location.href = prodDeepLink;
      }, 1000);

      setTimeout(() => {
        setStatus("⚠️ App not opening? Try the download button below");
      }, 3000);
    } else if (platform.isAndroid) {
      const intentUrl = `intent://${
        devDeepLink.split("://")[1]
      }#Intent;scheme=exp+${
        CONFIG.APP_SLUG
      };S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

      try {
        window.location.href = intentUrl;
      } catch {
        window.location.href = devDeepLink;
      }

      setTimeout(() => {
        setStatus("⚠️ App not opening? Try the download button below");
      }, 3000);
    }
  };

  // Build deep links
  const buildDeepLinks = () => {
    const routePath = getRoutePath();

    // Development deep link (for dev builds)
    const devServerUrl = `http://${CONFIG.DEV_SERVER_IP}:${CONFIG.DEV_SERVER_PORT}`;
    const encodedDevUrl = encodeURIComponent(devServerUrl);
    const devDeepLink = `exp+${
      CONFIG.APP_SLUG
    }://expo-development-client/?url=${encodedDevUrl}${
      routePath ? "/--/" + routePath : ""
    }`;

    // Production deep link (for published apps)
    const prodDeepLink = `${CONFIG.APP_SCHEME}://${routePath}`;

    return { devDeepLink, prodDeepLink, routePath };
  };

  // Open app function
  const openApp = () => {
    const { devDeepLink, prodDeepLink } = buildDeepLinks();

    setStatus("Opening Twice app...");

    if (platform.isIOS) {
      // iOS: Try dev link first, then production
      window.location.href = devDeepLink;

      setTimeout(() => {
        window.location.href = prodDeepLink;
      }, 1000);

      setTimeout(() => {
        setStatus("⚠️ App not opening? Try the download button below");
      }, 3000);
    } else if (platform.isAndroid) {
      // Android: Create intent with fallback
      const intentUrl = `intent://${
        devDeepLink.split("://")[1]
      }#Intent;scheme=exp+${
        CONFIG.APP_SLUG
      };S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

      try {
        window.location.href = intentUrl;
      } catch {
        window.location.href = devDeepLink;
      }

      setTimeout(() => {
        setStatus("⚠️ App not opening? Try the download button below");
      }, 3000);
    }
  };

  // Copy link to clipboard (for desktop)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("✅ Link copied! Open on your mobile device");
    } catch {
      setStatus("❌ Failed to copy link");
    }
  };

  // Debug info
  const debugInfo = {
    url: window.location.href,
    platform: platform.isIOS
      ? "iOS"
      : platform.isAndroid
      ? "Android"
      : "Desktop",
    userAgent: navigator.userAgent,
    ...buildDeepLinks(),
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Twice App</h1>
        <p className="subtitle">Opening your shared content...</p>

        <div className="status">
          <div className="status-text">
            {status.includes("Opening") && (
              <div
                className="spinner"
                style={{ display: "inline-block", marginRight: "10px" }}
              />
            )}
            {status}
          </div>
        </div>

        <div className="buttons">
          {platform.isMobile && (
            <>
              <button className="btn btn-primary" onClick={openApp}>
                📱 Open Twice App
              </button>

              <button
                className="btn btn-primary"
                onClick={() => openWithRoute("")}
              >
                🏠 Open Index
              </button>

              <button
                className="btn btn-primary"
                onClick={() =>
                  openWithRoute("wallet/3d8a10b4-1ada-48e8-a60f-3f5139a76d45")
                }
              >
                👤 Open Share Profile
              </button>

              <button
                className="btn btn-primary"
                onClick={() => openWithRoute("forget")}
              >
                🔑 Open Forget Password
              </button>
            </>
          )}

          {platform.isDesktop && (
            <button className="btn btn-primary" onClick={copyLink}>
              📋 Copy Link
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => setShowDebug(!showDebug)}
          >
            🔧 Debug Info
          </button>

          {platform.isIOS && (
            <a href={CONFIG.APP_STORE_URL} className="btn btn-secondary">
              🍎 Download from App Store
            </a>
          )}

          {platform.isAndroid && (
            <a href={CONFIG.PLAY_STORE_URL} className="btn btn-secondary">
              🤖 Download from Play Store
            </a>
          )}
        </div>

        {showDebug && (
          <div className="debug-info">
            <div>
              <strong>Debug Information:</strong>
            </div>
            <div>URL: {debugInfo.url}</div>
            <div>Platform: {debugInfo.platform}</div>
            <div>User Agent: {debugInfo.userAgent}</div>
            <div>Deep Link: {debugInfo.prodDeepLink}</div>
            <div>Dev Link: {debugInfo.devDeepLink}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
