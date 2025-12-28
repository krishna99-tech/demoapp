# Virtual Pin (Virtual Address) Guide for LED Widgets

## Overview
Virtual pins allow multiple LED widgets to control different LEDs on the same device. Each LED widget gets a unique virtual pin identifier (e.g., v0, v1, v2).

## Virtual Pin Format

- **Format**: `v` followed by a number (e.g., `v0`, `v1`, `v2`, `v10`)
- **Case**: Automatically converted to lowercase by backend
- **Validation**: Must match regex pattern `/^v\d+$/`
- **Examples**: 
  - ✅ Valid: `v0`, `v1`, `v2`, `v10`, `v99`
  - ❌ Invalid: `V0` (will be lowercased), `v`, `0`, `pin0`, `v-1`

## How It Works

### Backend Behavior
1. **Auto-Assignment**: If no virtual_pin is provided when creating a widget, the backend automatically assigns the next available pin (starting from v0)
2. **Reuse**: When a widget is deleted, its virtual pin becomes available for reuse
3. **Storage**: Virtual pin is stored in `widget.config.virtual_pin`
4. **Telemetry Key**: The virtual pin is used as the key in telemetry data (e.g., `telemetry_json.v0 = 1`)

### Frontend Implementation

#### Creating Widgets
- **AddLedWidgetModal**: Optional virtual_pin input field
  - Leave empty: Backend auto-assigns next available pin
  - Enter value: Must be in format `v0`, `v1`, etc.
  - Validation: Checks format before submission

#### Editing Widgets
- **EditWidgetModal**: Edit virtual_pin for existing LED widgets
  - Shows current virtual_pin value
  - Allows changing to a different pin
  - Validates format before saving
  - Updates widget config via `PATCH /widgets/{widget_id}`

## Usage Examples

### Example 1: Auto-Assigned Pins
```javascript
// Create widget without virtual_pin
await api.addWidget({
  dashboard_id: "dashboard123",
  device_id: "device456",
  type: "led",
  label: "Living Room Light"
});
// Backend assigns v0 (first available)

// Create another widget
await api.addWidget({
  dashboard_id: "dashboard123",
  device_id: "device456",
  type: "led",
  label: "Kitchen Light"
});
// Backend assigns v1 (next available)
```

### Example 2: Manual Pin Assignment
```javascript
// Create widget with specific virtual_pin
await api.addWidget({
  dashboard_id: "dashboard123",
  device_id: "device456",
  type: "led",
  label: "Bedroom Light",
  config: {
    virtual_pin: "v5"
  }
});
// Uses v5 specifically
```

### Example 3: Editing Virtual Pin
```javascript
// Update widget's virtual_pin
await api.updateWidget(widgetId, {
  config: {
    virtual_pin: "v2"  // Change from v0 to v2
  }
});
```

## Telemetry Integration

When a device sends telemetry data:
```json
{
  "device_token": "abc123",
  "data": {
    "v0": 1,  // LED on virtual pin v0 is ON
    "v1": 0,  // LED on virtual pin v1 is OFF
    "v2": 1   // LED on virtual pin v2 is ON
  }
}
```

Each LED widget listens for its specific virtual pin:
- Widget with `virtual_pin: "v0"` listens for `data.v0`
- Widget with `virtual_pin: "v1"` listens for `data.v1`
- Widget with `virtual_pin: "v2"` listens for `data.v2`

## Best Practices

1. **Use Auto-Assignment**: Let the backend assign pins automatically unless you have a specific reason
2. **Consistent Naming**: Use sequential pins (v0, v1, v2) for easier management
3. **Documentation**: Label widgets clearly to indicate which physical LED they control
4. **Validation**: Always validate virtual pin format before sending to backend

## Troubleshooting

### Issue: Virtual pin not updating
- **Check**: Ensure widget config is being updated via `PATCH /widgets/{widget_id}`
- **Verify**: Check that `config.virtual_pin` is in the update payload

### Issue: Multiple widgets controlling same LED
- **Cause**: Two widgets have the same virtual_pin
- **Solution**: Change one widget's virtual_pin to a unique value

### Issue: Widget not responding to telemetry
- **Check**: Verify virtual_pin matches the key in telemetry data
- **Verify**: Ensure device_id matches between widget and telemetry

## API Endpoints

### Create Widget with Virtual Pin
```http
POST /widgets
Content-Type: application/json
Authorization: Bearer <token>

{
  "dashboard_id": "dashboard123",
  "device_id": "device456",
  "type": "led",
  "label": "LED Control",
  "config": {
    "virtual_pin": "v0"  // Optional
  }
}
```

### Update Widget Virtual Pin
```http
PATCH /widgets/{widget_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "config": {
    "virtual_pin": "v1"
  }
}
```

## Files Modified

1. ✅ `components/dashboard/AddLedWidgetModal.js` - Added virtual_pin input
2. ✅ `components/dashboard/EditWidgetModal.js` - Created edit modal with virtual_pin editing
3. ✅ `screens/DashboardScreen.js` - Integrated edit modal
4. ✅ `components/widgets/WidgetRenderer.js` - Fixed virtual_pin access (handles both flattened and nested)

