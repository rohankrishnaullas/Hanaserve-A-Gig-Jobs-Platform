import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Create the React plugin instance
const reactPlugin = new ReactPlugin();

// Application Insights configuration
// Set REACT_APP_APPINSIGHTS_CONNECTION_STRING in your .env file
const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.REACT_APP_APPINSIGHTS_CONNECTION_STRING || '',
    enableAutoRouteTracking: true, // Automatically track route changes
    extensions: [reactPlugin],
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    disableFetchTracking: false,
    disableAjaxTracking: false,
    autoTrackPageVisitTime: true,
    enableUnhandledPromiseRejectionTracking: true
  }
});

// Load Application Insights
appInsights.loadAppInsights();

// Track page views
appInsights.trackPageView();

// Set authenticated user context (non-anonymized)
export const setUserContext = (userId, accountId = null) => {
  appInsights.setAuthenticatedUserContext(userId, accountId, false); // false = not anonymized
};

// Clear user context on logout
export const clearUserContext = () => {
  appInsights.clearAuthenticatedUserContext();
};

// Custom logging functions (all are async by default in App Insights SDK)
export const logEvent = (name, properties = {}, measurements = {}) => {
  // Async - returns immediately, telemetry sent in background
  appInsights.trackEvent({ name }, properties, measurements);
};

export const logError = (error, properties = {}) => {
  const errorInfo = {
    message: error.message || String(error),
    stack: error.stack,
    ...properties
  };
  // Async - returns immediately, telemetry sent in background
  appInsights.trackException({ exception: error, properties: errorInfo });
};

export const logMetric = (name, average, properties = {}) => {
  // Async - returns immediately, telemetry sent in background
  appInsights.trackMetric({ name, average }, properties);
};

export const logTrace = (message, severityLevel = 1, properties = {}) => {
  // Async - returns immediately, telemetry sent in background
  appInsights.trackTrace({ message, severityLevel }, properties);
};

export const logDependency = (id, method, absoluteUrl, duration, success, resultCode) => {
  // Async - for tracking API calls and external dependencies
  appInsights.trackDependencyData({
    id,
    name: method,
    absoluteUrl,
    duration,
    success,
    resultCode
  });
};

export { reactPlugin, appInsights };
