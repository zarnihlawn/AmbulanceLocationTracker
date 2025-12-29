package com.example.location_tracker_android.view.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import com.example.location_tracker_android.view.history.HistoryScreen
import com.example.location_tracker_android.view.map.MapScreen
import com.example.location_tracker_android.view.notifier.NotifierScreen
import com.example.location_tracker_android.view.profile.ProfileScreen

/**
 * View: Home Screen UI Component
 * Main screen with bottom navigation bar
 * Displays different screens based on selected tab
 */
@Composable
fun HomeScreen(
    organizationData: OrganizationData? = null,
    onDeviceDeleted: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(BottomNavItem.MAP) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            BottomNavigationBar(
                selectedItem = selectedTab,
                onItemSelected = { selectedTab = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                BottomNavItem.MAP -> MapScreen(organizationData = organizationData)
                BottomNavItem.NOTIFIER -> NotifierScreen(organizationData = organizationData)
                BottomNavItem.HISTORY -> HistoryScreen()
                BottomNavItem.PROFILE -> ProfileScreen(
                    organizationData = organizationData,
                    onDeviceDeleted = onDeviceDeleted
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HomeScreenPreview() {
    LocationtrackerandroidTheme {
        HomeScreen()
    }
}

