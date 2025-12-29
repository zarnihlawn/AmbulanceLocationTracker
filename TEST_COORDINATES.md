# Test Coordinates for Route Testing

## Option 1: Yangon, Myanmar (Close to Default Location)
These coordinates are in Yangon, Myanmar, close to the default location used in the app:

**Origin/Current Location:**
- Latitude: `16.8661`
- Longitude: `96.1951`
- Location: Downtown Yangon

**Target/Destination:**
- Latitude: `16.8029`
- Longitude: `96.1358`
- Location: Shwedagon Pagoda area (~8 km away)
- Route distance: Approximately 8-10 km

**Alternative Target:**
- Latitude: `16.7806`
- Longitude: `96.1497`
- Location: Inya Lake area (~10 km away)

---

## Option 2: Well-Known Cities (Easy to Verify)
These are well-known locations that work well for testing:

**San Francisco Area:**
- Origin: `37.7749, -122.4194` (Union Square, San Francisco)
- Target: `37.7849, -122.4094` (Fisherman's Wharf, ~1.5 km away)

**New York Area:**
- Origin: `40.7589, -73.9851` (Times Square, New York)
- Target: `40.7484, -73.9857` (Empire State Building, ~1 km away)

**London Area:**
- Origin: `51.5074, -0.1278` (Big Ben, London)
- Target: `51.5045, -0.0865` (Tower Bridge, ~3 km away)

---

## Option 3: Yangon Test Coordinates (Multiple Routes Expected)
These should generate multiple route options:

**Route 1: Short Distance (2-3 km)**
- Origin: `16.8661, 96.1951` (Downtown)
- Target: `16.8480, 96.1880` (Nearby area)

**Route 2: Medium Distance (5-7 km)**
- Origin: `16.8661, 96.1951` (Downtown)
- Target: `16.8029, 96.1358` (Shwedagon area)

**Route 3: Longer Distance (10-15 km)**
- Origin: `16.8661, 96.1951` (Downtown)
- Target: `16.7806, 96.1497` (Inya Lake)

---

## Testing Instructions:

1. **In your server/database**, create a location task with:
   - `type`: `"location"`
   - `targetLatitude`: Use one of the target latitudes above
   - `targetLongitude`: Use one of the target longitudes above
   - `status`: `"pending"`

2. **In the Android app**:
   - Go to the Notifier screen
   - Accept the location task
   - Navigate to the Map screen
   - You should see:
     - Current location marker (blue/your location)
     - Target location marker (red)
     - Up to 5 colored route polylines (green = shortest, red = longest)

3. **For best results**, ensure:
   - Your device has location permissions enabled
   - Or the app has received at least one location update from the server
   - The Google Maps API key is valid and has Directions API enabled

---

## Recommended Test (Yangon):
**Target Location:**
- Latitude: `16.8029`
- Longitude: `96.1358`
- Name: Shwedagon Pagoda area

This should give you multiple route options since there are several ways to travel between downtown Yangon and Shwedagon Pagoda area.

