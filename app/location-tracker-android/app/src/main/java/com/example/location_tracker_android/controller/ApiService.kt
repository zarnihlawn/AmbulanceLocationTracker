package com.example.location_tracker_android.controller

import com.example.location_tracker_android.model.ApiResponse
import com.example.location_tracker_android.model.LocationTrackerDeviceRegisterRequest
import com.example.location_tracker_android.model.LocationTrackerDeviceResponse
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.model.OrganizationLoginRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Controller: API Service Interface
 * Defines endpoints for server communication
 */
interface ApiService {
    /**
     * Connect/login to organization
     * POST /api/organization/login or similar endpoint
     */
    @POST("api/organization/login")
    suspend fun loginOrganization(
        @Body request: OrganizationLoginRequest
    ): Response<ApiResponse<OrganizationData>>

    /**
     * Register location tracker device
     * POST /api/location-tracker-device/
     */
    @POST("api/location-tracker-device/")
    suspend fun registerDevice(
        @Body request: LocationTrackerDeviceRegisterRequest
    ): Response<LocationTrackerDeviceResponse>

    /**
     * Get device by device key
     * GET /api/location-tracker-device/deviceKey/:deviceKey
     */
    @GET("api/location-tracker-device/deviceKey/{deviceKey}")
    suspend fun getDeviceByDeviceKey(
        @retrofit2.http.Path("deviceKey") deviceKey: String
    ): Response<LocationTrackerDeviceResponse>

    /**
     * Test connection endpoint - uses gateway health check
     */
    @GET("/")
    suspend fun testConnection(): Response<Map<String, Any>>

    /**
     * Send location tracking update
     * POST /api/location-tracker-tracking/
     */
    @POST("api/location-tracker-tracking/")
    suspend fun sendLocationTracking(
        @Body request: com.example.location_tracker_android.model.LocationTrackingRequest
    ): Response<com.example.location_tracker_android.model.LocationTrackingResponse>
    
    /**
     * Get latest location for a device
     * GET /api/location-tracker-tracking/device/:deviceId/latest
     */
    @GET("api/location-tracker-tracking/device/{deviceId}/latest")
    suspend fun getLatestLocation(
        @retrofit2.http.Path("deviceId") deviceId: String
    ): Response<com.example.location_tracker_android.model.LocationTrackingResponse>
    
    /**
     * Get tasks for a device
     * GET /api/location-tracker-device/task/device/:deviceId
     */
    @GET("api/location-tracker-device/task/device/{deviceId}")
    suspend fun getTasksByDeviceId(
        @retrofit2.http.Path("deviceId") deviceId: String
    ): Response<List<com.example.location_tracker_android.model.LocationTrackerTask>>
    
    /**
     * Update task status
     * PATCH /api/location-tracker-device/task/:taskId/status
     */
    @retrofit2.http.PATCH("api/location-tracker-device/task/{taskId}/status")
    suspend fun updateTaskStatus(
        @retrofit2.http.Path("taskId") taskId: String,
        @Body request: com.example.location_tracker_android.model.UpdateTaskStatusRequest
    ): Response<com.example.location_tracker_android.model.LocationTrackerTask>
}

