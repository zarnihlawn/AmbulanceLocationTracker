package com.example.location_tracker_android.ui.theme

import androidx.compose.ui.graphics.Color

// Base colors
val Base100 = Color(0xFFF5F5F5) // oklch(96% 0.016 293.756) - very light purple-gray
val Base200 = Color(0xFFE8E8ED) // oklch(94% 0.029 294.588) - light purple-gray
val Base300 = Color(0xFFD1D1D9) // oklch(89% 0.057 293.283) - medium purple-gray
val BaseContent = Color(0xFF4A4A5C) // oklch(38% 0.189 293.745) - dark purple-gray

// Primary colors
val Primary = Color(0xFFD4A574) // oklch(64% 0.222 41.116) - warm orange/brown
val PrimaryContent = Color(0xFFFDF9F0) // oklch(98% 0.016 73.684) - very light cream

// Secondary colors
val Secondary = Color(0xFFB87FB8) // oklch(55% 0.288 302.321) - purple/magenta
val SecondaryContent = Color(0xFFFDF5FD) // oklch(97% 0.014 308.299) - very light pink

// Accent colors
val Accent = Color(0xFF6B6B5F) // oklch(44% 0.011 73.639) - muted olive/gray
val AccentContent = Color(0xFFFDFDFC) // oklch(98% 0.001 106.423) - almost white

// Neutral colors
val Neutral = Color(0xFF5A5A6B) // oklch(43% 0.232 292.759) - dark purple-gray
val NeutralContent = Color(0xFFF5F5F5) // oklch(96% 0.016 293.756) - very light purple-gray

// Semantic colors
val Info = Color(0xFF6B9FD4) // oklch(62% 0.214 259.815) - blue
val InfoContent = Color(0xFFF5F7FD) // oklch(97% 0.014 254.604) - very light blue

val Success = Color(0xFF7BC4A0) // oklch(70% 0.14 182.503) - green
val SuccessContent = Color(0xFFF5FDF9) // oklch(98% 0.014 180.72) - very light green

val Warning = Color(0xFFE8C97A) // oklch(79% 0.184 86.047) - yellow/orange
val WarningContent = Color(0xFFFDFCF5) // oklch(98% 0.026 102.212) - very light yellow

val Error = Color(0xFFD47A7A) // oklch(63% 0.237 25.331) - red/coral
val ErrorContent = Color(0xFFFDF5F5) // oklch(97% 0.013 17.38) - very light red

// Material 3 Color Scheme mapping
object AppColors {
    val primary = Primary
    val onPrimary = PrimaryContent
    val primaryContainer = Base200
    val onPrimaryContainer = BaseContent
    
    val secondary = Secondary
    val onSecondary = SecondaryContent
    val secondaryContainer = Base200
    val onSecondaryContainer = BaseContent
    
    val tertiary = Accent
    val onTertiary = AccentContent
    val tertiaryContainer = Base200
    val onTertiaryContainer = BaseContent
    
    val background = Base100
    val onBackground = BaseContent
    val surface = Base100
    val onSurface = BaseContent
    val surfaceVariant = Base200
    val onSurfaceVariant = BaseContent
    
    val error = Error
    val onError = ErrorContent
    val errorContainer = Base200
    val onErrorContainer = Error
    
    val outline = Base300
    val outlineVariant = Base200
    
    // Semantic colors
    val info = Info
    val onInfo = InfoContent
    val success = Success
    val onSuccess = SuccessContent
    val warning = Warning
    val onWarning = WarningContent
}
