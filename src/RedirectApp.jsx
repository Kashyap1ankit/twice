// src/RedirectApp.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const CONFIG = {
  DEV_SERVER_IP: "10.149.34.129", // your local IP
  DEV_SERVER_PORT: "8081",
  APP_SCHEME: "twice", // 👈 should match app.config.js
  APP_SLUG: "twice-expo",
  BUNDLE_ID: "com.ankur.twice",
  APP_STORE_URL: import.meta.env.VITE_PUBLIC_APP_STORE_URL || "",
  PLAY_STORE_URL: import.meta.env.VITE_PUBLIC_PLAY_STORE_URL || "",
};

function openApp(routePath) {
  const devServerUrl = `http://${CONFIG.DEV_SERVER_IP}:${CONFIG.DEV_SERVER_PORT}`;
  const encodedDevUrl = encodeURIComponent(devServerUrl);

  // Dev deep link (Expo Dev Client)
  const devDeepLink = `exp+${
    CONFIG.APP_SLUG
  }://expo-development-client/?url=${encodedDevUrl}${
    routePath ? "/--/" + routePath : ""
  }`;

  const appLink = `${CONFIG.APP_SCHEME}://${routePath}`;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  if (import.meta.env.MODE === "development") {
    // 👉 Always open Dev Client in dev mode
    window.location.href = devDeepLink;
    return;
  }

  // 🚀 Production
  if (isIOS) {
    window.location.href = appLink;
    setTimeout(() => (window.location.href = CONFIG.APP_STORE_URL), 3000);
  } else if (isAndroid) {
    const intentUrl = `intent://${routePath}#Intent;scheme=${
      CONFIG.APP_SCHEME
    };package=${CONFIG.BUNDLE_ID};S.browser_fallback_url=${encodeURIComponent(
      CONFIG.PLAY_STORE_URL
    )};end`;

    try {
      window.location.href = intentUrl;
    } catch {
      window.location.href = CONFIG.PLAY_STORE_URL;
    }
  } else {
    console.log("Open this link on your mobile device");
  }
}

export default function RedirectApp() {
  const { id } = useParams();
  const location = useLocation();
  const [status, setStatus] = useState("Redirecting...");

  useEffect(() => {
    let routePath = "";

    if (location.pathname === "/") {
      routePath = ""; // index
    } else if (location.pathname.startsWith("/share/")) {
      routePath = `explore/card/${id}`;
    }

    setStatus(`Opening app at /${routePath || "index"}...`);
    openApp(routePath);
  }, [id, location.pathname]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>{status}</h2>
      <p>
        If the app doesn&apos;t open, make sure it&apos;s installed or use the
        links below.
      </p>

      {/* Store links (visible in production) */}
      {import.meta.env.MODE === "production" && (
        <div style={{ marginTop: "20px" }}>
          <a href={CONFIG.APP_STORE_URL} style={{ marginRight: "10px" }}>
            App Store
          </a>
          <a href={CONFIG.PLAY_STORE_URL}> Play Store</a>
        </div>
      )}
    </div>
  );
}
