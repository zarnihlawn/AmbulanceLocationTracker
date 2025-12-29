package com.example.location_tracker_android.view.home

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * View: Bottom Navigation Bar
 * Sticky bottom navigation with 4 tabs
 */
enum class BottomNavItem(
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    MAP("Map", Icons.Default.LocationOn),
    NOTIFIER("Notifier", Icons.Default.Notifications),
    HISTORY("History", Icons.Default.Info),
    PROFILE("Profile", Icons.Default.Person)
}

@Composable
fun BottomNavigationBar(
    selectedItem: BottomNavItem,
    onItemSelected: (BottomNavItem) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(modifier = modifier) {
        BottomNavItem.values().forEach { item ->
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.title
                    )
                },
                label = { Text(item.title) },
                selected = selectedItem == item,
                onClick = { onItemSelected(item) }
            )
        }
    }
}

