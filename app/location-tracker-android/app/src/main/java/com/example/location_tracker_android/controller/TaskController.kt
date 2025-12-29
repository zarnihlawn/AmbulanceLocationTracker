package com.example.location_tracker_android.controller

import com.example.location_tracker_android.model.LocationTrackerTask
import com.example.location_tracker_android.model.UpdateTaskStatusRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Controller: Task Controller
 * Handles task-related operations
 */
object TaskController {
    private val apiService = ApiClient.apiService

    /**
     * Get tasks for a device
     */
    suspend fun getTasksByDeviceId(deviceId: String): Result<List<LocationTrackerTask>> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getTasksByDeviceId(deviceId)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to fetch tasks: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Update task status (accept, reject, na, or complete)
     */
    suspend fun updateTaskStatus(
        taskId: String,
        status: String,
        responseMessage: String? = null
    ): Result<LocationTrackerTask> {
        return withContext(Dispatchers.IO) {
            try {
                val request = UpdateTaskStatusRequest(status, responseMessage)
                val response = apiService.updateTaskStatus(taskId, request)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to update task: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}

