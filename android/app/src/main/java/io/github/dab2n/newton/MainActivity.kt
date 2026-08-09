package io.github.dab2n.newton

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import android.webkit.JavascriptInterface
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * The prototype, edge to edge, with the phone's own bars left alone.
 *
 * Why this exists at all: as an installed PWA the same page lands differently on different
 * Androids. On 15 the system hands the app the whole screen and the page draws under both
 * bars. On 14 and earlier it does not — Chrome keeps the navigation strip to itself and
 * paints it, which is the white band under the navbar that no CSS could reach, because it
 * was never part of the page. Fullscreen would take the strip back but it also takes the
 * bars away, which is not what is wanted.
 *
 * A WebView can ask for edge to edge on any version. enableEdgeToEdge() sets
 * decorFitsSystemWindows(false) and makes both bars transparent; the page then draws behind
 * them and its own viewport-fit=cover picks up the insets it needs. The bars themselves stay
 * exactly as Android drew them: one real clock at the top, one real gesture handle at the
 * bottom, and nothing of ours pretending to be either.
 */
class MainActivity : AppCompatActivity() {

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Before super/setContentView, so the first frame is already edge to edge and the
        // page never lays out once against the inset box and then again without it.
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT),
        )
        super.onCreate(savedInstanceState)

        // Belt for the transparency. Android scrims a transparent bar by itself when it
        // thinks the content behind it needs the contrast — that scrim IS the grey band, so
        // it is turned off and the page's own colour is what shows through.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
            window.isStatusBarContrastEnforced = false
        }
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val web = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
            // The frame paints its own ground on every screen; black behind it means a
            // repaint never flashes white.
            setBackgroundColor(Color.BLACK)
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                // The hero clips and the pack feed are muted and inline — without this the
                // WebView refuses to start any of them until something is tapped.
                mediaPlaybackRequiresUserGesture = false
                loadWithOverviewMode = false
                useWideViewPort = true
                cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
                // The page decides between two layouts from display-mode, and inside a
                // WebView that reads `browser` — which would put the framed mockup on a
                // white page inside the app. A marker on the user agent is what tells it
                // otherwise, and unlike a query parameter it survives every navigation.
                userAgentString = userAgentString + " NewtonShell"
            }
            // Keep every link inside the app; the prototype is one origin.
            webViewClient = object : WebViewClient() {
                /** The URL we just re-issued ourselves, so we don't re-issue it again. */
                private var reissued: String? = null

                // Every asset carries ?v=<build>, so those can cache forever — but the HTML
                // documents have no such marker and the host hands them a ten minute
                // max-age. That is ten minutes in which a page that has already been
                // replaced keeps being shown. Asking for a revalidation costs one 304 and
                // nothing else: the assets behind it still come from cache.
                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: android.webkit.WebResourceRequest,
                ): Boolean {
                    val url = request.url.toString()
                    if (!request.isForMainFrame || url == reissued || !url.startsWith(SITE)) {
                        reissued = null
                        return false
                    }
                    reissued = url
                    view.loadUrl(url, mapOf("Cache-Control" to "no-cache"))
                    return true
                }

                override fun onPageStarted(view: WebView, url: String, favicon: android.graphics.Bitmap?) {
                    reissued = null
                }

                // Every load wipes the inset properties with the document, so they are
                // re-sent when one lands.
                override fun onPageFinished(view: WebView, url: String) {
                    ViewCompat.requestApplyInsets(view)
                }
            }
        }
        setContentView(web)

        // Two jobs, one listener.
        //
        // Nothing may CONSUME the bar insets on the way down: a view that eats them is a
        // window that has quietly stopped drawing behind the bars — the same failure this
        // wrapper exists to avoid, by another route. They are returned untouched, so the
        // WebView stays the full height of the window.
        //
        // And a WebView's env(safe-area-inset-*) reports the display CUTOUT only; the system
        // bars are not in it. That is why the app bar came to rest under the clock with none
        // of the room the design leaves for it — the padding resolved to 0. The shell
        // measures the bars itself and hands them to the page as --sat/--sab, which the CSS
        // prefers over env(). In a browser they are unset and env() answers as it always did.
        ViewCompat.setOnApplyWindowInsetsListener(web) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val cut = insets.getInsets(WindowInsetsCompat.Type.displayCutout())
            val d = resources.displayMetrics.density
            val top = (maxOf(sys.top, cut.top) / d).toInt()
            val bottom = (maxOf(sys.bottom, cut.bottom) / d).toInt()
            barTop = top
            barBottom = bottom
            (v as WebView).evaluateJavascript(
                "document.documentElement.style.setProperty('--sat','${top}px');" +
                "document.documentElement.style.setProperty('--sab','${bottom}px');",
                null,
            )
            insets
        }

        // The bars are transparent, so what is behind them is the page — and the system's
        // own glyphs have to stay readable against it. The navbar is black on every screen,
        // so its handle is light and stays light. The top changes per screen, and the page
        // is the only thing that knows: it calls back with its own theme-color's lightness.
        val bars = WindowInsetsControllerCompat(window, web)
        bars.isAppearanceLightNavigationBars = false
        // A bridge object is in place before any of a document's own scripts run, which is
        // the whole point of insetTop/insetBottom: the page reads the bars synchronously in
        // its <head> and lays out right the first time. Pushing them after the load instead
        // is what made the app bar sit on the clock for a moment on every tab change.
        web.addJavascriptInterface(object {
            @JavascriptInterface
            fun topIsLight(light: Boolean) {
                runOnUiThread { bars.isAppearanceLightStatusBars = light }
            }

            @JavascriptInterface
            fun insetTop(): Int = barTop

            @JavascriptInterface
            fun insetBottom(): Int = barBottom
        }, "NewtonShell")

        // Same revalidation as every navigation below — a cold start is exactly when the
        // page is most likely to have been replaced since it was last looked at.
        if (savedInstanceState == null) web.loadUrl(START_URL, mapOf("Cache-Control" to "no-cache"))

        // Back walks the prototype's own history before it leaves.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        this.web = web
    }

    private var web: WebView? = null

    /** Last measured system bars, in CSS px. The page reads these before it paints, off
     *  the bridge thread — hence volatile. */
    @Volatile private var barTop = 0
    @Volatile private var barBottom = 0

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        web?.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        web?.restoreState(savedInstanceState)
    }

    companion object {
        /** Point this at a build to try; the prototype is a static site, so any host does. */
        const val SITE = "https://dab2n.github.io/figma-prototype/"
        const val START_URL = SITE + "flows.html"
    }
}
