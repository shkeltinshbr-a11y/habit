/* =========================================================
   HABIT CALENDAR
   STATISTICS MODULE
   ========================================================= */
/* =========================================================
   DATE HELPERS
   ========================================================= */
function normalizeDate(date) {
    const value = new Date(date);
    return new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
    );
}
function dateKey(date) {
    const value = normalizeDate(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
/* =========================================================
   GET HABIT DAY STATUS
   ========================================================= */
export function getDayStatus(habit, date) {
    const targetDate = normalizeDate(date);
    const today = normalizeDate(new Date());
    const key = dateKey(targetDate);
    if (targetDate > today) {
        return "future";
    }
    if (habit.completions && habit.completions[key] === true) {
        return "completed";
    }
    if (targetDate < today) {
        return "missed";
    }
    return "pending";
}
/* =========================================================
   GET HABIT DATES
   ========================================================= */
function getHabitDateRange(habit) {
    const createdAt = habit.createdAt
        ? normalizeDate(habit.createdAt)
        : normalizeDate(new Date());
    const today = normalizeDate(new Date());
    const start = createdAt < today
        ? createdAt
        : today;
    return {
        start,
        end: today
    };
}
/* =========================================================
   COMPLETION RATE
   ========================================================= */
export function calculateCompletionRate(habit) {
    const { start, end } = getHabitDateRange(habit);
    let totalDays = 0;
    let completedDays = 0;
    const current = new Date(start);
    while (current <= end) {
        totalDays++;
        if (getDayStatus(habit, current) === "completed") {
            completedDays++;
        }
        current.setDate(current.getDate() + 1);
    }
    if (totalDays === 0) {
        return 0;
    }
    return Math.round(
        (completedDays / totalDays) * 100
    );
}
/* =========================================================
   TOTAL COMPLETED DAYS
   ========================================================= */
export function calculateCompletedDays(habit) {
    const { start, end } = getHabitDateRange(habit);
    let completedDays = 0;
    const current = new Date(start);
    while (current <= end) {
        if (getDayStatus(habit, current) === "completed") {
            completedDays++;
        }
        current.setDate(current.getDate() + 1);
    }
    return completedDays;
}
/* =========================================================
   TOTAL MISSED DAYS
   ========================================================= */
export function calculateMissedDays(habit) {
    const { start, end } = getHabitDateRange(habit);
    let missedDays = 0;
    const current = new Date(start);
    while (current <= end) {
        if (getDayStatus(habit, current) === "missed") {
            missedDays++;
        }
        current.setDate(current.getDate() + 1);
    }
    return missedDays;
}
/* =========================================================
   CURRENT STREAK
   ========================================================= */
export function calculateCurrentStreak(habit) {
    const today = normalizeDate(new Date());
    let current = new Date(today);
    /*
     * If today has not been completed yet,
     * the current streak is calculated from yesterday.
     */
    if (getDayStatus(habit, current) === "pending") {
        current.setDate(current.getDate() - 1);
    }
    let streak = 0;
    while (true) {
        const status = getDayStatus(habit, current);
        if (status !== "completed") {
            break;
        }
        streak++;
        current.setDate(current.getDate() - 1);
    }
    return streak;
}
/* =========================================================
   LONGEST STREAK
   ========================================================= */
export function calculateLongestStreak(habit) {
    const { start, end } = getHabitDateRange(habit);
    let longest = 0;
    let currentStreak = 0;
    const current = new Date(start);
    while (current <= end) {
        const status = getDayStatus(habit, current);
        if (status === "completed") {
            currentStreak++;
            if (currentStreak > longest) {
                longest = currentStreak;
            }
        } else {
            currentStreak = 0;
        }
        current.setDate(current.getDate() + 1);
    }
    return longest;
}
/* =========================================================
   CONSECUTIVE MISSED DAYS
   ========================================================= */
export function calculateMissedInRow(habit) {
    const today = normalizeDate(new Date());
    let current = new Date(today);
    /*
     * Today is still pending until 23:59,
     * so today's unfinished state does not count
     * as a missed day.
     */
    if (getDayStatus(habit, current) === "pending") {
        current.setDate(current.getDate() - 1);
    }
    let missed = 0;
    while (true) {
        const status = getDayStatus(habit, current);
        if (status !== "missed") {
            break;
        }
        missed++;
        current.setDate(current.getDate() - 1);
    }
    return missed;
}
/* =========================================================
   HABIT STATISTICS
   ========================================================= */
export function getHabitStatistics(habit) {
    const { start, end } = getHabitDateRange(habit);
    const totalDays =
        Math.floor(
            (end - start) / 86400000
        ) + 1;
    const completedDays =
        calculateCompletedDays(habit);
    const missedDays =
        calculateMissedDays(habit);
    const completionRate =
        calculateCompletionRate(habit);
    const currentStreak =
        calculateCurrentStreak(habit);
    const longestStreak =
        calculateLongestStreak(habit);
    const missedInRow =
        calculateMissedInRow(habit);
    return {
        habitId: habit.id,
        totalDays,
        completedDays,
        missedDays,
        completionRate,
        currentStreak,
        longestStreak,
        missedInRow
    };
}
/* =========================================================
   ALL HABITS STATISTICS
   ========================================================= */
export function getAllStatistics(habits) {
    if (!Array.isArray(habits)) {
        return [];
    }
    return habits.map(
        habit => getHabitStatistics(habit)
    );
}