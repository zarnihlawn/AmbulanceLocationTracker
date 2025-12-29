package com.example.location_tracker_android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Light color scheme based on DaisyUI theme
 */
private val LightColorScheme = lightColorScheme(
    primary = AppColors.primary,
    onPrimary = AppColors.onPrimary,
    primaryContainer = AppColors.primaryContainer,
    onPrimaryContainer = AppColors.onPrimaryContainer,
    
    secondary = AppColors.secondary,
    onSecondary = AppColors.onSecondary,
    secondaryContainer = AppColors.secondaryContainer,
    onSecondaryContainer = AppColors.onSecondaryContainer,
    
    tertiary = AppColors.tertiary,
    onTertiary = AppColors.onTertiary,
    tertiaryContainer = AppColors.tertiaryContainer,
    onTertiaryContainer = AppColors.onTertiaryContainer,
    
    background = AppColors.background,
    onBackground = AppColors.onBackground,
    surface = AppColors.surface,
    onSurface = AppColors.onSurface,
    surfaceVariant = AppColors.surfaceVariant,
    onSurfaceVariant = AppColors.onSurfaceVariant,
    
    error = AppColors.error,
    onError = AppColors.onError,
    errorContainer = AppColors.errorContainer,
    onErrorContainer = AppColors.onErrorContainer,
    
    outline = AppColors.outline,
    outlineVariant = AppColors.outlineVariant
)

/**
 * Extended color palette for semantic colors
 */
@Immutable
data class ExtendedColors(
    val info: Color,
    val onInfo: Color,
    val success: Color,
    val onSuccess: Color,
    val warning: Color,
    val onWarning: Color
)

private val LightExtendedColors = ExtendedColors(
    info = AppColors.info,
    onInfo = AppColors.onInfo,
    success = AppColors.success,
    onSuccess = AppColors.onSuccess,
    warning = AppColors.warning,
    onWarning = AppColors.onWarning
)

val LocalExtendedColors = staticCompositionLocalOf {
    LightExtendedColors
}

/**
 * Main theme composable
 * 
 * @param darkTheme Whether to use dark theme (currently only light theme is implemented)
 * @param content The composable content to apply the theme to
 */
@Composable
fun LocationtrackerandroidTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // Currently only light theme is implemented based on the provided DaisyUI theme
    val colorScheme: ColorScheme = LightColorScheme
    val extendedColors = LightExtendedColors

    CompositionLocalProvider(LocalExtendedColors provides extendedColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            shapes = AppShapes.shapes,
            content = content
        )
    }
}

/**
 * Accessor for extended colors
 */
object AppTheme {
    val colors: ExtendedColors
        @Composable
        get() = LocalExtendedColors.current
}
