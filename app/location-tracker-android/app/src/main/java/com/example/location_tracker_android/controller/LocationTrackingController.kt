package com.example.location_tracker_android.controller

import android.location.Location
import com.example.location_tracker_android.model.LocationTrackingRequest
import com.example.location_tracker_android.model.LocationTrackingResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Controller: Location Tracking
 * Handles sending location updates to the server
 */
class LocationTrackingController(
    private val apiService: ApiService = ApiClient.apiService
) {
    /**
     * Send location update to server
     * @param deviceId The device UUID from location_tracker_device table
     * @param location The Android Location object
     * @return Result with success status
     */
    suspend fun sendLocationUpdate(
        deviceId: String,
        location: Location
    ): TrackingResult = withContext(Dispatchers.IO) {
        try {
            val request = LocationTrackingRequest(
                deviceId = deviceId,
                latitude = location.latitude,
                longitude = location.longitude,
                accuracy = if (location.hasAccuracy()) location.accuracy.toDouble() else null,
                altitude = if (location.hasAltitude()) location.altitude else null,
                speed = if (location.hasSpeed()) location.speed.toDouble() else null,
                heading = if (location.hasBearing()) location.bearing.toDouble() else null
            )

            val response = apiService.sendLocationTracking(request)

            if (response.isSuccessful && response.body() != null) {
                TrackingResult.Success(response.body()!!)
            } else {
                val errorMessage = try {
                    response.errorBody()?.string() ?: "Failed to send location update: ${response.code()}"
                } catch (e: Exception) {
                    "Failed to send location update: ${response.code()}"
                }
                TrackingResult.Error(errorMessage)
            }
        } catch (e: java.net.UnknownHostException) {
            TrackingResult.Error("Cannot connect to server. Please check if server is running.")
        } catch (e: java.net.ConnectException) {
            TrackingResult.Error("Connection refused. Please ensure server is running.")
        } catch (e: java.net.SocketTimeoutException) {
            TrackingResult.Error("Connection timeout. Server may be unreachable.")
        } catch (e: Exception) {
            TrackingResult.Error("Error sending location update: ${e.message ?: "Unknown error"}")
        }
    }

    /**
     * Tracking result sealed class
     */
    sealed class TrackingResult {
        data class Success(val response: LocationTrackingResponse) : TrackingResult()
        data class Error(val message: String) : TrackingResult()
    }
}

