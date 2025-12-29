package com.example.location_tracker_android.controller

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build

/**
 * Controller: Device Information
 * Gets device details like OS version, model, app version
 */
class DeviceInfoController(private val context: Context) {

    /**
     * Get device OS name
     */
    fun getDeviceOs(): String {
        return "Android"
    }

    /**
     * Get device OS version
     */
    fun getDeviceOsVersion(): String {
        return Build.VERSION.RELEASE ?: "Unknown"
    }

    /**
     * Get device model
     */
    fun getDeviceModel(): String {
        return "${Build.MANUFACTURER} ${Build.MODEL}".trim()
    }

    /**
     * Get app version name
     */
    fun getAppVersion(): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_ACTIVITIES
            )
            packageInfo.versionName ?: "1.0.0"
        } catch (e: PackageManager.NameNotFoundException) {
            "1.0.0"
        }
    }

    /**
     * Get all device information as a map
     */
    fun getDeviceInfo(): Map<String, String> {
        return mapOf(
            "os" to getDeviceOs(),
            "osVersion" to getDeviceOsVersion(),
            "model" to getDeviceModel(),
            "appVersion" to getAppVersion()
        )
    }
}

