package com.example.location_tracker_android.controller

import com.example.location_tracker_android.model.LocationTrackerDeviceRegisterRequest
import com.example.location_tracker_android.model.LocationTrackerDeviceResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Controller: Location Tracker Device Registration
 * Handles device registration with the server
 */
class LocationTrackerDeviceController(
    private val deviceInfoController: DeviceInfoController,
    private val deviceIdController: DeviceIdController,
    private val apiService: ApiService = ApiClient.apiService
) {

    /**
     * Validate registration data
     */
    fun validateRegistrationData(
        workspaceId: String,
        secretKey: String
    ): ValidationResult {
        return when {
            workspaceId.isBlank() -> ValidationResult.Error("Workspace ID is required")
            secretKey.isBlank() -> ValidationResult.Error("Secret Key is required")
            workspaceId.length < 3 -> ValidationResult.Error("Workspace ID must be at least 3 characters")
            secretKey.length < 8 -> ValidationResult.Error("Secret Key appears to be invalid")
            else -> ValidationResult.Success
        }
    }

    /**
     * Register device with server
     * @return RegistrationResult with success status and device info
     */
    suspend fun registerDevice(
        workspaceId: String,
        secretKey: String
    ): RegistrationResult = withContext(Dispatchers.IO) {
        try {
            // Get device key (from DeviceIdController)
            val deviceKey = deviceIdController.generateDeviceId()

            // Get device information
            val deviceInfo = deviceInfoController.getDeviceInfo()

            // Create registration request
            val request = LocationTrackerDeviceRegisterRequest(
                workspaceId = workspaceId.trim(),
                deviceKey = deviceKey,
                secretKey = secretKey.trim(),
                deviceOs = deviceInfo["os"] ?: "Android",
                deviceOsVersion = deviceInfo["osVersion"] ?: "Unknown",
                deviceModel = deviceInfo["model"] ?: "Unknown",
                appVersion = deviceInfo["appVersion"] ?: "1.0.0"
            )

            // Make API call
            val response = apiService.registerDevice(request)

            if (response.isSuccessful && response.body() != null) {
                val deviceResponse = response.body()!!
                RegistrationResult.Success(deviceResponse)
            } else {
                // Try to parse error message
                val errorMessage = try {
                    response.errorBody()?.string() ?: "Registration failed with code: ${response.code()}"
                } catch (e: Exception) {
                    "Registration failed with code: ${response.code()}"
                }
                RegistrationResult.Error(errorMessage)
            }
        } catch (e: java.net.UnknownHostException) {
            RegistrationResult.Error("Cannot connect to server. Please check if server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.ConnectException) {
            RegistrationResult.Error("Connection refused. Please ensure server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.SocketTimeoutException) {
            RegistrationResult.Error("Connection timeout. Server may be unreachable.")
        } catch (e: Exception) {
            RegistrationResult.Error("Registration error: ${e.message ?: "Unknown error"}")
        }
    }

    /**
     * Validation result sealed class
     */
    sealed class ValidationResult {
        object Success : ValidationResult()
        data class Error(val message: String) : ValidationResult()
    }

    /**
     * Check device status by device key
     */
    suspend fun checkDeviceStatus(deviceKey: String): StatusResult = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getDeviceByDeviceKey(deviceKey)

            if (response.isSuccessful && response.body() != null) {
                StatusResult.Found(response.body()!!)
            } else {
                StatusResult.NotFound
            }
        } catch (e: Exception) {
            StatusResult.Error(e.message ?: "Unknown error")
        }
    }

    /**
     * Registration result sealed class
     */
    sealed class RegistrationResult {
        data class Success(val device: LocationTrackerDeviceResponse) : RegistrationResult()
        data class Error(val message: String) : RegistrationResult()
    }

    /**
     * Status check result sealed class
     */
    sealed class StatusResult {
        data class Found(val device: LocationTrackerDeviceResponse) : StatusResult()
        object NotFound : StatusResult()
        data class Error(val message: String) : StatusResult()
    }
}

