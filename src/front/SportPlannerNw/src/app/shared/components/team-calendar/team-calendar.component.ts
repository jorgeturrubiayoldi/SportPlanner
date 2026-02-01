import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Plan } from '../../../core/services/plan.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: CalendarSession[];
}

interface CalendarSession {
  planId: string;
  title: string;
  color?: string;
}

@Component({
  selector: 'app-team-calendar',
  standalone: true,
  imports: [CommonModule, TranslateModule, DatePipe],
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.scss']
})
export class TeamCalendarComponent {
  @Input() plans: Plan[] = [];

  currentDate = signal(new Date());

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  calendarGrid = computed(() => {
    const today = new Date();
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start date for the grid (might be in previous month)
    // getDay() returns 0 for Sunday. We want Monday to be 0 for calculation if we start week on Mon.
    // Standard JS: Sun=0, Mon=1...Sat=6.
    // If we want Mon start: Mon=0...Sun=6.
    // let startDay = firstDay.getDay(); // 0(Sun) - 6(Sat)
    // Adjusted for Mon start: (day + 6) % 7
    const firstDayIndex = (firstDay.getDay() + 6) % 7; 
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDayIndex); // Go back to Monday

    const days: CalendarDay[] = [];
    // 6 weeks * 7 days = 42 cells to ensure full month coverage always
    // Or just enough to cover the month. Standard is often 35 or 42.
    // Let's generate until we cover the last day and finish the week.
    
    const iterDate = new Date(startDate);
    
    // We need at least enough days to cover the month.
    // Let's go for fixed 42 days (6 weeks) to keep UI stable
    for (let i = 0; i < 42; i++) {
      const d = new Date(iterDate);
      
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === month,
        isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
        sessions: this.getSessionsForDate(d)
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    return days;
  });

  monthLabel = computed(() => {
    return this.currentDate().toLocaleDateString('default', { month: 'long', year: 'numeric' });
  });

  private getSessionsForDate(date: Date): CalendarSession[] {
    const sessions: CalendarSession[] = [];
    if (!this.plans || this.plans.length === 0) return sessions;

    // Normalize date to start of day for comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Map JS getDay (0=Sun) to what is likely stored or English names.
    // Assuming trainingDays includes strings like 'Monday', 'Tuesday' etc.
    // or 'Mon', 'Tue'.
    // Let's implement robust checking.
    const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNameMap[checkDate.getDay()]; // e.g. "Monday"

    for (const plan of this.plans) {
      if (!plan.startDate || !plan.endDate) continue;

      const planStart = new Date(plan.startDate);
      const planEnd = new Date(plan.endDate);
      planStart.setHours(0, 0, 0, 0);
      planEnd.setHours(0, 0, 0, 0);

      // Check date range
      if (checkDate >= planStart && checkDate <= planEnd) {
        // Check Day of Week
        if (this.isTrainingDay(plan.trainingDays, dayName)) {
           sessions.push({
             planId: plan.id,
             title: plan.name,
             color: 'bg-primary' // Default color, could actally come from plan type
           });
        }
      }
    }

    return sessions;
  }

  private isTrainingDay(trainingDays: string[] | undefined, currentDayName: string): boolean {
      if (!trainingDays) return false;
      // Handle potential different formats (case insensitive, short vs long)
      return trainingDays.some(d => 
        d.toLowerCase() === currentDayName.toLowerCase() || 
        currentDayName.toLowerCase().startsWith(d.toLowerCase())
      );
  }

  previousMonth() {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  nextMonth() {
     this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }

  goToToday() {
    this.currentDate.set(new Date());
  }
}
