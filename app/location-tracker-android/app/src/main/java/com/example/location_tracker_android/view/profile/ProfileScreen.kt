package com.example.location_tracker_android.view.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.DeviceIdController
import com.example.location_tracker_android.controller.DeviceInfoController
import com.example.location_tracker_android.controller.LocationTrackerDeviceController
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.ui.theme.AppShapes
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import kotlinx.coroutines.launch

/**
 * View: Profile Screen
 * Displays user profile and organization information
 */
@Composable
fun ProfileScreen(
    organizationData: OrganizationData? = null,
    onDeviceDeleted: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val deviceController = remember { 
        LocationTrackerDeviceController(
            DeviceInfoController(context),
            DeviceIdController(context)
        )
    }

    // Check if device still exists and is accepted, redirect if deleted
    LaunchedEffect(organizationData?.deviceData?.deviceKey) {
        organizationData?.deviceData?.deviceKey?.let { deviceKey ->
            coroutineScope.launch {
                try {
                    val checkResult = deviceController.checkDeviceStatus(deviceKey)
                    when (checkResult) {
                        is LocationTrackerDeviceController.StatusResult.NotFound -> {
                            // Device was deleted, redirect to registration
                            onDeviceDeleted()
                        }
                        is LocationTrackerDeviceController.StatusResult.Found -> {
                            if (!checkResult.device.isAccepted) {
                                // Device was unaccepted, redirect to registration
                                onDeviceDeleted()
                            }
                        }
                        else -> {
                            // Error checking, ignore for now
                        }
                    }
                } catch (e: Exception) {
                    // Error checking status, ignore
                }
            }
        }
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.primaryContainer
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Profile",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Profile",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // Profile Content
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Avatar
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = AppShapes.box
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile",
                        modifier = Modifier.size(80.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = organizationData?.deviceData?.name ?: "Device Profile",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    organizationData?.deviceData?.description?.let { desc ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = desc,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Device Information from Database
            organizationData?.deviceData?.let { deviceData ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = AppShapes.box
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Device Information",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Divider()
                        deviceData.deviceModel?.let {
                            InfoRow(
                                icon = Icons.Default.Phone,
                                label = "Device Model",
                                value = it
                            )
                        }
                        deviceData.deviceOs?.let { os ->
                            InfoRow(
                                icon = Icons.Default.Info,
                                label = "Operating System",
                                value = "$os ${deviceData.deviceOsVersion ?: ""}".trim()
                            )
                        }
                        deviceData.appVersion?.let {
                            InfoRow(
                                icon = Icons.Default.Settings,
                                label = "App Version",
                                value = it
                            )
                        }
                        InfoRow(
                            icon = if (deviceData.isAccepted) Icons.Default.Check else Icons.Default.Info,
                            label = "Status",
                            value = if (deviceData.isAccepted) "Accepted" else "Pending Approval"
                        )
                    }
                }
            }

            // Organization Information
            organizationData?.let { data ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = AppShapes.box
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Organization Information",
                            style = MaterialTheme.typography.titleLarge
                        )
                        Divider()
                        InfoRow(
                            icon = Icons.Default.AccountCircle,
                            label = "Organization ID",
                            value = data.organizationId
                        )
                        InfoRow(
                            icon = Icons.Default.Info,
                            label = "Workspace ID",
                            value = data.workspaceId
                        )
                        InfoRow(
                            icon = Icons.Default.LocationOn,
                            label = "Device ID",
                            value = data.deviceId
                        )
                    }
                }
            }

            // Settings Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = AppShapes.box
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Settings",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Divider()
                    SettingsItem(
                        icon = Icons.Default.Settings,
                        title = "App Settings",
                        onClick = { /* TODO */ }
                    )
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "About",
                        onClick = { /* TODO */ }
                    )
                    SettingsItem(
                        icon = Icons.Default.ExitToApp,
                        title = "Logout",
                        onClick = { /* TODO */ }
                    )
                }
            }
        }
    }
}

@Composable
fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
fun SettingsItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = title,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f)
        )
        // Arrow icon removed - using text only for now
    }
}

@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    LocationtrackerandroidTheme {
        ProfileScreen()
    }
}

