package com.example.location_tracker_android.controller

/**
 * Controller for Splash Screen
 * Handles business logic and state management for splash screen
 * 
 * In MVC architecture:
 * - Controller: Contains business logic and state management
 * - View: UI components (SplashScreen composable)
 * - Model: Data structures (if needed for splash)
 */
class SplashController {
    companion object {
        const val SPLASH_DURATION_MS = 3000L
    }

    /**
     * Get splash screen duration in milliseconds
     */
    fun getSplashDuration(): Long = SPLASH_DURATION_MS

    /**
     * Check if splash should be shown based on business logic
     * This can be extended to check user preferences, first launch, etc.
     */
    fun shouldShowSplash(): Boolean = true
}

