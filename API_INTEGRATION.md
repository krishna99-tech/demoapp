# API Integration Guide - Frontend to Backend

## Overview
This document outlines the complete API integration between the React Native frontend and the FastAPI backend (ThingsNXT Platform).

## Base Configuration

### API Base URL
- **Development**: `http://192.168.29.139:8000` (configurable in `constants/config.js`)
- **WebSocket**: `ws://192.168.29.139:8000/ws`
- **SSE Events**: `http://192.168.29.139:8000/events/stream`
- **SSE Notifications**: `http://192.168.29.139:8000/notifications/stream`

## Authentication APIs

### ✅ Signup
- **Endpoint**: `POST /signup`
- **Request**: `{ email, username, password, full_name? }`
- **Response**: `{ access_token, refresh_token, token_type, user }`
- **Status**: ✅ Integrated

### ✅ Login
- **Endpoint**: `POST /token` (OAuth2 form data)
- **Request**: `username=<identifier>&password=<password>` (form-urlencoded)
- **Response**: `{ access_token, refresh_token, token_type, user }`
- **Status**: ✅ Integrated

### ✅ Logout
- **Endpoint**: `POST /logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Logged out" }`
- **Status**: ✅ Integrated

### ✅ Refresh Token
- **Endpoint**: `POST /refresh?refresh_token=<token>`
- **Request**: Query parameter (not body)
- **Response**: `{ access_token, refresh_token, token_type }`
- **Status**: ✅ Fixed - Now uses query parameter

### ✅ Get Current User
- **Endpoint**: `GET /me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ id, email, username, full_name, is_active }`
- **Status**: ✅ Integrated

### ✅ Update User Profile
- **Endpoint**: `PUT /me`
- **Request**: `{ username?, email? }`
- **Response**: Updated user object
- **Status**: ✅ Integrated

### ✅ Delete Account
- **Endpoint**: `DELETE /me`
- **Response**: `{ message: "Account and all associated data deleted successfully" }`
- **Status**: ✅ Integrated

### ✅ Forgot Password
- **Endpoint**: `POST /forgot-password`
- **Request**: `{ email }`
- **Response**: `{ message: "If your email is registered, you will receive a reset code" }`
- **Status**: ✅ Integrated

### ✅ Verify Reset Token
- **Endpoint**: `GET /verify-reset-token?token=<token>`
- **Response**: `{ message: "Token is valid" }` or error
- **Status**: ✅ Added

### ✅ Reset Password
- **Endpoint**: `POST /reset-password`
- **Request**: `{ token, new_password }`
- **Response**: `{ message: "Password reset successful" }`
- **Status**: ✅ Integrated

## Device APIs

### ✅ Get Devices
- **Endpoint**: `GET /devices`
- **Response**: `Array<Device>`
- **Status**: ✅ Integrated

### ✅ Add Device
- **Endpoint**: `POST /devices`
- **Request**: `{ name }`
- **Response**: Device object with `device_token`
- **Status**: ✅ Integrated

### ✅ Update Device
- **Endpoint**: `PATCH /devices/{device_id}`
- **Request**: `{ name?, status? }`
- **Response**: Updated device
- **Status**: ✅ Integrated (Note: Backend doesn't have this endpoint, but API method exists)

### ✅ Bulk Update Device Status
- **Endpoint**: `PATCH /devices/bulk/status`
- **Request**: `{ device_ids: string[], status: "online" | "offline" }`
- **Response**: `{ message: "Devices updated", modified_count: number }`
- **Status**: ✅ Added

### ✅ Delete Device
- **Endpoint**: `DELETE /devices/{device_id}`
- **Response**: `{ message: "Device deleted" }`
- **Status**: ✅ Integrated

## Telemetry APIs

### ✅ Get Latest Telemetry
- **Endpoint**: `GET /telemetry/latest?device_token=<token>`
- **Response**: `{ device_id, data: {}, timestamp }`
- **Status**: ✅ Integrated

### ✅ Get Telemetry History
- **Endpoint**: `GET /telemetry/history?device_id=<id>&key=<key>&period=<24h>`
- **Response**: `Array<{ timestamp, value }>`
- **Status**: ✅ Integrated

### ⚠️ Push Telemetry
- **Endpoint**: `POST /telemetry`
- **Request**: `{ device_token, data: {} }`
- **Note**: This is for IoT devices, not frontend. Frontend should not use this.
- **Status**: N/A (Device-only endpoint)

## Dashboard APIs

### ✅ Get Dashboards
- **Endpoint**: `GET /dashboards`
- **Response**: `Array<Dashboard>`
- **Status**: ✅ Integrated

### ✅ Create Dashboard
- **Endpoint**: `POST /dashboards`
- **Request**: `{ name, description? }`
- **Response**: Dashboard object
- **Status**: ✅ Integrated

### ✅ Delete Dashboard
- **Endpoint**: `DELETE /dashboards/{dashboard_id}`
- **Response**: `{ message: "Dashboard deleted" }`
- **Status**: ✅ Integrated

### ✅ Update Dashboard Layout
- **Endpoint**: `PUT /dashboards/{dashboard_id}/layout`
- **Request**: `{ layout: Array<{ id, width, height }> }`
- **Response**: `{ message: "Layout updated successfully" }`
- **Status**: ✅ Integrated

## Widget APIs

### ✅ Get Widgets
- **Endpoint**: `GET /widgets/{dashboard_id}`
- **Response**: `Array<Widget>`
- **Status**: ✅ Integrated

### ✅ Create Widget
- **Endpoint**: `POST /widgets`
- **Request**: `{ dashboard_id, device_id?, type, label?, value?, config: {} }`
- **Response**: Widget object
- **Status**: ✅ Integrated

### ✅ Update Widget
- **Endpoint**: `PATCH /widgets/{widget_id}`
- **Request**: `{ label?, config?, value? }`
- **Response**: Updated widget
- **Status**: ✅ Added

### ✅ Delete Widget
- **Endpoint**: `DELETE /widgets/{widget_id}`
- **Response**: `{ message: "Widget deleted" }`
- **Status**: ✅ Integrated

### ✅ Set Widget State (LED)
- **Endpoint**: `POST /widgets/{widget_id}/state`
- **Request**: `{ state: 0 | 1 }`
- **Response**: `{ message: "ok", state, virtual_pin, timestamp }`
- **Status**: ✅ Integrated

### ✅ Get Widget Schedules
- **Endpoint**: `GET /widgets/{widget_id}/schedule`
- **Response**: `{ schedules: Array<Schedule> }`
- **Status**: ✅ Integrated

### ✅ Create Widget Schedule
- **Endpoint**: `POST /widgets/{widget_id}/schedule`
- **Request**: `{ state: boolean, execute_at: datetime (IST), label? }`
- **Response**: `{ message: "scheduled", schedule_id, execute_at, execute_at_ist, state }`
- **Status**: ✅ Integrated

### ✅ Create Widget Timer
- **Endpoint**: `POST /widgets/{widget_id}/timer`
- **Request**: `{ state: boolean, duration_seconds: number, label? }`
- **Response**: `{ message: "timer_scheduled", schedule_id, execute_at, execute_at_ist, state, duration_seconds }`
- **Status**: ✅ Integrated

### ✅ Cancel Widget Schedule
- **Endpoint**: `DELETE /widgets/{widget_id}/schedule/{schedule_id}`
- **Response**: `{ message: "cancelled" }`
- **Status**: ✅ Integrated

## Notification APIs

### ✅ Get Notifications
- **Endpoint**: `GET /notifications?limit=<50>&unread_only=<false>`
- **Response**: `{ notifications: Array<Notification> }`
- **Status**: ✅ Integrated

### ✅ Mark Notification Read
- **Endpoint**: `PUT /notifications/{notification_id}/read`
- **Response**: `{ message: "marked as read" }`
- **Status**: ✅ Integrated

### ✅ Mark All Notifications Read
- **Endpoint**: `PUT /notifications/read-all`
- **Response**: `{ message: "all notifications marked as read" }`
- **Status**: ✅ Integrated

### ✅ Delete Notification
- **Endpoint**: `DELETE /notifications/{notification_id}`
- **Response**: `204 No Content`
- **Status**: ✅ Integrated

### ✅ Notification Stream (SSE)
- **Endpoint**: `GET /notifications/stream`
- **Headers**: `Authorization: Bearer <token>`, `Accept: text/event-stream`
- **Response**: Server-Sent Events stream
- **Status**: ✅ Integrated

## Webhook APIs

### ✅ Get Webhooks
- **Endpoint**: `GET /webhooks`
- **Response**: `{ webhooks: Array<Webhook> }`
- **Status**: ✅ Added

### ✅ Get Webhook
- **Endpoint**: `GET /webhooks/{webhook_id}`
- **Response**: Webhook object
- **Status**: ✅ Added

### ✅ Create Webhook
- **Endpoint**: `POST /webhooks`
- **Request**: `{ url, events: string[], secret?, device_id? }`
- **Response**: Webhook object
- **Status**: ✅ Added

### ✅ Update Webhook
- **Endpoint**: `PATCH /webhooks/{webhook_id}`
- **Request**: `{ url?, events?, active?, secret? }`
- **Response**: Updated webhook
- **Status**: ✅ Added

### ✅ Delete Webhook
- **Endpoint**: `DELETE /webhooks/{webhook_id}`
- **Response**: `{ message: "Webhook deleted" }`
- **Status**: ✅ Added

## Real-Time Communication

### ✅ WebSocket Connection
- **Endpoint**: `ws://<BASE_URL>/ws?token=<access_token>`
- **Protocol**: WebSocket
- **Messages**: JSON format
- **Status**: ✅ Integrated

**Message Types:**
- `connected` - Connection established
- `telemetry_update` - Device telemetry update
- `status_update` - Device status change
- `widget_update` - Widget value update
- `notification` - New notification
- `device_added` - New device added
- `device_removed` - Device removed
- `ping` / `pong` - Keep-alive

### ✅ Event Stream (SSE)
- **Endpoint**: `GET /events/stream`
- **Headers**: `Authorization: Bearer <token>`, `Accept: text/event-stream`
- **Response**: Server-Sent Events stream
- **Status**: ✅ Integrated

## Security Rules Integration

All API calls respect the backend security rules:

1. **Authentication Required**: Most endpoints require `Authorization: Bearer <token>` header
2. **Ownership Verification**: Users can only access their own resources
3. **Token Refresh**: Automatic token refresh on 401 errors
4. **Error Handling**: Proper error messages from backend

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message"
}
```

### Validation Errors
```json
{
  "detail": [
    {
      "loc": ["field", "subfield"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request
- `401` - Unauthorized (triggers token refresh)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## API Service Usage

### Import
```javascript
import API from '../services/api';
```

### Example Usage
```javascript
// Login
const data = await API.login(username, password);
await AsyncStorage.setItem('userToken', data.access_token);

// Get Devices
const devices = await API.getDevices();

// Create Device
const newDevice = await API.addDevice({ name: 'My Device' });

// Update Widget State
await API.setWidgetState(widgetId, 1); // Turn LED ON
```

## Testing Checklist

- [x] Authentication (login, signup, logout)
- [x] Token refresh
- [x] Password reset flow
- [x] Device CRUD operations
- [x] Dashboard CRUD operations
- [x] Widget CRUD operations
- [x] Widget state control (LED)
- [x] Widget scheduling
- [x] Telemetry fetching
- [x] Notifications
- [x] WebSocket real-time updates
- [x] SSE streams
- [ ] Webhooks (newly added, needs testing)

## Notes

1. **Refresh Token**: Uses query parameter format: `/refresh?refresh_token=<token>`
2. **Reset Token**: Token is uppercase 8-character code
3. **Widget Schedules**: Times are in IST (Indian Standard Time)
4. **WebSocket**: Automatically reconnects on disconnect
5. **Rate Limiting**: Backend enforces 100 requests/minute per IP

