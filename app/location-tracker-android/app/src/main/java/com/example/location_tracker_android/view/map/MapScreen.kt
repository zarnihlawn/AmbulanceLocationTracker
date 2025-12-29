package com.example.location_tracker_android.view.map

import android.Manifest
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.LocationController
import com.example.location_tracker_android.controller.ApiClient
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
    
    // Request location permissions
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
    
    val currentLocationState = locationController.currentLocation.collectAsState()

    // Get latest location from server when map screen is opened
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
                        cameraPositionState.animate(
                            CameraUpdateFactory.newCameraPosition(
                                CameraPosition.fromLatLngZoom(latLng, 15f)
                            )
                        )
                    }
                } catch (e: Exception) {
                    android.util.Log.e("MapScreen", "Failed to get latest location: ${e.message}")
                }
            }
        }
    }

    // Update location when available (for UI display)
    LaunchedEffect(currentLocationState.value) {
        currentLocationState.value?.let { location ->
            val latLng = LatLng(location.latitude, location.longitude)
            currentLocation = latLng
            // Update camera to show current location (preserve zoom level)
            cameraPositionState.animate(
                CameraUpdateFactory.newCameraPosition(
                    CameraPosition.fromLatLngZoom(latLng, cameraPositionState.position.zoom)
                )
            )
        }
    }

    // Start location updates when permissions granted (for map display only)
    LaunchedEffect(locationPermissionsState.allPermissionsGranted) {
        if (locationPermissionsState.allPermissionsGranted) {
            locationController.startLocationUpdates()
        } else {
            locationController.stopLocationUpdates()
        }
    }

    // Cleanup on dispose
    DisposableEffect(Unit) {
        onDispose {
            locationController.stopLocationUpdates()
        }
    }

    LocationtrackerandroidTheme {
        Surface(
            modifier = modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            if (!locationPermissionsState.allPermissionsGranted) {
                // Permission request screen
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Location",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Location Permission Required",
                        style = MaterialTheme.typography.headlineMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "This app needs location access to track your position on the map",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { locationPermissionsState.launchMultiplePermissionRequest() }
                    ) {
                        Text("Grant Location Permission")
                    }
                }
            } else {
                // Google Maps
                GoogleMap(
                    modifier = Modifier.fillMaxSize(),
                    cameraPositionState = cameraPositionState,
                    properties = MapProperties(
                        isMyLocationEnabled = true,
                        mapType = MapType.NORMAL
                    ),
                    uiSettings = MapUiSettings(
                        myLocationButtonEnabled = true,
                        zoomControlsEnabled = true,
                        compassEnabled = true
                    ),
                    onMapLoaded = {
                        // Map loaded - ensure camera is at correct location
                        coroutineScope.launch {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newCameraPosition(
                                    CameraPosition.fromLatLngZoom(currentLocation, 15f)
                                )
                            )
                        }
                    }
                ) {
                    // Add marker for current location
                    Marker(
                        state = MarkerState(position = currentLocation),
                        title = "Current Location",
                        snippet = "Lat: ${currentLocation.latitude}, Lng: ${currentLocation.longitude}"
                    )
                }
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

