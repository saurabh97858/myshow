export const dateFormat = (date) => {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',   // e.g. Mon, Tue
    month: 'long',      // e.g. January
    day: 'numeric',     // e.g. 27
    hour: 'numeric',    // e.g. 5 PM
    minute: 'numeric'   // e.g. 09
  });
};
