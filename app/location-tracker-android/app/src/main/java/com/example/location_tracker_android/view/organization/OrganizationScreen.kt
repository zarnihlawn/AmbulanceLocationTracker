package com.example.location_tracker_android.view.organization

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.controller.LocationTrackerDeviceController
import com.example.location_tracker_android.controller.OrganizationController
import com.example.location_tracker_android.model.LocationTrackerDeviceResponse
import com.example.location_tracker_android.model.OrganizationData
import com.example.location_tracker_android.ui.theme.AppShapes
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme

/**
 * View: Organization/Login Screen
 * Contains organization ID, workspace ID, and device ID fields
 */
@Composable
fun OrganizationScreen(
    organizationController: OrganizationController,
    locationTrackerDeviceController: LocationTrackerDeviceController,
    onLoginSuccess: (OrganizationData) -> Unit,
    modifier: Modifier = Modifier
) {
    var workspaceId by remember { mutableStateOf("") }
    var secretKey by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    // Get device ID (auto-generated, non-editable)
    val deviceId = remember {
        organizationController.getFormattedDeviceId()
    }

    LocationtrackerandroidTheme {
        Surface(
            modifier = modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Header
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = "Organization",
                    modifier = Modifier.size(64.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Organization Login",
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Enter your organization details",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(32.dp))

                // Workspace ID Field
                OutlinedTextField(
                    value = workspaceId,
                    onValueChange = {
                        workspaceId = it
                        errorMessage = null
                    },
                    label = { Text("Workspace ID") },
                    placeholder = { Text("Enter workspace ID") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.AccountCircle,
                            contentDescription = null
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = AppShapes.field,
                    singleLine = true,
                    isError = errorMessage != null
                )
                Spacer(modifier = Modifier.height(16.dp))

                // Secret Key Field
                OutlinedTextField(
                    value = secretKey,
                    onValueChange = {
                        secretKey = it
                        errorMessage = null
                    },
                    label = { Text("Secret Key") },
                    placeholder = { Text("Enter secret key from website") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = AppShapes.field,
                    singleLine = true,
                    isError = errorMessage != null
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Secret key is a one-time password from the website",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Device ID Field (Non-editable)
                OutlinedTextField(
                    value = deviceId,
                    onValueChange = { }, // Disabled - cannot edit
                    label = { Text("Device ID") },
                    placeholder = { Text("Auto-generated device ID") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = null
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = AppShapes.field,
                    singleLine = true,
                    enabled = false, // Make it non-editable
                    colors = OutlinedTextFieldDefaults.colors(
                        disabledTextColor = MaterialTheme.colorScheme.onSurface,
                        disabledBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                        disabledLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        disabledPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                    )
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Device ID is unique to this device and cannot be changed",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    modifier = Modifier.fillMaxWidth()
                )

                // Error Message
                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = AppShapes.field,
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        )
                    ) {
                        Text(
                            text = errorMessage!!,
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }

                // Success Message
                if (successMessage != null) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = AppShapes.field,
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    ) {
                        Text(
                            text = successMessage!!,
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Register Button
                Button(
                    onClick = {
                        isLoading = true
                        errorMessage = null
                        successMessage = null

                        // Validate input
                        val validation = locationTrackerDeviceController.validateRegistrationData(
                            workspaceId,
                            secretKey
                        )

                        when (validation) {
                            is LocationTrackerDeviceController.ValidationResult.Error -> {
                                errorMessage = validation.message
                                isLoading = false
                            }
                            is LocationTrackerDeviceController.ValidationResult.Success -> {
                                // Register device with server
                                coroutineScope.launch {
                                    val result = locationTrackerDeviceController.registerDevice(
                                        workspaceId.trim(),
                                        secretKey.trim()
                                    )

                                    when (result) {
                                        is LocationTrackerDeviceController.RegistrationResult.Success -> {
                                            // Device registration successful
                                            if (result.device.isAccepted) {
                                                // Device is accepted - proceed to home
                                                successMessage = "Device registered and accepted! Proceeding..."

                                                // Create organization data for navigation with device data
                                                val orgData = OrganizationData(
                                                    organizationId = "", // Not needed for registration
                                                    workspaceId = workspaceId.trim(),
                                                    deviceId = result.device.deviceKey ?: organizationController.getDeviceId(),
                                                    deviceData = result.device
                                                )

                                                // Wait a bit to show success message, then proceed
                                                kotlinx.coroutines.delay(1500)
                                                onLoginSuccess(orgData)
                                            } else {
                                                // Device is pending - check status periodically
                                                successMessage = "Device registered successfully! Waiting for approval..."
                                                isLoading = false

                                                // Poll for acceptance status
                                                coroutineScope.launch {
                                                    var attempts = 0
                                                    val maxAttempts = 30 // 30 attempts = 30 seconds

                                                    while (attempts < maxAttempts) {
                                                        kotlinx.coroutines.delay(1000) // Wait 1 second

                                                        try {
                                                            val deviceKey = organizationController.getDeviceId()
                                                            val checkResult = locationTrackerDeviceController.checkDeviceStatus(deviceKey)

                                                            when (checkResult) {
                                                                is LocationTrackerDeviceController.StatusResult.Found -> {
                                                                    if (checkResult.device.isAccepted) {
                                                                        // Device accepted - proceed
                                                                        successMessage = "Device accepted! Proceeding..."
                                                                        val orgData = OrganizationData(
                                                                            organizationId = "", // Not needed for registration
                                                                            workspaceId = workspaceId.trim(),
                                                                            deviceId = checkResult.device.deviceKey ?: deviceKey,
                                                                            deviceData = checkResult.device
                                                                        )
                                                                        kotlinx.coroutines.delay(1000)
                                                                        onLoginSuccess(orgData)
                                                                        return@launch
                                                                    }
                                                                }
                                                                is LocationTrackerDeviceController.StatusResult.NotFound -> {
                                                                    errorMessage = "Device not found. Please try registering again."
                                                                    return@launch
                                                                }
                                                                is LocationTrackerDeviceController.StatusResult.Error -> {
                                                                    // Continue polling on error
                                                                }
                                                            }
                                                        } catch (e: Exception) {
                                                            // Continue polling on exception
                                                        }

                                                        attempts++
                                                    }

                                                    // Max attempts reached - show timeout message
                                                    errorMessage = "Registration timeout. Please check back later or try again."
                                                }
                                            }
                                        }
                                        is LocationTrackerDeviceController.RegistrationResult.Error -> {
                                            // Registration failed
                                            errorMessage = result.message
                                            isLoading = false
                                        }
                                    }
                                }
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = AppShapes.field,
                    enabled = !isLoading
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    } else {
                        Text(
                            text = "Register Device",
                            style = MaterialTheme.typography.labelLarge
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun OrganizationScreenPreview() {
    // Note: Preview requires a context, so this is a simplified preview
    LocationtrackerandroidTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Text(
                text = "Organization Screen Preview",
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

