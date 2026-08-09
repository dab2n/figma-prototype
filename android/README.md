# NEWTON — Android wrapper

A WebView that loads the prototype and asks Android for edge to edge on **every** version,
so an S23 lands the same way an S25 does.

## Why it exists

As an installed PWA the same page lands differently on different Androids:

| | status strip | gesture strip |
|---|---|---|
| Android 15 (S25) | the app draws under it | the app draws under it |
| Android 14 and earlier (S23) | Chrome keeps it | **Chrome keeps it, and paints it** |

That painted strip is the white band under the navbar. It was never part of the page, so no
CSS ever reached it — canvas colour, `theme-color`, `color-scheme`, all measured, all
ignored. `display: fullscreen` takes the strip back but takes the bars with it, which is
not what is wanted.

A WebView can ask for edge to edge on any version:

- `enableEdgeToEdge()` — `decorFitsSystemWindows(false)` plus both bars transparent
- `isNavigationBarContrastEnforced = false` — Android otherwise scrims a transparent bar
  when it thinks the content behind needs contrast, and **that scrim is the band**
- `windowLayoutInDisplayCutoutMode = shortEdges` — draws into the camera cutout instead of
  letterboxing below it

The bars themselves are untouched: one real clock, one real gesture handle, both Android's
own, with the page drawing behind them. The page already carries `viewport-fit=cover`, so
`env(safe-area-inset-*)` reports the strips and the frame's own CSS clears them.

## Build

Android Studio (Koala or newer), or:

    ./gradlew :app:assembleDebug
    adb install -r app/build/outputs/apk/debug/app-debug.apk

There is no Gradle wrapper jar in the repo — open the folder in Android Studio once and it
writes one, or run `gradle wrapper` with a local Gradle 8.7+.

`minSdk` is 29, which is where `isNavigationBarContrastEnforced` arrives. Below that the
platform paints its own scrim and no app can stop it.

## Pointing it somewhere else

`MainActivity.START_URL`. It is a static site, so any host works — the deployed build, or a
laptop on the same wifi during development.
