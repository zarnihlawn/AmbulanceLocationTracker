package com.example.location_tracker_android.view.map

import android.Manifest
import android.content.pm.PackageManager
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.LocationController
import com.example.location_tracker_android.controller.ApiClient
import com.example.location_tracker_android.controller.RouteController
import com.example.location_tracker_android.controller.TaskController
import com.example.location_tracker_android.model.LocationTrackerTask
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberMultiplePermissionsState
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope

/**
 * View: Map Screen
 * Displays location tracking map with Google Maps
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MapScreen(
    organizationData: OrganizationData? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val locationController = remember { LocationController(context) }
    val coroutineScope = rememberCoroutineScope()

    // Get Google Maps API key from manifest
    val googleMapsApiKey = remember {
        try {
            val appInfo = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)
            val bundle = appInfo.metaData
            bundle.getString("com.google.android.geo.API_KEY") ?: ""
        } catch (e: Exception) {
            android.util.Log.e("MapScreen", "Error getting API key: ${e.message}")
            ""
        }
    }

    val routeController = remember { RouteController(googleMapsApiKey) }

    // Request location permissions (but don't block map display)
    val locationPermissionsState = rememberMultiplePermissionsState(
        permissions = listOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
    )

    // Default location (Yangon, Myanmar)
    var currentLocation by remember { mutableStateOf(LatLng(16.8661, 96.1951)) }
    var cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(currentLocation, 15f)
    }
    var showPermissionDialog by remember { mutableStateOf(false) }

    // Routes for accepted location tasks
    var routes by remember { mutableStateOf<List<Pair<LocationTrackerTask, List<RouteController.Route>>>>(emptyList()) }
    var targetLocation by remember { mutableStateOf<LatLng?>(null) }

    val currentLocationState = locationController.currentLocation.collectAsState()

    // Track when routes need to be reloaded (e.g., when coming back to map screen)
    var reloadRoutesTrigger by remember { mutableStateOf(0) }

    // Function to load routes for accepted location tasks
    suspend fun loadRoutesForAcceptedTasks(deviceId: String) {
        if (googleMapsApiKey.isEmpty()) {
            android.util.Log.d("MapScreen", "Google Maps API key is empty, skipping route loading")
            return
        }

        try {
            android.util.Log.d("MapScreen", "Loading routes for device: $deviceId")
            val tasksResult = TaskController.getTasksByDeviceId(deviceId)
            tasksResult.onSuccess { taskList ->
                android.util.Log.d("MapScreen", "Tasks loaded: ${taskList.size}")
                val acceptedLocationTasks = taskList.filter {
                    it.status == "accepted" &&
                    it.type == "location" &&
                    !it.targetLatitude.isNullOrBlank() &&
                    !it.targetLongitude.isNullOrBlank()
                }

                android.util.Log.d("MapScreen", "Accepted location tasks: ${acceptedLocationTasks.size}")

                if (acceptedLocationTasks.isNotEmpty()) {
                    // Get routes for each accepted location task
                    val routesList = mutableListOf<Pair<LocationTrackerTask, List<RouteController.Route>>>()
                    var firstTarget: LatLng? = null

                    for (task in acceptedLocationTasks) {
                        try {
                            val targetLat = task.targetLatitude!!.toDouble()
                            val targetLng = task.targetLongitude!!.toDouble()
                            val target = LatLng(targetLat, targetLng)

                            // Use current GPS location if available, otherwise use server location
                            val origin = currentLocationState.value?.let {
                                LatLng(it.latitude, it.longitude)
                            } ?: currentLocation

                            android.util.Log.d("MapScreen", "Getting routes from (${origin.latitude}, ${origin.longitude}) to (${target.latitude}, ${target.longitude})")
                            val taskRoutes = routeController.getRoutes(origin, target, maxRoutes = 5)
                            android.util.Log.d("MapScreen", "Routes found: ${taskRoutes.size} for task ${task.id}")

                            if (taskRoutes.isNotEmpty()) {
                                routesList.add(Pair(task, taskRoutes))
                                if (firstTarget == null) {
                                    firstTarget = target
                                }
                            }
                        } catch (e: Exception) {
                            android.util.Log.e("MapScreen", "Error getting routes for task ${task.id}: ${e.message}", e)
                        }
                    }

                    android.util.Log.d("MapScreen", "Total routes loaded: ${routesList.size}")
                    routes = routesList
                    targetLocation = firstTarget

                    // Adjust camera to show both origin and destination
                    firstTarget?.let { target ->
                        val origin = currentLocationState.value?.let {
                            LatLng(it.latitude, it.longitude)
                        } ?: currentLocation

                        // Calculate bounds and center
                        val minLat = kotlin.math.min(origin.latitude, target.latitude)
                        val maxLat = kotlin.math.max(origin.latitude, target.latitude)
                        val minLng = kotlin.math.min(origin.longitude, target.longitude)
                        val maxLng = kotlin.math.max(origin.longitude, target.longitude)

                        val center = LatLng((minLat + maxLat) / 2, (minLng + maxLng) / 2)
                        val latSpan = maxLat - minLat
                        val lngSpan = maxLng - minLng
                        val maxSpan = kotlin.math.max(latSpan, lngSpan)

                        // Set zoom level based on span (with padding)
                        val zoom = when {
                            maxSpan > 1.0 -> 10f
                            maxSpan > 0.1 -> 12f
                            maxSpan > 0.01 -> 14f
                            else -> 16f
                        }

                        cameraPositionState.animate(
                            CameraUpdateFactory.newCameraPosition(
                                CameraPosition.fromLatLngZoom(center, zoom)
                            )
                        )
                    }
                } else {
                    // No accepted location tasks, clear routes
                    android.util.Log.d("MapScreen", "No accepted location tasks, clearing routes")
                    routes = emptyList()
                    targetLocation = null
                }
            }.onFailure { error ->
                android.util.Log.e("MapScreen", "Failed to load tasks: ${error.message}", error)
            }
        } catch (e: Exception) {
            android.util.Log.e("MapScreen", "Error loading routes: ${e.message}", e)
        }
    }

    // Get latest location from server
    LaunchedEffect(organizationData?.deviceData?.id) {
        val deviceId = organizationData?.deviceData?.id
        if (deviceId != null) {
            coroutineScope.launch {
                try {
                    // Fetch latest location from server
                    val apiService = ApiClient.apiService
                    val response = apiService.getLatestLocation(deviceId)
                    if (response.isSuccessful && response.body() != null) {
                        val locationData = response.body()!!
                        val latLng = LatLng(locationData.latitude, locationData.longitude)
                        currentLocation = latLng

                        // Only animate camera if we don't have routes (routes will handle camera positioning)
                        if (routes.isEmpty()) {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newCameraPosition(
                                    CameraPosition.fromLatLngZoom(latLng, 15f)
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    android.util.Log.e("MapScreen", "Failed to get latest location: ${e.message}", e)
                }
            }
        }
    }

    // Load routes when screen becomes visible or when trigger changes
    LaunchedEffect(organizationData?.deviceData?.id, reloadRoutesTrigger) {
        val deviceId = organizationData?.deviceData?.id
        if (deviceId != null && googleMapsApiKey.isNotEmpty()) {
            android.util.Log.d("MapScreen", "Loading routes triggered by reloadRoutesTrigger=$reloadRoutesTrigger")
            loadRoutesForAcceptedTasks(deviceId)
        } else {
            android.util.Log.d("MapScreen", "Cannot load routes: deviceId=$deviceId, apiKey=${googleMapsApiKey.isNotEmpty()}")
        }
    }

    // Poll for route updates every 30 seconds
    LaunchedEffect(organizationData?.deviceData?.id) {
        val deviceId = organizationData?.deviceData?.id
        if (deviceId != null && googleMapsApiKey.isNotEmpty()) {
            while (true) {
                kotlinx.coroutines.delay(30000)
                android.util.Log.d("MapScreen", "Polling for route updates")
                loadRoutesForAcceptedTasks(deviceId)
            }
        }
    }

    // Reload routes when composable is first displayed (runs every time MapScreen enters composition)
    LaunchedEffect(Unit) {
        android.util.Log.d("MapScreen", "MapScreen composable first displayed, triggering route reload")
        reloadRoutesTrigger++
    }

    // Update location when available (only if permissions granted)
    // Note: Routes will update automatically when location changes via the polling mechanism
    LaunchedEffect(currentLocationState.value) {
        if (locationPermissionsState.allPermissionsGranted) {
            currentLocationState.value?.let { location ->
                val latLng = LatLng(location.latitude, location.longitude)
                currentLocation = latLng
                // Only update camera if we don't have routes (routes manage camera positioning)
                if (routes.isEmpty()) {
                    cameraPositionState.animate(
                        CameraUpdateFactory.newCameraPosition(
                            CameraPosition.fromLatLngZoom(latLng, cameraPositionState.position.zoom)
                        )
                    )
                }
            }
        }
    }

    // Start location updates when permissions granted (safely)
    LaunchedEffect(locationPermissionsState.allPermissionsGranted) {
        try {
            if (locationPermissionsState.allPermissionsGranted) {
                if (locationController.hasLocationPermission()) {
                    locationController.startLocationUpdates()
                }
            } else {
                locationController.stopLocationUpdates()
            }
        } catch (e: Exception) {
            android.util.Log.e("MapScreen", "Error managing location updates: ${e.message}")
        }
    }

    // Cleanup on dispose
    DisposableEffect(Unit) {
        onDispose {
            try {
                locationController.stopLocationUpdates()
            } catch (e: Exception) {
                android.util.Log.e("MapScreen", "Error stopping location updates: ${e.message}")
            }
        }
    }

    LocationtrackerandroidTheme {
        Surface(
            modifier = modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                // Always show map (using server location if no permissions)
                GoogleMap(
                    modifier = Modifier.fillMaxSize(),
                    cameraPositionState = cameraPositionState,
                    properties = MapProperties(
                        // Only enable my location if permissions are granted
                        isMyLocationEnabled = locationPermissionsState.allPermissionsGranted && locationController.hasLocationPermission(),
                        mapType = MapType.NORMAL
                    ),
                    uiSettings = MapUiSettings(
                        myLocationButtonEnabled = locationPermissionsState.allPermissionsGranted && locationController.hasLocationPermission(),
                        zoomControlsEnabled = true,
                        compassEnabled = true
                    ),
                    onMapLoaded = {
                        // Map loaded - ensure camera is at correct location
                        coroutineScope.launch {
                            try {
                                cameraPositionState.animate(
                                    CameraUpdateFactory.newCameraPosition(
                                        CameraPosition.fromLatLngZoom(currentLocation, 15f)
                                    )
                                )
                            } catch (e: Exception) {
                                android.util.Log.e("MapScreen", "Error animating camera: ${e.message}")
                            }
                        }
                    }
                ) {
                    // Add marker for current location (server location)
                    Marker(
                        state = MarkerState(position = currentLocation),
                        title = "Current Location",
                        snippet = "Lat: ${currentLocation.latitude}, Lng: ${currentLocation.longitude}"
                    )

                    // Add marker for target location if we have an accepted location task
                    targetLocation?.let { target ->
                        Marker(
                            state = MarkerState(position = target),
                            title = "Target Location",
                            snippet = "Lat: ${target.latitude}, Lng: ${target.longitude}"
                        )
                    }

                    // Draw routes with color coding (green = shortest, red = longest)
                    routes.forEach { (task, taskRoutes) ->
                        if (taskRoutes.isNotEmpty()) {
                            // Sort routes by distance to ensure proper color assignment
                            val sortedRoutes = taskRoutes.sortedBy { it.distance }.take(5)
                            val minDistance = sortedRoutes.firstOrNull()?.distance ?: 0
                            val maxDistance = sortedRoutes.lastOrNull()?.distance ?: 1

                            sortedRoutes.forEachIndexed { index, route ->
                                // Calculate ratio (0.0 = shortest, 1.0 = longest)
                                val ratio = if (maxDistance > minDistance) {
                                    (route.distance - minDistance).toFloat() / (maxDistance - minDistance).toFloat()
                                } else {
                                    0f
                                }

                                // Color gradient: Green -> Yellow -> Orange -> Red
                                // Green: RGB(76, 175, 80) = 0x4CAF50
                                // Yellow: RGB(255, 235, 59) = 0xFFEB3B
                                // Orange: RGB(255, 152, 0) = 0xFF9800
                                // Red: RGB(244, 67, 54) = 0xF44336

                                val color = if (sortedRoutes.size == 1) {
                                    // Single route: green
                                    Color(0xFF4CAF50)
                                } else {
                                    // Multiple routes: gradient based on ratio
                                    val red: Int
                                    val green: Int
                                    val blue: Int

                                    when {
                                        ratio <= 0.33f -> {
                                            // Green to Yellow (0.0 to 0.33)
                                            val localRatio = ratio / 0.33f
                                            red = (76 + (255 - 76) * localRatio).toInt().coerceIn(0, 255)
                                            green = (175 + (235 - 175) * localRatio).toInt().coerceIn(0, 255)
                                            blue = (80 + (59 - 80) * localRatio).toInt().coerceIn(0, 255)
                                        }
                                        ratio <= 0.66f -> {
                                            // Yellow to Orange (0.33 to 0.66)
                                            val localRatio = (ratio - 0.33f) / 0.33f
                                            red = (255 + (255 - 255) * localRatio).toInt().coerceIn(0, 255)
                                            green = (235 + (152 - 235) * localRatio).toInt().coerceIn(0, 255)
                                            blue = (59 + (0 - 59) * localRatio).toInt().coerceIn(0, 255)
                                        }
                                        else -> {
                                            // Orange to Red (0.66 to 1.0)
                                            val localRatio = (ratio - 0.66f) / 0.34f
                                            red = (255 + (244 - 255) * localRatio).toInt().coerceIn(0, 255)
                                            green = (152 + (67 - 152) * localRatio).toInt().coerceIn(0, 255)
                                            blue = (0 + (54 - 0) * localRatio).toInt().coerceIn(0, 255)
                                        }
                                    }

                                    Color(android.graphics.Color.rgb(red, green, blue))
                                }

                                Polyline(
                                    points = route.points,
                                    color = color,
                                    width = 12f,
                                    pattern = null
                                )
                            }
                        }
                    }
                }

                // Show floating action button to request permissions if not granted
                if (!locationPermissionsState.allPermissionsGranted) {
                    FloatingActionButton(
                        onClick = { showPermissionDialog = true },
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(16.dp),
                        containerColor = MaterialTheme.colorScheme.primary
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Enable Location",
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            }

            // Permission request dialog
            if (showPermissionDialog) {
                AlertDialog(
                    onDismissRequest = { showPermissionDialog = false },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    title = {
                        Text("Enable Location Features")
                    },
                    text = {
                        Text("Allow location access to show your current position on the map and enable real-time location tracking.")
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                showPermissionDialog = false
                                locationPermissionsState.launchMultiplePermissionRequest()
                            }
                        ) {
                            Text("Enable Location")
                        }
                    },
                    dismissButton = {
                        TextButton(
                            onClick = { showPermissionDialog = false }
                        ) {
                            Text("Cancel")
                        }
                    }
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MapScreenPreview() {
    LocationtrackerandroidTheme {
        MapScreen()
    }
}

