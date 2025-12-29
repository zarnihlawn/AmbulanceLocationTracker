package com.example.location_tracker_android.view.history

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.location_tracker_android.ui.theme.AppShapes
import com.example.location_tracker_android.ui.theme.LocationtrackerandroidTheme
import java.text.SimpleDateFormat
import java.util.*

/**
 * View: History Screen
 * Displays location tracking history
 */
data class LocationHistoryItem(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long,
    val address: String? = null
)

@Composable
fun HistoryScreen(
    modifier: Modifier = Modifier
) {
    // Sample history data
    val historyItems = remember {
        listOf(
            LocationHistoryItem(
                id = "1",
                latitude = 16.8065,
                longitude = 96.1951,
                timestamp = System.currentTimeMillis() - 3600000,
                address = "Yangon, Myanmar"
            ),
            LocationHistoryItem(
                id = "2",
                latitude = 16.8065,
                longitude = 96.1951,
                timestamp = System.currentTimeMillis() - 7200000,
                address = "Yangon, Myanmar"
            ),
            LocationHistoryItem(
                id = "3",
                latitude = 16.8065,
                longitude = 96.1951,
                timestamp = System.currentTimeMillis() - 10800000,
                address = "Yangon, Myanmar"
            )
        )
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.primaryContainer
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = "History",
                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Location History",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }

        // History List
        if (historyItems.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "No history",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "No location history",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(historyItems) { item ->
                    HistoryCard(historyItem = item)
                }
            }
        }
    }
}

@Composable
fun HistoryCard(historyItem: LocationHistoryItem) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault())
    val formattedDate = dateFormat.format(Date(historyItem.timestamp))

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = AppShapes.box
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Location",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${historyItem.latitude}, ${historyItem.longitude}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    historyItem.address?.let {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = it,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        )
                    }
                }
                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Divider()
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = formattedDate,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HistoryScreenPreview() {
    LocationtrackerandroidTheme {
        HistoryScreen()
    }
}

