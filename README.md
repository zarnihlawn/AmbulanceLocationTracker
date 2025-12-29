# Ambulance Location Tracker

A comprehensive location tracking system for managing ambulance fleets, built with a microservices architecture. The system consists of a backend API gateway, multiple microservices, a web dashboard, and an Android mobile application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Database Configuration](#database-configuration)
- [Running the Services](#running-the-services)
- [Running the Web Application](#running-the-web-application)
- [Building and Running the Android App](#building-and-running-the-android-app)
- [API Endpoints](#api-endpoints)
- [Usage Guide](#usage-guide)
- [Development](#development)

## Overview

The Ambulance Location Tracker is designed to:

- **Track ambulance locations in real-time** via Android devices
- **Manage organizations, workspaces, and devices** through a web dashboard
- **Send tasks and notifications** to ambulance drivers (both text and location-based tasks)
- **Visualize routes** with multiple path options displayed on maps
- **Provide CRUD operations** for organizations, workspaces, and devices
- **Handle device registration** using secret keys for secure pairing

## Architecture

The system follows a **microservices architecture** with the following components:

### Backend Services

1. **Gateway Service** - Main API gateway that routes requests to appropriate services
2. **Account Service** - User authentication, registration, and account management
3. **Organization Service** - Organization CRUD operations
4. **Workspace Service** - Workspace CRUD operations
5. **Feature Service** - Feature management (e.g., location-tracker feature)
6. **Location Tracker Device Feature** - Device registration and management
7. **Location Tracker Tracking Feature** - Location data storage and retrieval
8. **Location Tracker Notifier Feature** - Task and notification management

### Frontend Applications

1. **Web Dashboard** - SvelteKit-based web application for managing the system
2. **Android App** - Kotlin/Compose mobile application for ambulance drivers

## Technology Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod

### Web Frontend
- **Framework**: SvelteKit
- **Styling**: TailwindCSS + DaisyUI
- **Language**: TypeScript

### Android App
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Networking**: Retrofit + OkHttp
- **Maps**: Google Maps SDK
- **Location**: Google Play Services Location

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** (v1.3.4 or later) - [Install Bun](https://bun.sh)
- **PostgreSQL** (14 or later)
- **Node.js** (18 or later) - For Android development tooling
- **Android Studio** - For building the Android app
- **JDK 11+** - For Android development
- **Google Maps API Key** - For map functionality in both web and Android

## Project Structure

```
AmbulanceLocationTracker/
├── server/                          # Backend services
│   ├── src/routes/
│   │   ├── service/                # Core services
│   │   │   ├── account-service/    # User authentication & accounts
│   │   │   ├── gateway-service/    # API gateway
│   │   │   ├── organization-service/
│   │   │   ├── workspace-service/
│   │   │   └── feature-service/
│   │   └── app/
│   │       └── location-tracker-app/
│   │           ├── location-tracker-device-feature/
│   │           ├── location-tracker-tracking-feature/
│   │           └── location-tracker-notifier-feature/
│   └── package.json
├── web/                            # Web dashboard (SvelteKit)
│   ├── src/
│   │   ├── routes/                # SvelteKit routes
│   │   ├── lib/                   # Shared components & utilities
│   │   └── app.html
│   └── package.json
├── app/                            # Android application
│   └── location-tracker-android/
│       └── app/
│           └── src/main/
│               ├── java/          # Kotlin source code
│               └── AndroidManifest.xml
└── README.md
```

## Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AmbulanceLocationTracker
```

### 2. Install Dependencies

#### Backend Services

```bash
cd server
bun install
```

#### Web Application

```bash
cd web
bun install
```

#### Android App

The Android app uses Gradle for dependency management. Open the project in Android Studio and it will automatically sync dependencies.

## Database Configuration

### Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# PostgreSQL Connection (Main Database Server)
MAIN_POSTGRES_HOST=localhost
MAIN_POSTGRES_PORT=5432
MAIN_POSTGRES_USERNAME=postgres
MAIN_POSTGRES_PASSWORD=your_password

# Database Names (each service has its own database)
ACCOUNT_DATABASE=account_db
GATEWAY_DATABASE=gateway_db
ORGANIZATION_DATABASE=organization_db
WORKSPACE_DATABASE=workspace_db
FEATURE_DATABASE=feature_db
LOCATION_TRACKER_DEVICE_DATABASE=location_tracker_device_db
LOCATION_TRACKER_TRACKING_DATABASE=location_tracker_tracking_db
LOCATION_TRACKER_NOTIFIER_DATABASE=location_tracker_notifier_db

# Service Ports
GATEWAY_PORT=1025
ACCOUNT_PORT=4000
ORGANIZATION_PORT=4000
WORKSPACE_PORT=4000
FEATURE_PORT=4000
LOCATION_TRACKER_DEVICE_PORT=4000
LOCATION_TRACKER_TRACKING_PORT=2002
LOCATION_TRACKER_NOTIFIER_PORT=4003

# Service Hosts (default: localhost)
ACCOUNT_HOST=localhost
ORGANIZATION_HOST=localhost
WORKSPACE_HOST=localhost
FEATURE_HOST=localhost
LOCATION_TRACKER_DEVICE_HOST=localhost
LOCATION_TRACKER_TRACKING_HOST=localhost
LOCATION_TRACKER_NOTIFIER_HOST=localhost

# JWT Configuration (Account Service)
ACCOUNT_JWT_TOKEN=your_jwt_secret_key_here
```

**Note**: The services will automatically create their databases if they don't exist when they start up.

### Database Migrations

All services run database migrations automatically on startup. The migrations:

1. Create the database if it doesn't exist
2. Run all pending migrations from the `drizzle/` folder in each service
3. Seed initial data (where applicable, e.g., feature-service seeds default features)

**Manual Migration** (if needed):

Each service can run migrations manually using:
```bash
cd server/src/routes/service/<service-name>
bun run migrate-run.ts
```

## Running the Services

### Start All Services

From the `server/` directory:

```bash
# Start all services (gateway + all microservices)
bun run dev

# Or start services separately
bun run dev:services  # Start core services only
bun run dev:apps      # Start location-tracker features only
```

### Start Individual Services

Each service can be started individually. Navigate to the service directory and run:

```bash
cd src/routes/service/gateway-service  # or any other service
bun run dev
```

### Service Ports

- **Gateway Service**: `1025` (default)
- **Account Service**: `4000` (default)
- **Organization Service**: `4000` (default)
- **Workspace Service**: `4000` (default)
- **Feature Service**: `4000` (default)
- **Location Tracker Device**: `4000` (default)
- **Location Tracker Tracking**: `2002` (default)
- **Location Tracker Notifier**: `4003` (default)

**Important**: Make sure ports don't conflict. You can customize ports in the `.env` file.

### Gateway Service

The Gateway Service acts as a reverse proxy and routes requests to appropriate microservices:

- `/api/account/*` → Account Service
- `/api/organization/*` → Organization Service
- `/api/workspace/*` → Workspace Service
- `/api/feature/*` → Feature Service
- `/api/location-tracker-device/*` → Location Tracker Device Feature
- `/api/location-tracker-tracking/*` → Location Tracker Tracking Feature
- `/api/location-tracker-notifier/*` → Location Tracker Notifier Feature

## Running the Web Application

### 1. Configure API Endpoint

Update `web/src/lib/config/api.ts` or use environment variables:

```env
PUBLIC_API_BASE_URL=http://localhost:1025
# OR
PUBLIC_API_HOST=localhost
PUBLIC_API_PORT=1025
PUBLIC_API_PROTOCOL=http
```

### 2. Configure Vite Proxy (for development)

Update `web/vite.config.ts` to point to your gateway service:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:1025',  // Update to your gateway URL
    changeOrigin: true,
    secure: false,
  }
}
```

### 3. Start Development Server

```bash
cd web
bun run dev
```

The web application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
cd web
bun run build
bun run preview  # Preview production build
```

## Building and Running the Android App

### 1. Prerequisites

- Android Studio (latest stable version)
- Android SDK (API Level 24+)
- Google Maps API Key

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable "Maps SDK for Android" and "Directions API"
4. Create an API key
5. Restrict the API key to your app's package name

### 3. Configure Google Maps API Key

Edit `app/location-tracker-android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

**Important**: For production, use environment variables or build configs instead of hardcoding.

### 4. Configure Server URL

Edit `app/location-tracker-android/app/src/main/java/com/example/location_tracker_android/config/ApiConfig.kt`:

```kotlin
private const val HOME_IP = "192.168.100.16"      // Your home network IP
private const val OFFICE_IP = "10.0.251.86"       // Your office network IP
private const val SERVER_PORT = 1025              // Gateway service port
```

Or set the environment in `MainActivity.kt`:

```kotlin
ApiConfig.setEnvironment(ApiConfig.Environment.HOME)  // or OFFICE, EMULATOR
```

### 5. Build and Run

**Option 1: Using Android Studio**

1. Open `app/location-tracker-android/` in Android Studio
2. Wait for Gradle sync to complete
3. Click "Run" or press `Shift+F10`

**Option 2: Using Command Line**

```bash
cd app/location-tracker-android
./gradlew assembleDebug          # Build debug APK
./gradlew installDebug           # Build and install on connected device
```

### 6. Network Configuration

The Android app supports different environments:
- **HOME**: For home network testing
- **OFFICE**: For office network testing
- **EMULATOR**: For Android emulator (uses `10.0.2.2` to access host machine)

Make sure your device/emulator can reach the server IP address.

## API Endpoints

### Authentication (Account Service)

- `POST /api/account` - Register new user
- `POST /api/account/login` - Login
- `POST /api/account/refresh` - Refresh access token
- `POST /api/account/logout` - Logout
- `GET /api/account/:id` - Get user by ID
- `PATCH /api/account/:id` - Update user
- `DELETE /api/account/:id` - Delete user

### Organizations

- `GET /api/organization` - List all organizations
- `GET /api/organization/:id` - Get organization by ID
- `GET /api/organization/ownerId/:id` - Get organizations by owner ID
- `POST /api/organization` - Create organization
- `PATCH /api/organization/:id` - Update organization
- `DELETE /api/organization/:id` - Delete organization

### Workspaces

- `GET /api/workspace` - List all workspaces
- `GET /api/workspace/:id` - Get workspace by ID
- `GET /api/workspace/organizationId/:id` - Get workspaces by organization ID
- `POST /api/workspace` - Create workspace
- `PATCH /api/workspace/:id` - Update workspace
- `DELETE /api/workspace/:id` - Delete workspace

### Location Tracker Devices

- `POST /api/location-tracker-device/with-secret-key` - Create device with secret key (web)
- `POST /api/location-tracker-device` - Register device from Android app
- `GET /api/location-tracker-device` - List all devices
- `GET /api/location-tracker-device/:id` - Get device by ID
- `GET /api/location-tracker-device/workspaceId/:workspaceId` - Get devices by workspace
- `GET /api/location-tracker-device/deviceKey/:deviceKey` - Get device by device key
- `PATCH /api/location-tracker-device/:id/accept` - Accept device (assign name/description)
- `PATCH /api/location-tracker-device/:id` - Update device (name/description)
- `DELETE /api/location-tracker-device/:id` - Delete device

### Location Tracking

- `POST /api/location-tracker-tracking` - Submit location update
- `GET /api/location-tracker-tracking/device/:deviceId` - Get locations for device
- `GET /api/location-tracker-tracking/device/:deviceId/latest` - Get latest location

### Tasks & Notifications

- `POST /api/location-tracker-notifier/task` - Create task
- `GET /api/location-tracker-notifier/task/device/:deviceId` - Get tasks for device
- `PATCH /api/location-tracker-notifier/task/:id/status` - Update task status
- `DELETE /api/location-tracker-notifier/task/:id` - Delete task

## Usage Guide

### 1. Initial Setup

1. **Start PostgreSQL** database server
2. **Configure environment variables** in `server/.env`
3. **Start all backend services**:
   ```bash
   cd server
   bun run dev
   ```
4. **Start web application**:
   ```bash
   cd web
   bun run dev
   ```

### 2. Create Your First Account

1. Open the web application: `http://localhost:5173`
2. Click "Sign Up" and create an account
3. Log in with your credentials

### 3. Create Organization and Workspace

1. Navigate to "Organization" in the sidebar
2. Click "New organization" and fill in the details
3. Click on the organization card to open workspaces
4. Click "New workspace" and select a feature (e.g., "Location Tracker")
5. Fill in workspace details and create

### 4. Register Android Device

1. In the workspace, click "Add Tracker Device"
2. Copy the **Workspace ID** and **Secret Key** shown
3. Open the Android app
4. Enter:
   - **Workspace ID** (from web)
   - **Secret Key** (from web)
5. Click "Register"
6. Go back to the web dashboard and click "Accept Device"
7. Enter a device name (e.g., "Ambulance 1") and description
8. The device is now registered and tracking will begin

### 5. Send Tasks to Device

1. Navigate to the device detail page
2. Click "Create Task"
3. Choose task type:
   - **Text Task**: Send a text message/notification
   - **Location Task**: Send a location to navigate to
4. Fill in task details
5. The Android app will receive a notification
6. Driver can accept/reject/complete tasks from the app

### 6. View Location and Routes

1. On the device detail page, view the map
2. The current location is shown in real-time
3. For accepted location tasks, routes are displayed:
   - **Green**: Shortest route
   - **Yellow/Orange**: Intermediate routes
   - **Red**: Longest route
4. Up to 5 route options are shown

## Development

### Code Structure

- **Backend Services**: Follow a clean architecture pattern with handlers, services, repositories, and schemas
- **Web Frontend**: Uses SvelteKit file-based routing with TypeScript
- **Android App**: Follows MVVM pattern with Kotlin and Jetpack Compose

### Adding New Features

1. **Backend**: Create a new service in `server/src/routes/service/` or `server/src/routes/app/`
2. **Database**: Add schema files and run migrations
3. **Gateway**: Register new routes in `gateway-service/src/config/routes.config.ts`
4. **Web**: Add new routes in `web/src/routes/` and update API utilities
5. **Android**: Add new screens/features in `app/location-tracker-android/app/src/main/java/`

### Testing

```bash
# Backend linting
cd server
bun run lint

# Web linting and testing
cd web
bun run lint
bun run test

# Android testing
# Use Android Studio's built-in testing tools
```

### Building for Production

**Backend**:
- Services are ready for production deployment with Bun
- Use process managers like PM2 or systemd for production

**Web**:
```bash
cd web
bun run build
# Deploy the `build/` directory to your hosting service
```

**Android**:
```bash
cd app/location-tracker-android
./gradlew assembleRelease  # Build release APK
# Sign and distribute through Google Play or other channels
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `.env` file has correct credentials
- Verify database names don't conflict
- Check PostgreSQL logs for connection errors

### Service Won't Start

- Check if port is already in use
- Verify all environment variables are set
- Check service logs for error messages
- Ensure migrations ran successfully

### Android App Can't Connect

- Verify server IP address in `ApiConfig.kt`
- Check device and server are on the same network
- For emulator, use `10.0.2.2` instead of `localhost`
- Check firewall settings
- Verify gateway service is running on correct port

### Maps Not Showing

- Verify Google Maps API key is correct
- Check API key restrictions allow your app
- Ensure "Maps SDK for Android" and "Directions API" are enabled
- Check API quota hasn't been exceeded

## License

[Add your license information here]

## Contributors

[Add contributor information here]

## Support

For issues and questions, please open an issue on the repository.

