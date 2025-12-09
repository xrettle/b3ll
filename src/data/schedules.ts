export interface Period {
  name: string;
  startTime: string;
  endTime: string;
  duration?: string; // Duration in minutes (if shown)
  isPassing?: boolean;
  isAnnouncement?: boolean;
}

export interface Schedule {
  name: string;
  displayName: string;
  periods: Period[];
}

export const schedules: { [key: string]: Schedule } = {
  monday: {
    name: "monday",
    displayName: "Monday",
    periods: [
      { name: "Warning Bell", startTime: "8:25", endTime: "8:25" },
      { name: "Period 1", startTime: "8:30", endTime: "9:16", duration: "(46)" },
      { name: "Period 2", startTime: "9:19", endTime: "10:05", duration: "(46)" },
      { name: "Period 3", startTime: "10:08", endTime: "10:57", duration: "(49)", isAnnouncement: true },
      { name: "Brunch", startTime: "10:57", endTime: "11:11", duration: "(14)" },
      { name: "Period 4", startTime: "11:14", endTime: "12:00", duration: "(46)" },
      { name: "Period 5", startTime: "12:03", endTime: "12:49", duration: "(46)" },
      { name: "Lunch", startTime: "12:49", endTime: "1:25", duration: "(36)" },
      { name: "Period 6", startTime: "1:28", endTime: "2:14", duration: "(46)" },
      { name: "Period 7", startTime: "2:17", endTime: "3:03", duration: "(46)" },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  },
  tuesday: {
    name: "tuesday",
    displayName: "Tuesday",
    periods: [
      { name: "Warning Bell", startTime: "8:25", endTime: "8:25" },
      { name: "Period 1", startTime: "8:30", endTime: "9:12", duration: "(42)" },
      { name: "Period 2", startTime: "9:15", endTime: "9:57", duration: "(42)" },
      { name: "Period 3", startTime: "10:00", endTime: "10:42", duration: "(42)" },
      { name: "Brunch", startTime: "10:42", endTime: "10:56", duration: "(14)" },
      { name: "Tutorial", startTime: "10:59", endTime: "11:27", duration: "(28)" },
      { name: "Period 4", startTime: "11:30", endTime: "12:12", duration: "(42)" },
      { name: "Period 5", startTime: "12:15", endTime: "12:57", duration: "(42)" },
      { name: "Lunch", startTime: "12:57", endTime: "1:33", duration: "(36)" },
      { name: "Period 6", startTime: "1:36", endTime: "2:18", duration: "(42)" },
      { name: "Period 7", startTime: "2:21", endTime: "3:03", duration: "(42)" },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  },
  wednesday: {
    name: "wednesday",
    displayName: "Wednesday Block",
    periods: [
      { name: "Warning Bell", startTime: "9:12", endTime: "9:12" },
      { name: "Period 2", startTime: "9:17", endTime: "10:39", duration: "(82)" },
      { name: "Brunch", startTime: "10:39", endTime: "10:53", duration: "(14)" },
      { name: "Period 4", startTime: "10:56", endTime: "12:18", duration: "(82)" },
      { name: "Lunch", startTime: "12:18", endTime: "12:54", duration: "(36)" },
      { name: "Period 6", startTime: "12:57", endTime: "2:19", duration: "(82)" },
      { name: "Tutorial", startTime: "2:22", endTime: "3:03", duration: "(41)", isAnnouncement: true },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  },
  thursday: {
    name: "thursday",
    displayName: "Thursday Block",
    periods: [
      { name: "Warning Bell", startTime: "8:25", endTime: "8:25" },
      { name: "Period 1", startTime: "8:30", endTime: "9:52", duration: "(82)" },
      { name: "Break", startTime: "9:52", endTime: "9:58", duration: "(6)" },
      { name: "Period 3", startTime: "10:01", endTime: "11:23", duration: "(82)" },
      { name: "Brunch", startTime: "11:23", endTime: "11:37", duration: "(14)" },
      { name: "Period 5", startTime: "11:40", endTime: "1:02", duration: "(82)" },
      { name: "Lunch", startTime: "1:02", endTime: "1:38", duration: "(36)" },
      { name: "Period 7", startTime: "1:41", endTime: "3:03", duration: "(82)" },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  },
  friday: {
    name: "friday",
    displayName: "Friday",
    periods: [
      { name: "Warning Bell", startTime: "8:25", endTime: "8:25" },
      { name: "Period 1", startTime: "8:30", endTime: "9:12", duration: "(42)" },
      { name: "Period 2", startTime: "9:15", endTime: "9:57", duration: "(42)" },
      { name: "Period 3", startTime: "10:00", endTime: "10:42", duration: "(42)" },
      { name: "Brunch", startTime: "10:42", endTime: "10:56", duration: "(14)" },
      { name: "Advisory", startTime: "10:59", endTime: "11:27", duration: "(28)" },
      { name: "Period 4", startTime: "11:30", endTime: "12:12", duration: "(42)" },
      { name: "Period 5", startTime: "12:15", endTime: "12:57", duration: "(42)" },
      { name: "Lunch", startTime: "12:57", endTime: "1:33", duration: "(36)" },
      { name: "Period 6", startTime: "1:36", endTime: "2:18", duration: "(42)" },
      { name: "Period 7", startTime: "2:21", endTime: "3:03", duration: "(42)" },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  },
  saturday: {
    name: "saturday",
    displayName: "Saturday",
    periods: [
      { name: "Weekend", startTime: "0:00", endTime: "23:59", duration: "(24h)" }
    ]
  },
  sunday: {
    name: "sunday",
    displayName: "Sunday",
    periods: [
      { name: "Weekend", startTime: "0:00", endTime: "23:59", duration: "(24h)" }
    ]
  },
  minimumDay: {
    name: "minimumDay",
    displayName: "Minimum Day",
    periods: [
      { name: "Period 1", startTime: "8:30", endTime: "9:00" },
      { name: "Period 2", startTime: "9:03", endTime: "9:33" },
      { name: "Period 3", startTime: "9:36", endTime: "10:06" },
      { name: "Period 4", startTime: "10:09", endTime: "10:39" },
      { name: "Brunch", startTime: "10:39", endTime: "10:51" },
      { name: "Period 5", startTime: "10:54", endTime: "11:24" },
      { name: "Period 6", startTime: "11:27", endTime: "11:57" },
      { name: "Period 7", startTime: "12:00", endTime: "12:30" },
      { name: "Free", startTime: "12:30", endTime: "23:59" }
    ]
  },
  assembly: {
    name: "assembly",
    displayName: "Assembly",
    periods: [
      { name: "A", startTime: "8:30", endTime: "9:10" },
      { name: "B", startTime: "9:13", endTime: "9:53" },
      { name: "C", startTime: "9:56", endTime: "10:37" },
      { name: "Brunch", startTime: "10:37", endTime: "10:51" },
      { name: "D", startTime: "10:54", endTime: "11:34" },
      { name: "E", startTime: "11:37", endTime: "12:17" },
      { name: "Lunch", startTime: "12:17", endTime: "12:54" },
      { name: "F", startTime: "12:57", endTime: "1:37" },
      { name: "G", startTime: "1:40", endTime: "2:20" },
      { name: "H", startTime: "2:23", endTime: "3:03" },
      { name: "Free", startTime: "3:03", endTime: "23:59" }
    ]
  }
};

// Function to get current day schedule
export function getCurrentDaySchedule(): Schedule {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.

  switch (day) {
    case 0: // Sunday
      return schedules.sunday;
    case 1: // Monday
      return schedules.monday;
    case 2: // Tuesday
      return schedules.tuesday;
    case 3: // Wednesday
      return schedules.wednesday;
    case 4: // Thursday
      return schedules.thursday;
    case 5: // Friday
      return schedules.friday;
    case 6: // Saturday
      return schedules.saturday;
    default: // Fallback (should never happen)
      return schedules.monday;
  }
}

// Map assembly letters to period numbers for display
export const assemblyToPeriodMap: { [key: string]: string } = {
  "A": "Period 1",
  "B": "Period 2",
  "C": "Period 3",
  "D": "Period 4",
  "E": "Period 5",
  "F": "Period 6",
  "G": "Period 7",
  "H": "Period 7" // There is no Period 8, so H also maps to Period 7
};

// Function that maps assembly periods based on selected letter
export function getAssemblyPeriodName(letter: string, periodLetter: string): string {
  // If this is the selected assembly period
  if (periodLetter === letter) {
    return "Assembly";
  }

  // Otherwise map to the corresponding period number
  const periodNames: { [key: string]: string } = {
    "A": "Period 1",
    "B": "Period 2",
    "C": "Period 3",
    "D": "Period 4",
    "E": "Period 5",
    "F": "Period 6",
    "G": "Period 7",
    "H": "Period 7" // There is no Period 8, so H also maps to Period 7
  };

  return periodNames[periodLetter];
}
