package com.example.location_tracker_android.model

/**
 * Model: API Request/Response models
 */

/**
 * Request model for organization login
 */
data class OrganizationLoginRequest(
    val organizationId: String,
    val workspaceId: String,
    val deviceId: String
)

/**
 * Response model for organization login
 */
data class OrganizationLoginResponse(
    val success: Boolean,
    val message: String? = null,
    val data: OrganizationData? = null
)

/**
 * Generic API response wrapper
 */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T? = null
)

/**
 * Request model for location tracking
 */
data class LocationTrackingRequest(
    val deviceId: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null,
    val altitude: Double? = null,
    val speed: Double? = null,
    val heading: Double? = null
)

/**
 * Response model for location tracking
 */
data class LocationTrackingResponse(
    val id: String,
    val deviceId: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double?,
    val altitude: Double?,
    val speed: Double?,
    val heading: Double?,
    val createdAt: String
)

