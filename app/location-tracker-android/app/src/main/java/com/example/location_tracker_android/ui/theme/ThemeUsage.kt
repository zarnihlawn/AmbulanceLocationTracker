package com.example.location_tracker_android.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp

/**
 * Example usage of the theme system
 * This file demonstrates how to use the various theme components
 */

@Composable
fun ThemeUsageExamples() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Using Material 3 colors
        Text(
            text = "Primary Color",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary
        )
        
        // Using extended colors (info, success, warning)
        val extendedColors = AppTheme.colors
        Text(
            text = "Info Color",
            style = MaterialTheme.typography.bodyLarge,
            color = extendedColors.info
        )
        
        // Using shapes
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp)
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = AppShapes.box
                )
        ) {
            Text(
                text = "Box with theme shape",
                modifier = Modifier.padding(16.dp),
                style = MaterialTheme.typography.bodyMedium
            )
        }
        
        // Button with theme colors and shapes
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth(),
            shape = AppShapes.field
        ) {
            Text("Themed Button")
        }
        
        // Card with theme
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = AppShapes.box,
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Card Title",
                    style = MaterialTheme.typography.titleLarge
                )
                Text(
                    text = "Card content using theme typography and colors",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        // Semantic color examples
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                color = extendedColors.success,
                shape = AppShapes.field,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "Success",
                    modifier = Modifier.padding(8.dp),
                    color = extendedColors.onSuccess,
                    style = MaterialTheme.typography.labelMedium
                )
            }
            Surface(
                color = extendedColors.warning,
                shape = AppShapes.field,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "Warning",
                    modifier = Modifier.padding(8.dp),
                    color = extendedColors.onWarning,
                    style = MaterialTheme.typography.labelMedium
                )
            }
            Surface(
                color = extendedColors.info,
                shape = AppShapes.field,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "Info",
                    modifier = Modifier.padding(8.dp),
                    color = extendedColors.onInfo,
                    style = MaterialTheme.typography.labelMedium
                )
            }
        }
        
        // Text field with theme
        OutlinedTextField(
            value = "",
            onValueChange = { },
            modifier = Modifier.fillMaxWidth(),
            shape = AppShapes.field,
            label = { Text("Themed Text Field") },
            placeholder = { Text("Enter text...") }
        )
    }
}

