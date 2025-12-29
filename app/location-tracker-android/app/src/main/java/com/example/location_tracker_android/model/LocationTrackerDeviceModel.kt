package com.example.location_tracker_android.model

/**
 * Model: Location Tracker Device models
 */

/**
 * Request model for registering a device
 */
data class LocationTrackerDeviceRegisterRequest(
    val workspaceId: String,
    val deviceKey: String,
    val secretKey: String,
    val deviceOs: String,
    val deviceOsVersion: String,
    val deviceModel: String,
    val appVersion: String
)

/**
 * Response model for device registration
 */
data class LocationTrackerDeviceResponse(
    val id: String,
    val workspaceId: String,
    val secretKey: String?,
    val deviceKey: String?,
    val deviceOs: String?,
    val deviceOsVersion: String?,
    val deviceModel: String?,
    val appVersion: String?,
    val name: String?,
    val description: String?,
    val isAccepted: Boolean,
    val createdAt: String,
    val updatedAt: String
)

