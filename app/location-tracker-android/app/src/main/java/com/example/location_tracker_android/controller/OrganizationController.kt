package com.example.location_tracker_android.controller

import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.model.OrganizationLoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Controller: Organization/Login Logic
 * Handles organization login business logic and server communication
 */
class OrganizationController(
    private val deviceIdController: DeviceIdController,
    private val deviceInfoController: DeviceInfoController? = null,
    private val apiService: ApiService = ApiClient.apiService
) {

    /**
     * Get the device ID (auto-generated, unique to device)
     */
    fun getDeviceId(): String {
        return deviceIdController.generateDeviceId()
    }

    /**
     * Get formatted device ID for display
     */
    fun getFormattedDeviceId(): String {
        return deviceIdController.getFormattedDeviceId()
    }

    /**
     * Validate organization data
     */
    fun validateOrganizationData(
        organizationId: String,
        workspaceId: String
    ): ValidationResult {
        return when {
            organizationId.isBlank() -> ValidationResult.Error("Organization ID is required")
            workspaceId.isBlank() -> ValidationResult.Error("Workspace ID is required")
            organizationId.length < 3 -> ValidationResult.Error("Organization ID must be at least 3 characters")
            workspaceId.length < 3 -> ValidationResult.Error("Workspace ID must be at least 3 characters")
            else -> ValidationResult.Success
        }
    }

    /**
     * Create organization data model
     */
    fun createOrganizationData(
        organizationId: String,
        workspaceId: String
    ): OrganizationData {
        return OrganizationData(
            organizationId = organizationId.trim(),
            workspaceId = workspaceId.trim(),
            deviceId = getDeviceId()
        )
    }

    /**
     * Connect to server - just checks if server is reachable
     * @return LoginResult with success status
     */
    suspend fun connectToServer(
        organizationId: String,
        workspaceId: String
    ): LoginResult = withContext(Dispatchers.IO) {
        try {
            // Just test connection using health check
            val response = apiService.testConnection()

            if (response.isSuccessful && response.body() != null) {
                // Connection successful - create dummy organization data to proceed
                val deviceId = getDeviceId()
                val orgData = OrganizationData(
                    organizationId = organizationId.trim(),
                    workspaceId = workspaceId.trim(),
                    deviceId = deviceId
                )
                LoginResult.Success(orgData)
            } else {
                LoginResult.Error("Server responded with error: ${response.code()}")
            }
        } catch (e: java.net.UnknownHostException) {
            LoginResult.Error("Cannot connect to server. Please check if server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.ConnectException) {
            LoginResult.Error("Connection refused. Please ensure server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.SocketTimeoutException) {
            LoginResult.Error("Connection timeout. Server may be unreachable.")
        } catch (e: Exception) {
            LoginResult.Error("Connection error: ${e.message ?: "Unknown error"}")
        }
    }

    /**
     * Test server connection
     */
    suspend fun testConnection(): ConnectionResult = withContext(Dispatchers.IO) {
        try {
            val response = apiService.testConnection()
            if (response.isSuccessful) {
                ConnectionResult.Success("Server is reachable")
            } else {
                ConnectionResult.Error("Server responded with error: ${response.code()}")
            }
        } catch (e: java.net.UnknownHostException) {
            ConnectionResult.Error("Cannot connect to server. Please check if server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.ConnectException) {
            ConnectionResult.Error("Connection refused. Please ensure server is running at ${ApiClient.getBaseUrl()}")
        } catch (e: java.net.SocketTimeoutException) {
            ConnectionResult.Error("Connection timeout. Server may be unreachable.")
        } catch (e: Exception) {
            ConnectionResult.Error("Cannot connect to server: ${e.message ?: "Unknown error"}")
        }
    }

    /**
     * Save organization data (placeholder for future persistence)
     */
    fun saveOrganizationData(data: OrganizationData): Boolean {
        // TODO: Implement persistence (SharedPreferences, Room, etc.)
        return data.isValid()
    }

    /**
     * Validation result sealed class
     */
    sealed class ValidationResult {
        object Success : ValidationResult()
        data class Error(val message: String) : ValidationResult()
    }

    /**
     * Login result sealed class
     */
    sealed class LoginResult {
        data class Success(val data: OrganizationData) : LoginResult()
        data class Error(val message: String) : LoginResult()
    }

    /**
     * Connection test result sealed class
     */
    sealed class ConnectionResult {
        data class Success(val message: String) : ConnectionResult()
        data class Error(val message: String) : ConnectionResult()
    }
}

