package com.example.location_tracker_android.model

/**
 * Model: Task-related models
 */

/**
 * Task model from server
 */
data class LocationTrackerTask(
    val id: String,
    val deviceId: String,
    val type: String, // "text" or "location"
    val title: String,
    val description: String?,
    val targetLatitude: String?,
    val targetLongitude: String?,
    val status: String, // "pending", "accepted", "rejected", "na", "completed"
    val responseMessage: String?,
    val metadata: Map<String, Any>?,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String?,
    val respondedAt: String?
)

/**
 * Request to update task status
 */
data class UpdateTaskStatusRequest(
    val status: String, // "accepted", "rejected", "na", "completed"
    val responseMessage: String? = null
)

