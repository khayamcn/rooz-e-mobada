package com.roozemobada.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        getWindow().getDecorView().setLayoutDirection(android.view.View.LAYOUT_DIRECTION_RTL);
        getWindow().getDecorView().post(() -> configureWebView());
    }
    private void configureWebView() {
        try {
            WebView webView = findWebViewRecursive(getWindow().getDecorView());
            if (webView == null) return;
            WebSettings settings = webView.getSettings();
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setBuiltInZoomControls(true);
            settings.setDisplayZoomControls(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            settings.setAllowFileAccess(false);
            settings.setAllowFileAccessFromFileURLs(false);
            settings.setAllowUniversalAccessFromFileURLs(false);
            settings.setAllowContentAccess(false);
            String ua = settings.getUserAgentString();
            settings.setUserAgentString(ua + " RoozEMobada/3.5.0 (Android)");
            boolean isDebug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
            WebView.setWebContentsDebuggingEnabled(isDebug);
        } catch (Exception e) {}
    }
    private WebView findWebViewRecursive(android.view.View root) {
        if (root instanceof WebView) return (WebView) root;
        if (root instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup) root;
            for (int i = 0; i < group.getChildCount(); i++) {
                WebView found = findWebViewRecursive(group.getChildAt(i));
                if (found != null) return found;
            }
        }
        return null;
    }
}
