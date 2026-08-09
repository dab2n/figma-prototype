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
import androidx.core.view.WindowCompat

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
            }
            // Keep every link inside the app; the prototype is one origin.
            webViewClient = WebViewClient()
        }
        setContentView(web)

        if (savedInstanceState == null) web.loadUrl(START_URL)

        // Back walks the prototype's own history before it leaves.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        this.web = web
    }

    private var web: WebView? = null

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
        const val START_URL = "https://dab2n.github.io/figma-prototype/flows.html"
    }
}
