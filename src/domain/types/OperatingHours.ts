/**
 * Represents the schedule for a single day
 */
export interface DaySchedule {
  /** Opening time in 24-hour format (HH:MM) */
  open: string;
  /** Closing time in 24-hour format (HH:MM) */
  close: string;
  /** Whether the location is closed all day */
  closed: boolean;
}

/**
 * Represents the complete weekly operating hours for a restaurant location
 */
export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

/**
 * Days of the week as keys for OperatingHours
 */
export type DayOfWeek = keyof OperatingHours;

/**
 * Default operating hours (Monday to Sunday 9:00-22:00)
 */
export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '22:00', closed: false },
  saturday: { open: '10:00', close: '22:00', closed: false },
  sunday: { open: '10:00', close: '21:00', closed: false }
};

/**
 * Validation result for operating hours
 */
export interface OperatingHoursValidationResult {
  isValid: boolean;
  errors: string[];
}