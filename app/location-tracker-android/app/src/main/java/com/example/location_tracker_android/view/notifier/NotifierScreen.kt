package com.example.location_tracker_android.view.notifier

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
import com.example.location_tracker_android.service.NotificationService
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
    organizationData: OrganizationData? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    // Get device ID from organization data (database ID) or from LocationTrackingService
    val deviceId = remember {
        organizationData?.deviceData?.id
            ?: organizationData?.deviceId
            ?: LocationTrackingService.getDeviceId(context)
    }
    var tasks by remember { mutableStateOf<List<LocationTrackerTask>>(emptyList()) }
    var previousTasks by remember { mutableStateOf<Set<String>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    // Initialize notification channel
    LaunchedEffect(Unit) {
        NotificationService.createNotificationChannel(context)
    }

    // Track if device is busy (has an accepted location task)
    var hasAcceptedLocationTask by remember { mutableStateOf(false) }
    var acceptedTask by remember { mutableStateOf<LocationTrackerTask?>(null) }

    // Function to load tasks
    suspend fun loadTasks(): Result<List<LocationTrackerTask>> {
        val currentDeviceId = deviceId
        return if (currentDeviceId != null) {
            TaskController.getTasksByDeviceId(currentDeviceId)
        } else {
            Result.failure(Exception("Device ID not available"))
        }
    }

    // Load tasks on mount and refresh periodically
    LaunchedEffect(deviceId) {
        if (deviceId == null) {
            error = "Device ID not found. Please ensure the device is registered."
            loading = false
            return@LaunchedEffect
        }

        try {
            val result = loadTasks()
            result.onSuccess { taskList ->
                // Check for accepted location tasks (device is busy)
                val acceptedLocationTasks = taskList.filter {
                    it.status == "accepted" && it.type == "location"
                }
                hasAcceptedLocationTask = acceptedLocationTasks.isNotEmpty()
                acceptedTask = acceptedLocationTasks.firstOrNull()

                // Show all pending tasks (device busy state only affects Accept button for location tasks)
                val pendingTasks = taskList.filter { it.status == "pending" }

                // Detect new tasks and show notifications (only if we have previous tasks, not on first load)
                val currentTaskIds = pendingTasks.map { it.id }.toSet()
                if (previousTasks.isNotEmpty()) {
                    val newTasks = pendingTasks.filter { it.id !in previousTasks }

                    // Show notification for each new task
                    newTasks.forEach { task ->
                        NotificationService.showTaskNotification(
                            context = context,
                            taskId = task.id,
                            title = "New Task: ${task.title}",
                            message = task.description ?: task.title
                        )
                    }
                }

                // Update previous tasks set
                previousTasks = currentTaskIds
                tasks = pendingTasks
                loading = false
            }.onFailure {
                error = it.message
                loading = false
            }

            // Poll for new tasks every 10 seconds
            while (true) {
                kotlinx.coroutines.delay(10000)
                val pollResult = loadTasks()
                pollResult.onSuccess { taskList ->
                    // Check for accepted location tasks (device is busy)
                    val acceptedLocationTasks = taskList.filter {
                        it.status == "accepted" && it.type == "location"
                    }
                    hasAcceptedLocationTask = acceptedLocationTasks.isNotEmpty()
                    acceptedTask = acceptedLocationTasks.firstOrNull()

                    // Show all pending tasks (device busy state only affects Accept button for location tasks)
                    val pendingTasks = taskList.filter { it.status == "pending" }

                    // Detect new tasks and show notifications
                    val currentTaskIds = pendingTasks.map { it.id }.toSet()
                    val newTasks = pendingTasks.filter { it.id !in previousTasks }

                    // Show notification for each new task
                    newTasks.forEach { task ->
                        NotificationService.showTaskNotification(
                            context = context,
                            taskId = task.id,
                            title = "New Task: ${task.title}",
                            message = task.description ?: task.title
                        )
                    }

                    // Update previous tasks set
                    previousTasks = currentTaskIds
                    tasks = pendingTasks
                }
            }
        } catch (e: Exception) {
            error = "Failed to load tasks: ${e.message}"
            loading = false
        }
    }

    fun updateTaskStatus(taskId: String, status: String, responseMessage: String? = null) {
        if (deviceId == null) {
            error = "Device ID not available"
            return
        }

        scope.launch {
            TaskController.updateTaskStatus(taskId, status, responseMessage)
                .onSuccess {
                    // Cancel notification for this task since it's no longer pending
                    NotificationService.cancelTaskNotification(context, taskId)

                    // Reload tasks
                    val reloadResult = loadTasks()
                    reloadResult.onSuccess { taskList ->
                        // Check for accepted location tasks (device is busy)
                        val acceptedLocationTasks = taskList.filter {
                            it.status == "accepted" && it.type == "location"
                        }
                        hasAcceptedLocationTask = acceptedLocationTasks.isNotEmpty()
                        acceptedTask = acceptedLocationTasks.firstOrNull()

                        // Show all pending tasks (device busy state only affects Accept button for location tasks)
                        tasks = taskList.filter { it.status == "pending" }
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
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Show accepted location task at the top if device is busy
                if (hasAcceptedLocationTask && acceptedTask != null) {
                    item {
                        AcceptedTaskCard(
                            task = acceptedTask!!,
                            onDone = { updateTaskStatus(acceptedTask!!.id, "completed") },
                            onReject = { updateTaskStatus(acceptedTask!!.id, "rejected") }
                        )
                        if (tasks.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Divider()
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Pending Tasks",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }

                if (tasks.isEmpty() && !hasAcceptedLocationTask) {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(32.dp)
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
                    }
                } else {
                    items(tasks) { task ->
                        TaskCard(
                            task = task,
                            onAccept = { updateTaskStatus(task.id, "accepted") },
                            onReject = { updateTaskStatus(task.id, "rejected") },
                            onNA = { updateTaskStatus(task.id, "na") },
                            canAccept = !(hasAcceptedLocationTask && task.type == "location")
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AcceptedTaskCard(
    task: LocationTrackerTask,
    onDone: () -> Unit,
    onReject: () -> Unit
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
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Busy",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Device is Busy",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = task.title,
                style = MaterialTheme.typography.titleLarge
            )
            if (task.description != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = task.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (task.type == "location" && !task.targetLatitude.isNullOrBlank() && !task.targetLongitude.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Target: ${task.targetLatitude}, ${task.targetLongitude}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Accepted: $formattedDate",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onDone,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Done")
                }
                Button(
                    onClick = onReject,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reject")
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
    onNA: () -> Unit,
    canAccept: Boolean = true
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
                    enabled = canAccept,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        if (!canAccept && task.type == "location") {
                            "Busy"
                        } else {
                            "Accept"
                        }
                    )
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
                    modifier = Modifier.weight(1f),
                    enabled = canAccept
                ) {
                    Text("N/A")
                }
            }

            if (!canAccept && task.type == "location") {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = MaterialTheme.shapes.small
                ) {
                    Text(
                        text = "Cannot accept location tasks while device is busy. Complete or reject the current location task first.",
                        modifier = Modifier.padding(12.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
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
