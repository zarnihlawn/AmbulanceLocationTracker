package com.example.location_tracker_android.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.example.location_tracker_android.MainActivity
import com.example.location_tracker_android.R
import com.example.location_tracker_android.controller.LocationTrackingController
import com.google.android.gms.location.*
import kotlinx.coroutines.*
import android.util.Log

/**
 * Foreground Service for continuous location tracking
 * Runs in the background even when app is closed
 */
class LocationTrackingService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationTrackingController: LocationTrackingController
    private var locationCallback: LocationCallback? = null
    private var deviceId: String? = null
    
    companion object {
        private const val TAG = "LocationTrackingService"
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "location_tracking_channel"
        private const val PREFS_NAME = "location_tracking_prefs"
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_IS_TRACKING = "is_tracking"
        
        private const val LOCATION_UPDATE_INTERVAL_MS = 10_000L // 10 seconds
        private const val FASTEST_UPDATE_INTERVAL_MS = 5_000L // 5 seconds
        
        /**
         * Start the location tracking service
         */
        fun startService(context: Context, deviceId: String) {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                putExtra(KEY_DEVICE_ID, deviceId)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            
            // Save device ID and tracking state
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_DEVICE_ID, deviceId)
                .putBoolean(KEY_IS_TRACKING, true)
                .apply()
        }
        
        /**
         * Stop the location tracking service
         */
        fun stopService(context: Context) {
            val intent = Intent(context, LocationTrackingService::class.java)
            context.stopService(intent)
            
            // Clear tracking state
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_IS_TRACKING, false)
                .apply()
        }
        
        /**
         * Check if service is currently tracking
         */
        fun isTracking(context: Context): Boolean {
            return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getBoolean(KEY_IS_TRACKING, false)
        }
        
        /**
         * Get the current device ID being tracked
         */
        fun getDeviceId(context: Context): String? {
            return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(KEY_DEVICE_ID, null)
        }
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
        
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        locationTrackingController = LocationTrackingController()
        
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        
        // Load device ID from preferences if not provided in intent
        deviceId = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_DEVICE_ID, null)
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service started")
        
        // Get device ID from intent or preferences
        deviceId = intent?.getStringExtra(KEY_DEVICE_ID) 
            ?: getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(KEY_DEVICE_ID, null)
        
        if (deviceId == null) {
            Log.e(TAG, "Device ID is null, stopping service")
            stopSelf()
            return START_NOT_STICKY
        }
        
        startLocationUpdates()
        
        // Return START_STICKY to restart service if killed by system
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
        stopLocationUpdates()
        serviceScope.cancel()
        
        // Clear tracking state
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_IS_TRACKING, false)
            .apply()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks your location and sends updates to the server"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText("Tracking your location and sending updates")
            .setSmallIcon(android.R.drawable.ic_dialog_map)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
    
    private fun startLocationUpdates() {
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            LOCATION_UPDATE_INTERVAL_MS
        ).apply {
            setMinUpdateIntervalMillis(FASTEST_UPDATE_INTERVAL_MS)
            setMaxUpdateDelayMillis(LOCATION_UPDATE_INTERVAL_MS)
        }.build()
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    sendLocationUpdate(location)
                }
            }
        }
        
        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                Looper.getMainLooper()
            )
            Log.d(TAG, "Location updates started")
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permission not granted", e)
            stopSelf()
        }
    }
    
    private fun stopLocationUpdates() {
        locationCallback?.let {
            fusedLocationClient.removeLocationUpdates(it)
            locationCallback = null
            Log.d(TAG, "Location updates stopped")
        }
    }
    
    private fun sendLocationUpdate(location: Location) {
        val currentDeviceId = deviceId ?: return
        
        serviceScope.launch {
            try {
                val result = locationTrackingController.sendLocationUpdate(
                    currentDeviceId,
                    location
                )
                when (result) {
                    is LocationTrackingController.TrackingResult.Success -> {
                        Log.d(TAG, "Location sent: ${location.latitude}, ${location.longitude}")
                    }
                    is LocationTrackingController.TrackingResult.Error -> {
                        Log.e(TAG, "Failed to send location: ${result.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error sending location update", e)
            }
        }
    }
}

