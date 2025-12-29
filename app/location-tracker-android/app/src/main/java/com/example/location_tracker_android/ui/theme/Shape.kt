package com.example.location_tracker_android.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Shape definitions based on DaisyUI theme
 * --radius-selector: 2rem (32dp)
 * --radius-field: 0.5rem (8dp)
 * --radius-box: 0.5rem (8dp)
 */
object AppShapes {
    // Selector radius: 2rem = 32dp
    val selector = RoundedCornerShape(32.dp)
    
    // Field radius: 0.5rem = 8dp
    val field = RoundedCornerShape(8.dp)
    
    // Box radius: 0.5rem = 8dp
    val box = RoundedCornerShape(8.dp)
    
    // Additional common shapes
    val small = RoundedCornerShape(4.dp)
    val medium = field
    val large = RoundedCornerShape(16.dp)
    val extraLarge = selector
    
    // Material 3 Shapes
    val shapes = Shapes(
        extraSmall = small,
        small = small,
        medium = medium,
        large = large,
        extraLarge = extraLarge
    )
}

// Border width: --border: 2px = 2dp
val BorderWidth = 2.dp

