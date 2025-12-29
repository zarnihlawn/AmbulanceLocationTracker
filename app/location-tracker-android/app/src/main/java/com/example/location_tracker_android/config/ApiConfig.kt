package com.example.location_tracker_android.config

/**
 * API Configuration
 * Manages different server environments (Home, Office, Emulator)
 */
object ApiConfig {
    enum class Environment {
        HOME,      // 192.168.100.16 (home network)
        OFFICE,    // 10.0.251.86 (office network)
        EMULATOR   // 10.0.2.2 (Android emulator)
    }

    // Server port
    private const val SERVER_PORT = 1025

    // IP addresses for different environments
    private const val HOME_IP = "192.168.100.16"
    private const val OFFICE_IP = "10.0.251.86"
    private const val EMULATOR_IP = "10.0.2.2"

    // Current environment - change this to switch between home/office
    // Options: Environment.HOME (192.168.100.16) or Environment.OFFICE (10.0.251.86)
    // You can also make this dynamic based on network detection
    private var currentEnvironment: Environment = Environment.HOME

    init {
        // Auto-detect or set default environment
        // Uncomment the line below to auto-detect, or manually set HOME/OFFICE
        // currentEnvironment = autoDetectEnvironment()
    }

    /**
     * Set the current environment
     */
    fun setEnvironment(environment: Environment) {
        currentEnvironment = environment
    }

    /**
     * Get the current environment
     */
    fun getEnvironment(): Environment = currentEnvironment

    /**
     * Get the base URL based on current environment
     */
    fun getBaseUrl(): String {
        val ip = when (currentEnvironment) {
            Environment.HOME -> HOME_IP
            Environment.OFFICE -> OFFICE_IP
            Environment.EMULATOR -> EMULATOR_IP
        }
        return "http://$ip:$SERVER_PORT/"
    }

    /**
     * Get all available IPs (for network security config)
     */
    fun getAllIPs(): List<String> = listOf(HOME_IP, OFFICE_IP, EMULATOR_IP)

    /**
     * Auto-detect environment based on current network
     * Returns the environment that matches the current network
     */
    fun autoDetectEnvironment(): Environment {
        // For now, default to HOME
        // You can implement network detection logic here if needed
        return Environment.HOME
    }
}

