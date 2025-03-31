// Helper function to create a rounded square favicon SVG based on time remaining
export function createDynamicFavicon(timeLeftMinutes: number, isFlashing: boolean = false): string {
  // Colors based on time remaining
  let color: string;

  if (timeLeftMinutes > 10) {
    color = "#8B9A71"; // More than 10 minutes - green
  } else if (timeLeftMinutes > 6) {
    color = "#E9C164"; // Between 6-10 minutes - yellow
  } else if (timeLeftMinutes > 2) {
    color = "#fdb580"; // Between 2-6 minutes - orange
  } else {
    // Less than 2 minutes - red
    // If less than 30 seconds and should flash, toggle between two colors
    color = isFlashing ? "#e02f58" : "#6E2032";
  }

  // Create SVG for a rounded square - keep it simple to avoid encoding issues
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="60" height="60" x="2" y="2" rx="12" ry="12" fill="${color}"/></svg>`;

  // Convert SVG to data URL with proper encoding
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Function to update the favicon based on time remaining
export function updateFavicon(timeLeftMinutes: number, timeLeftSeconds: number, isOutsideSchoolHours: boolean = false): void {
  if (typeof document === 'undefined') return; // Safety check for SSR

  // Default favicon for outside school hours (gray)
  if (isOutsideSchoolHours) {
    setFavicon("#4a4a4a");
    return;
  }

  // Check if we should flash (less than 30 seconds)
  const shouldFlash = timeLeftMinutes === 0 && timeLeftSeconds < 30;

  // Create the dynamic favicon
  const faviconUrl = createDynamicFavicon(timeLeftMinutes + (timeLeftSeconds / 60), shouldFlash);

  // Set the favicon
  const linkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (linkElement) {
    linkElement.href = faviconUrl;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = faviconUrl;
    document.head.appendChild(newLink);
  }
}

// Helper function to set a solid color favicon
export function setFavicon(color: string): void {
  if (typeof document === 'undefined') return; // Safety check for SSR

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="60" height="60" x="2" y="2" rx="12" ry="12" fill="${color}"/></svg>`;

  const faviconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const linkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (linkElement) {
    linkElement.href = faviconUrl;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = faviconUrl;
    document.head.appendChild(newLink);
  }
}
