package com.example.location_tracker_android.view.notifier

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.TaskController
import com.example.location_tracker_android.controller.DeviceIdController
import com.example.location_tracker_android.model.LocationTrackerTask
import com.example.location_tracker_android.ui.theme.AppShapes
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * View: Notifier Screen
 * Displays tasks and allows accepting/rejecting/N/A
 */
@Composable
fun NotifierScreen(
    modifier: Modifier = Modifier
) {
    val deviceId = DeviceIdController.getDeviceId()
    var tasks by remember { mutableStateOf<List<LocationTrackerTask>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    // Load tasks on mount and refresh periodically
    LaunchedEffect(deviceId) {
        if (deviceId != null) {
            loadTasks(deviceId) { result ->
                result.onSuccess { taskList ->
                    tasks = taskList.filter { it.status == "pending" } // Only show pending tasks
                    loading = false
                }.onFailure {
                    error = it.message
                    loading = false
                }
            }
            
            // Poll for new tasks every 10 seconds
            while (true) {
                kotlinx.coroutines.delay(10000)
                loadTasks(deviceId) { result ->
                    result.onSuccess { taskList ->
                        tasks = taskList.filter { it.status == "pending" }
                    }
                }
            }
        } else {
            error = "Device ID not found"
            loading = false
        }
    }

    fun loadTasks(deviceId: String, callback: (Result<List<LocationTrackerTask>>) -> Unit) {
        scope.launch {
            val result = TaskController.getTasksByDeviceId(deviceId)
            callback(result)
        }
    }

    fun updateTaskStatus(taskId: String, status: String, responseMessage: String? = null) {
        scope.launch {
            TaskController.updateTaskStatus(taskId, status, responseMessage)
                .onSuccess {
                    // Reload tasks
                    if (deviceId != null) {
                        loadTasks(deviceId) { result ->
                            result.onSuccess { taskList ->
                                tasks = taskList.filter { it.status == "pending" }
                            }
                        }
                    }
                }
                .onFailure {
                    error = "Failed to update task: ${it.message}"
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
                    imageVector = Icons.Default.Notifications,
                    contentDescription = "Tasks",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Tasks",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // Tasks List
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
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "No tasks",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No pending tasks",
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
                    TaskCard(
                        task = task,
                        onAccept = { updateTaskStatus(task.id, "accepted") },
                        onReject = { updateTaskStatus(task.id, "rejected") },
                        onNA = { updateTaskStatus(task.id, "na") }
                    )
                }
            }
        }
    }
}

@Composable
fun TaskCard(
    task: LocationTrackerTask,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    onNA: () -> Unit
) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
    val formattedDate = try {
        dateFormat.format(SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).parse(task.createdAt) ?: Date())
    } catch (e: Exception) {
        task.createdAt
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = AppShapes.box,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
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
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )
                Badge(
                    containerColor = when (task.type) {
                        "location" -> MaterialTheme.colorScheme.tertiary
                        else -> MaterialTheme.colorScheme.secondary
                    }
                ) {
                    Text(
                        text = task.type.uppercase(),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            if (!task.description.isNullOrBlank()) {
                Text(
                    text = task.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            if (task.type == "location" && !task.targetLatitude.isNullOrBlank() && !task.targetLongitude.isNullOrBlank()) {
                Text(
                    text = "Target: ${task.targetLatitude}, ${task.targetLongitude}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            Text(
                text = formattedDate,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onAccept,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Accept")
                }
                Button(
                    onClick = onReject,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Reject")
                }
                OutlinedButton(
                    onClick = onNA,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("N/A")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun NotifierScreenPreview() {
    LocationtrackerandroidTheme {
        NotifierScreen()
    }
}
