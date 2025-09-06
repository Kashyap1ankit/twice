// src/RedirectApp.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const CONFIG = {
  DEV_SERVER_IP: "10.149.34.129", // Replace with your local IP
  DEV_SERVER_PORT: "8081",
  APP_SCHEME: "twice",
  APP_SLUG: "twice-expo",
  BUNDLE_ID: "com.ankur.twice",
  APP_STORE_URL: "https://apps.apple.com/app/your-app-id",
  PLAY_STORE_URL:
    "https://play.google.com/store/apps/details?id=com.ankur.twice",
};

function openApp(routePath: string) {
  const devServerUrl = `http://${CONFIG.DEV_SERVER_IP}:${CONFIG.DEV_SERVER_PORT}`;
  const encodedDevUrl = encodeURIComponent(devServerUrl);

  // Dev deep link (Expo Dev Client)
  const devDeepLink = `exp+${
    CONFIG.APP_SLUG
  }://expo-development-client/?url=${encodedDevUrl}${
    routePath ? "/--/" + routePath : ""
  }`;

  // Prod deep link (published app)
  const prodDeepLink = `${CONFIG.APP_SCHEME}://${routePath}`;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  if (isIOS) {
    window.location.href = devDeepLink;
    setTimeout(() => (window.location.href = prodDeepLink), 1000);
    setTimeout(() => (window.location.href = CONFIG.APP_STORE_URL), 3000);
  } else if (isAndroid) {
    const intentUrl = `intent://${devDeepLink.split("://")[1]}#Intent;scheme=${
      CONFIG.APP_SCHEME
    };S.browser_fallback_url=${encodeURIComponent(CONFIG.PLAY_STORE_URL)};end`;

    try {
      window.location.href = intentUrl;
    } catch {
      window.location.href = devDeepLink;
    }
  } else {
    // Desktop → maybe show "open on phone" message
    console.log("Please open this link on your mobile device");
  }
}

export default function RedirectApp() {
  const { id } = useParams();
  const location = useLocation();
  const [status, setStatus] = useState("Redirecting...");

  console.log("id", id);

  useEffect(() => {
    let routePath = "";

    if (location.pathname === "/") {
      routePath = ""; // index
    } else if (location.pathname.startsWith("/share/")) {
      routePath = `wallet/card/${id}`;
    } else if (location.pathname.startsWith("/forget/")) {
      routePath = `forget/${id}`;
    }

    if (routePath !== undefined) {
      setStatus(`Opening app at /${routePath || "index"}...`);
      openApp(routePath);
    }
  }, [id, location.pathname]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>{status}</h2>
      <p>If the app doesn’t open, please download from your app store.</p>
      <div style={{ marginTop: "20px" }}>
        <a href={CONFIG.APP_STORE_URL} style={{ marginRight: "10px" }}>
          🍎 App Store
        </a>
        <a href={CONFIG.PLAY_STORE_URL}>🤖 Play Store</a>
      </div>
    </div>
  );
}
