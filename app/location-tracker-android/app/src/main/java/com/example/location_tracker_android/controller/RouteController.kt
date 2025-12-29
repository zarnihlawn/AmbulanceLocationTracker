package com.example.location_tracker_android.controller

import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import com.google.android.gms.maps.model.LatLng
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import java.net.URLEncoder

/**
 * Controller: Route Controller
 * Handles fetching routes from Google Directions API
 */
class RouteController(private val apiKey: String) {

    data class Route(
        val points: List<LatLng>,
        val distance: Int, // in meters
        val duration: Int, // in seconds
        val polyline: String
    )

    /**
     * Get multiple routes between origin and destination
     * Returns up to 5 routes sorted by distance (shortest first)
     */
    suspend fun getRoutes(
        origin: LatLng,
        destination: LatLng,
        maxRoutes: Int = 5
    ): List<Route> = withContext(Dispatchers.IO) {
        try {
            // Google Directions API URL with alternatives=true to get multiple routes
            val originStr = "${origin.latitude},${origin.longitude}"
            val destStr = "${destination.latitude},${destination.longitude}"
            val url = "https://maps.googleapis.com/maps/api/directions/json" +
                    "?origin=${URLEncoder.encode(originStr, "UTF-8")}" +
                    "&destination=${URLEncoder.encode(destStr, "UTF-8")}" +
                    "&alternatives=true" +
                    "&key=$apiKey"

            Log.d("RouteController", "Fetching routes from: $url")
            val response = URL(url).readText()
            val jsonResponse = JSONObject(response)

            val status = jsonResponse.getString("status")
            if (status != "OK") {
                Log.e("RouteController", "Directions API error: $status")
                if (jsonResponse.has("error_message")) {
                    Log.e("RouteController", "Error message: ${jsonResponse.getString("error_message")}")
                }
                return@withContext emptyList()
            }

            val routes = jsonResponse.getJSONArray("routes")
            val routeList = mutableListOf<Route>()

            for (i in 0 until minOf(routes.length(), maxRoutes)) {
                try {
                    val routeJson = routes.getJSONObject(i)
                    val legs = routeJson.getJSONArray("legs")

                    if (legs.length() > 0) {
                        val leg = legs.getJSONObject(0)
                        val distance = leg.getJSONObject("distance").getInt("value")
                        val duration = leg.getJSONObject("duration").getInt("value")

                        // Decode polyline
                        val overviewPolyline = routeJson.getJSONObject("overview_polyline")
                        val polyline = overviewPolyline.getString("points")
                        val points = decodePolyline(polyline)

                        routeList.add(Route(points, distance, duration, polyline))
                    }
                } catch (e: Exception) {
                    Log.e("RouteController", "Error parsing route $i: ${e.message}", e)
                }
            }

            // Sort by distance (shortest first) and limit to maxRoutes
            val sortedRoutes = routeList.sortedBy { it.distance }.take(maxRoutes)
            Log.d("RouteController", "Returning ${sortedRoutes.size} routes")
            sortedRoutes
        } catch (e: Exception) {
            Log.e("RouteController", "Error fetching routes: ${e.message}", e)
            emptyList()
        }
    }

    /**
     * Decode Google Maps encoded polyline string to list of LatLng points
     */
    private fun decodePolyline(encoded: String): List<LatLng> {
        val poly = mutableListOf<LatLng>()
        var index = 0
        val len = encoded.length
        var lat = 0
        var lng = 0

        while (index < len) {
            var b: Int
            var shift = 0
            var result = 0
            do {
                b = encoded[index++].code - 63
                result = result or (b and 0x1f shl shift)
                shift += 5
            } while (b >= 0x20)
            val dlat = if (result and 1 != 0) (result shr 1).inv() else result shr 1
            lat += dlat

            shift = 0
            result = 0
            do {
                b = encoded[index++].code - 63
                result = result or (b and 0x1f shl shift)
                shift += 5
            } while (b >= 0x20)
            val dlng = if (result and 1 != 0) (result shr 1).inv() else result shr 1
            lng += dlng

            poly.add(LatLng(lat / 1e5, lng / 1e5))
        }

        return poly
    }
}

