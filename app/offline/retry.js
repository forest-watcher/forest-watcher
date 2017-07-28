const decaySchedule = [
  1000 * 5, // After 5 seconds
  1000 * 15, // After 20 seconds
  1000 * 60, // After 1 minute
  1000 * 60 * 2 // After 2 minutes
];

export default (action, retries) => decaySchedule[retries] || null;
