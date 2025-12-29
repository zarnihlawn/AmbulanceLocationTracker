package com.example.location_tracker_android.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.location_tracker_android.MainActivity

/**
 * Service: Notification Service
 * Handles system notifications for tasks and other events
 */
object NotificationService {
    private const val CHANNEL_ID = "task_notifications_channel"
    private const val CHANNEL_NAME = "Task Notifications"
    private const val NOTIFICATION_ID_BASE = 1000

    /**
     * Create notification channel for Android O+
     */
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for new tasks and task updates"
                enableVibration(true)
                enableLights(true)
            }
            val notificationManager = context.getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * Show notification for a new task
     */
    fun showTaskNotification(context: Context, taskId: String, title: String, message: String) {
        createNotificationChannel(context)

        // Create intent to open the app and navigate to notifier screen
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigateTo", "notifier")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setAutoCancel(true)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        // Use taskId hash to create unique notification ID for each task
        val notificationId = NOTIFICATION_ID_BASE + taskId.hashCode()
        notificationManager.notify(notificationId, notification)
    }

    /**
     * Cancel notification for a specific task
     */
    fun cancelTaskNotification(context: Context, taskId: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notificationId = NOTIFICATION_ID_BASE + taskId.hashCode()
        notificationManager.cancel(notificationId)
    }

    /**
     * Cancel all task notifications
     */
    fun cancelAllTaskNotifications(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancelAll()
    }
}

