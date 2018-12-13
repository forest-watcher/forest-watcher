export const GoogleAnalyticsTracker = jest.fn().mockImplementation(() => {
  return {
    trackEvent: jest.fn()
  };
});
