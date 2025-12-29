package com.example.location_tracker_android.view.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme

/**
 * View: Splash Screen UI Component
 * Displays animated location icon with zoom in/out effect
 */
@Composable
fun SplashScreen(
    modifier: Modifier = Modifier,
    onAnimationComplete: (() -> Unit)? = null
) {
    LocationtrackerandroidTheme {
        val infiniteTransition = rememberInfiniteTransition(label = "splash_animation")
        
        // Scale animation: zooms from 0.8 to 1.2 and back
        val scale by infiniteTransition.animateFloat(
            initialValue = 0.8f,
            targetValue = 1.2f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = 2000,
                    easing = FastOutSlowInEasing
                ),
                repeatMode = RepeatMode.Reverse
            ),
            label = "scale_animation"
        )
        
        // Optional: Opacity animation for extra smoothness
        val alpha by infiniteTransition.animateFloat(
            initialValue = 0.9f,
            targetValue = 1.0f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = 2000,
                    easing = FastOutSlowInEasing
                ),
                repeatMode = RepeatMode.Reverse
            ),
            label = "alpha_animation"
        )
        
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            // Location icon with zoom animation
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Location Tracker",
                modifier = Modifier
                    .size(120.dp)
                    .scale(scale)
                    .graphicsLayer { this.alpha = alpha },
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

/**
 * Alternative splash screen with pulsing effect
 */
@Composable
fun SplashScreenWithPulse(
    modifier: Modifier = Modifier
) {
    LocationtrackerandroidTheme {
        val infiniteTransition = rememberInfiniteTransition(label = "splash_pulse")
        
        // Main icon scale
        val mainScale by infiniteTransition.animateFloat(
            initialValue = 1.0f,
            targetValue = 1.3f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = 1500,
                    easing = FastOutSlowInEasing
                ),
                repeatMode = RepeatMode.Reverse
            ),
            label = "main_scale"
        )
        
        // Pulsing ring effect
        val ringScale by infiniteTransition.animateFloat(
            initialValue = 1.0f,
            targetValue = 2.0f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = 1500,
                    easing = LinearEasing
                ),
                repeatMode = RepeatMode.Restart
            ),
            label = "ring_scale"
        )
        
        val ringAlpha by infiniteTransition.animateFloat(
            initialValue = 0.6f,
            targetValue = 0.0f,
            animationSpec = infiniteRepeatable(
                animation = tween(
                    durationMillis = 1500,
                    easing = LinearEasing
                ),
                repeatMode = RepeatMode.Restart
            ),
            label = "ring_alpha"
        )
        
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
            contentAlignment = Alignment.Center
        ) {
            // Pulsing ring
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(ringScale)
                    .graphicsLayer { this.alpha = ringAlpha }
                    .background(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                        shape = CircleShape
                    )
            )
            
            // Main location icon
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Location Tracker",
                modifier = Modifier
                    .size(120.dp)
                    .scale(mainScale),
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SplashScreenPreview() {
    SplashScreen()
}

@Preview(showBackground = true)
@Composable
fun SplashScreenWithPulsePreview() {
    SplashScreenWithPulse()
}

