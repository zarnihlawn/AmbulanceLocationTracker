package com.example.location_tracker_android.model

/**
 * Model: Organization data
 * Contains organization ID, workspace ID, device ID, and device info
 */
data class OrganizationData(
    val organizationId: String = "",
    val workspaceId: String = "",
    val deviceId: String = "",
    val deviceData: LocationTrackerDeviceResponse? = null
) : BaseModel {
    /**
     * Check if organization data is valid
     */
    fun isValid(): Boolean {
        return organizationId.isNotBlank() &&
                workspaceId.isNotBlank() &&
                deviceId.isNotBlank()
    }
}

