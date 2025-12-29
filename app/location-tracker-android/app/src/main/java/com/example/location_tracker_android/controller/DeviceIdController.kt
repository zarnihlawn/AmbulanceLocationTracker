package com.example.location_tracker_android.controller

import android.content.Context
import android.provider.Settings
import java.security.MessageDigest

/**
 * Controller: Device ID Generation
 * Generates a unique, crypto-based device ID from device information
 */
class DeviceIdController(private val context: Context) {

    /**
     * Generate a unique device ID using crypto hash
     * Combines multiple device identifiers for uniqueness
     */
    fun generateDeviceId(): String {
        val deviceInfo = buildDeviceInfoString()
        return hashString(deviceInfo)
    }

    /**
     * Build a unique string from device information
     */
    private fun buildDeviceInfoString(): String {
        val androidId = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        ) ?: "unknown"

        val deviceInfo = StringBuilder().apply {
            append(androidId)
            append("|")
            append(android.os.Build.MANUFACTURER)
            append("|")
            append(android.os.Build.MODEL)
            append("|")
            @Suppress("DEPRECATION")
            append(android.os.Build.SERIAL)
            append("|")
            append(android.os.Build.FINGERPRINT)
        }

        return deviceInfo.toString()
    }

    /**
     * Hash the device info string using SHA-256
     * Returns a 64-character hexadecimal string
     */
    private fun hashString(input: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(input.toByteArray())
        return hashBytes.joinToString("") { "%02x".format(it) }
    }

    /**
     * Get a formatted device ID (with dashes for readability)
     * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     */
    fun getFormattedDeviceId(): String {
        val deviceId = generateDeviceId()
        return deviceId.chunked(8).joinToString("-")
    }
}

