package com.example.location_tracker_android.view.history

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.TaskController
import com.example.location_tracker_android.model.LocationTrackerTask
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.service.LocationTrackingService
import com.example.location_tracker_android.ui.theme.AppShapes
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * View: History Screen
 * Displays task history (completed, rejected, na)
 */
@Composable
fun HistoryScreen(
    organizationData: OrganizationData? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val deviceId = remember {
        organizationData?.deviceData?.id
            ?: organizationData?.deviceId
            ?: LocationTrackingService.getDeviceId(context)
    }

    var tasks by remember { mutableStateOf<List<LocationTrackerTask>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    // Load history tasks (completed, rejected, na)
    LaunchedEffect(deviceId) {
        if (deviceId == null) {
            error = "Device ID not found. Please ensure the device is registered."
            loading = false
            return@LaunchedEffect
        }

        scope.launch {
            try {
                val result = TaskController.getTasksByDeviceId(deviceId)
                result.onSuccess { taskList ->
                    // Filter tasks that are completed, rejected, or na
                    tasks = taskList.filter {
                        it.status == "completed" ||
                        it.status == "rejected" ||
                        it.status == "na"
                    }.sortedByDescending {
                        try {
                            SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                                .parse(it.updatedAt)?.time ?: 0L
                        } catch (e: Exception) {
                            0L
                        }
                    }
                    loading = false
                }.onFailure {
                    error = it.message
                    loading = false
                }
            } catch (e: Exception) {
                error = "Failed to load history: ${e.message}"
                loading = false
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
                    imageVector = Icons.Default.Info,
                    contentDescription = "History",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Task History",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // History List
        if (loading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (error != null) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Error: $error",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        } else if (tasks.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "No history",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No task history",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(tasks) { task ->
                    TaskHistoryCard(task = task)
                }
            }
        }
    }
}

@Composable
fun TaskHistoryCard(task: LocationTrackerTask) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
    val formattedDate = try {
        dateFormat.format(SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).parse(task.updatedAt) ?: Date())
    } catch (e: Exception) {
        task.updatedAt
    }

    val statusIcon = when (task.status) {
        "completed" -> Icons.Default.CheckCircle
        "rejected" -> Icons.Default.Close
        "na" -> Icons.Default.Info
        else -> Icons.Default.Info
    }

    val statusColor = when (task.status) {
        "completed" -> MaterialTheme.colorScheme.primary
        "rejected" -> MaterialTheme.colorScheme.error
        "na" -> MaterialTheme.colorScheme.onSurfaceVariant
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = AppShapes.box,
        colors = CardDefaults.cardColors(
            containerColor = when (task.status) {
                "completed" -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                "rejected" -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
                else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
            }
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = task.title,
                        style = MaterialTheme.typography.titleMedium
                    )
                    if (task.description != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = task.description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    if (task.type == "location" && !task.targetLatitude.isNullOrBlank() && !task.targetLongitude.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Target: ${task.targetLatitude}, ${task.targetLongitude}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                Icon(
                    imageVector = statusIcon,
                    contentDescription = task.status,
                    tint = statusColor,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Divider()
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = when (task.status) {
                        "completed" -> "Completed"
                        "rejected" -> "Rejected"
                        "na" -> "N/A"
                        else -> task.status
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = statusColor
                )
                Text(
                    text = formattedDate,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HistoryScreenPreview() {
    LocationtrackerandroidTheme {
        HistoryScreen()
    }
}
