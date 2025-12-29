package com.example.location_tracker_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.example.location_tracker_android.config.ApiConfig
import com.example.location_tracker_android.controller.DeviceIdController
import com.example.location_tracker_android.controller.DeviceInfoController
import com.example.location_tracker_android.controller.LocationTrackerDeviceController
import com.example.location_tracker_android.controller.OrganizationController
import com.example.location_tracker_android.controller.SplashController
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import com.example.location_tracker_android.view.home.HomeScreen
import com.example.location_tracker_android.view.organization.OrganizationScreen
import com.example.location_tracker_android.view.splash.SplashScreen
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope

/**
 * Main Activity - Entry point of the application
 * Follows MVC architecture pattern:
 * - Model: Data classes in model package
 * - View: UI components in view package
 * - Controller: Business logic in controller package
 *
 * Navigation Flow:
 * 1. Splash Screen
 * 2. Organization/Login Screen
 * 3. Home Screen
 */
class MainActivity : ComponentActivity() {
    private val splashController = SplashController()
    private lateinit var deviceIdController: DeviceIdController
    private lateinit var deviceInfoController: DeviceInfoController
    private lateinit var locationTrackerDeviceController: LocationTrackerDeviceController
    private lateinit var organizationController: OrganizationController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Configure API environment (HOME or OFFICE)
        // Change this to ApiConfig.Environment.OFFICE when at office
        ApiConfig.setEnvironment(ApiConfig.Environment.OFFICE) // Uncomment for office

        // Initialize controllers
        deviceIdController = DeviceIdController(this)
        deviceInfoController = DeviceInfoController(this)
        locationTrackerDeviceController = LocationTrackerDeviceController(
            deviceInfoController,
            deviceIdController
        )
        organizationController = OrganizationController(
            deviceIdController,
            deviceInfoController
        )

        setContent {
            MainContent()
        }
    }

    @Composable
    private fun MainContent() {
        // Navigation state
        var showSplash by remember { mutableStateOf(true) }
        var showOrganization by remember { mutableStateOf(false) }
        var showHome by remember { mutableStateOf(false) }
        var organizationData by remember { mutableStateOf<OrganizationData?>(null) }
        val coroutineScope = rememberCoroutineScope()

        when {
            showSplash -> {
                // View: Display splash screen UI
                SplashScreen(
                    onAnimationComplete = {
                        // Animation complete callback
                    }
                )
                // Controller provides duration, View handles the timing
                LaunchedEffect(Unit) {
                    delay(splashController.getSplashDuration())
                    showSplash = false

                    // Check if device is already accepted and go straight to home
                    coroutineScope.launch {
                        try {
                            val deviceKey = deviceIdController.generateDeviceId()
                            val checkResult = locationTrackerDeviceController.checkDeviceStatus(deviceKey)

                            when (checkResult) {
                                is LocationTrackerDeviceController.StatusResult.Found -> {
                                    if (checkResult.device.isAccepted) {
                                        // Device is accepted, go straight to home
                                        val orgData = OrganizationData(
                                            organizationId = "", // Will be filled from device data if available
                                            workspaceId = checkResult.device.workspaceId,
                                            deviceId = checkResult.device.deviceKey ?: deviceKey,
                                            deviceData = checkResult.device
                                        )
                                        organizationData = orgData
                                        showOrganization = false
                                        showHome = true
                                        return@launch
                                    }
                                }
                                is LocationTrackerDeviceController.StatusResult.NotFound -> {
                                    // Device not found, show registration screen
                                }
                                is LocationTrackerDeviceController.StatusResult.Error -> {
                                    // Error checking status, show registration screen
                                }
                            }
                        } catch (e: Exception) {
                            // Error occurred, show registration screen
                        }

                    showOrganization = true
                    }
                }
            }
            showOrganization -> {
                // View: Display organization/login screen
                OrganizationScreen(
                    organizationController = organizationController,
                    locationTrackerDeviceController = locationTrackerDeviceController,
                    onLoginSuccess = { data ->
                        organizationData = data
                        showOrganization = false
                        showHome = true
                    }
                )
            }
            showHome -> {
                // View: Display main content after successful login
                LocationtrackerandroidTheme {
                    HomeScreen(
                        organizationData = organizationData,
                        onDeviceDeleted = {
                            // Device was deleted, redirect to registration screen
                            organizationData = null
                            showHome = false
                            showOrganization = true
                        }
                    )
                }
            }
        }
    }
}
