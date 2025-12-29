package com.example.location_tracker_android.model

/**
 * Model: Base model interface
 * All data models should implement or extend this
 */
interface BaseModel {
    // Common model properties can be added here
}

/**
 * Model: Base data class for location tracking
 * This is a placeholder for future location data models
 */
data class LocationData(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val timestamp: Long = System.currentTimeMillis(),
    val accuracy: Float = 0f
) : BaseModel

