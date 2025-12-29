package com.example.location_tracker_android.controller

import com.example.location_tracker_android.config.ApiConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Controller: API Client
 * Manages Retrofit instance and API service
 */
object ApiClient {
    // Get base URL from ApiConfig (supports Home/Office/Emulator)
    private val BASE_URL = ApiConfig.getBaseUrl()

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)

    /**
     * Get base URL (for debugging)
     */
    fun getBaseUrl(): String = BASE_URL

    /**
     * Update base URL (if needed for different environments)
     */
    fun updateBaseUrl(newBaseUrl: String): ApiService {
        val newRetrofit = Retrofit.Builder()
            .baseUrl(newBaseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        return newRetrofit.create(ApiService::class.java)
    }
}

