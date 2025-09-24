import { 
  OperatingHours, 
  DaySchedule, 
  DayOfWeek, 
  OperatingHoursValidationResult,
  DEFAULT_OPERATING_HOURS 
} from '../../domain/types/OperatingHours';

export class OperatingHoursUtils {
  private static readonly TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  private static readonly DAYS: DayOfWeek[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  /**
   * Validates the format of a time string (HH:MM)
   */
  static isValidTimeFormat(time: string): boolean {
    return this.TIME_PATTERN.test(time);
  }

  /**
   * Validates a single day schedule
   */
  static validateDaySchedule(daySchedule: DaySchedule, dayName: string): string[] {
    const errors: string[] = [];

    if (daySchedule.closed) {
      // If closed, we don't need to validate open/close times
      return errors;
    }

    if (!this.isValidTimeFormat(daySchedule.open)) {
      errors.push(`${dayName}: Invalid opening time format. Use HH:MM (24-hour format)`);
    }

    if (!this.isValidTimeFormat(daySchedule.close)) {
      errors.push(`${dayName}: Invalid closing time format. Use HH:MM (24-hour format)`);
    }

    if (this.isValidTimeFormat(daySchedule.open) && this.isValidTimeFormat(daySchedule.close)) {
      const openMinutes = this.timeToMinutes(daySchedule.open);
      const closeMinutes = this.timeToMinutes(daySchedule.close);

      // Allow closing time to be earlier than opening time (crossing midnight)
      // But both times should be different
      if (openMinutes === closeMinutes) {
        errors.push(`${dayName}: Opening and closing times cannot be the same`);
      }
    }

    return errors;
  }

  /**
   * Validates complete operating hours
   */
  static validateOperatingHours(operatingHours: OperatingHours): OperatingHoursValidationResult {
    const errors: string[] = [];

    // Check if all required days are present
    for (const day of this.DAYS) {
      if (!operatingHours[day]) {
        errors.push(`Missing schedule for ${day}`);
        continue;
      }

      const dayErrors = this.validateDaySchedule(operatingHours[day], day);
      errors.push(...dayErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if a location is currently open based on operating hours
   */
  static isCurrentlyOpen(operatingHours: OperatingHours, timezone?: string): boolean {
    const now = new Date();
    return this.isOpenAt(operatingHours, now, timezone);
  }

  /**
   * Checks if a location is open at a specific date/time
   */
  static isOpenAt(operatingHours: OperatingHours, dateTime: Date, timezone?: string): boolean {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[dateTime.getDay()] as DayOfWeek;
    
    const daySchedule = operatingHours[dayOfWeek];
    
    if (daySchedule.closed) {
      return false;
    }

    const currentMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
    const openMinutes = this.timeToMinutes(daySchedule.open);
    const closeMinutes = this.timeToMinutes(daySchedule.close);

    // Handle normal hours (e.g., 09:00 - 22:00)
    if (openMinutes < closeMinutes) {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }

    // Handle hours crossing midnight (e.g., 22:00 - 02:00)
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }

  /**
   * Gets the next opening time for a location
   */
  static getNextOpeningTime(operatingHours: OperatingHours, fromDateTime?: Date): Date | null {
    const startDate = fromDateTime || new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Check up to 7 days from now
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = dayNames[checkDate.getDay()] as DayOfWeek;
      const daySchedule = operatingHours[dayOfWeek];
      
      if (!daySchedule.closed) {
        const openingTime = new Date(checkDate);
        const [hoursStr, minutesStr] = daySchedule.open.split(':');
        const hours = parseInt(hoursStr || '0', 10);
        const minutes = parseInt(minutesStr || '0', 10);
        openingTime.setHours(hours, minutes, 0, 0);
        
        // If it's today, make sure the opening time is in the future
        if (i === 0 && openingTime <= startDate) {
          continue;
        }
        
        return openingTime;
      }
    }
    
    return null; // Closed for the next 7 days
  }

  /**
   * Converts time string (HH:MM) to minutes since midnight
   */
  private static timeToMinutes(time: string): number {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr || '0', 10);
    const minutes = parseInt(minutesStr || '0', 10);
    return hours * 60 + minutes;
  }

  /**
   * Converts minutes since midnight to time string (HH:MM)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Creates default operating hours
   */
  static getDefaultOperatingHours(): OperatingHours {
    return JSON.parse(JSON.stringify(DEFAULT_OPERATING_HOURS));
  }

  /**
   * Sanitizes and normalizes operating hours input
   */
  static sanitizeOperatingHours(input: Partial<OperatingHours>): OperatingHours {
    const result = this.getDefaultOperatingHours();
    
    for (const day of this.DAYS) {
      if (input[day]) {
        const dayInput = input[day]!;
        result[day] = {
          open: dayInput.open || result[day].open,
          close: dayInput.close || result[day].close,
          closed: Boolean(dayInput.closed)
        };
      }
    }
    
    return result;
  }
}