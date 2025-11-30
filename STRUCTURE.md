# Frontend Folder Structure

This project follows the standard Expo app structure.

## Directory Structure

```
frontend/
├── App.js                 # Main app component
├── AppNavigator.js        # Navigation configuration
├── index.js               # Entry point
├── package.json           # Dependencies
├── app.json              # Expo configuration
├── theme.js              # Theme configuration
│
├── assets/               # Static assets (images, fonts, etc.)
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
│
├── components/           # Reusable UI components
│   ├── CardWidget.js
│   ├── DeviceCard.js
│   ├── GaugeWidget.js
│   ├── IndicatorWidget.js
│   ├── LEDControlWidget.js
│   └── Toast.js
│
├── screens/             # Screen components (full pages)
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── ForgotPasswordScreen.js
│   ├── ResetPasswordScreen.js
│   ├── HomeScreen.js
│   ├── DevicesScreen.js
│   ├── DeviceDetailScreen.js
│   ├── DashboardScreen.js
│   ├── MainDashboardScreen.js
│   ├── NotificationsScreen.js
│   └── SettingsScreen.js
│
├── context/             # React Context providers
│   └── AuthContext.js
│
├── services/            # API services and external integrations
│   └── api.js
│
├── constants/           # Constants and configuration
│   └── config.js        # API URLs, WebSocket URLs, etc.
│
├── hooks/               # Custom React hooks (for future use)
│
└── utils/               # Utility functions (for future use)
```

## Import Paths

### Screens
```javascript
import HomeScreen from "./screens/HomeScreen";
import DevicesScreen from "./screens/DevicesScreen";
```

### Components
```javascript
import CardWidget from "./components/CardWidget";
import LEDControlWidget from "./components/LEDControlWidget";
```

### Constants
```javascript
import { BASE_URL, API_BASE, WS_URL } from "./constants/config";
```

### Context
```javascript
import { AuthContext, useAuth } from "./context/AuthContext";
```

### Services
```javascript
import API from "./services/api";
```

## Notes

- **Screens**: Full page components that are navigated to
- **Components**: Reusable UI components used across screens
- **Constants**: Configuration values, API endpoints, etc.
- **Context**: Global state management
- **Services**: API calls and external service integrations
- **Hooks**: Custom React hooks (currently empty, ready for future use)
- **Utils**: Helper functions (currently empty, ready for future use)

