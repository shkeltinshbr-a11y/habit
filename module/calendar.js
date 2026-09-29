/* =========================================================
   HABIT CALENDAR
   CALENDAR MODULE
   ========================================================= */
import {
    getDayStatus,
    getHabitStatistics
} from "../Statics/statics.js";
/* =========================================================
   STORAGE
   ========================================================= */
const USER_STORAGE_KEY = "habit_calendar_user";
const HABITS_STORAGE_KEY = "habit_calendar_habits";
/* =========================================================
   STATE
   ========================================================= */
let userName = "";
let habits = [];
/* =========================================================
   DOM
   ========================================================= */
const welcomeScreen =
    document.getElementById("welcomeScreen");
const habitScreen =
    document.getElementById("habitScreen");
const nameInput =
    document.getElementById("nameInput");
const continueButton =
    document.getElementById("continueButton");
const greeting =
    document.getElementById("greeting");
const currentMonth =
    document.getElementById("currentMonth");
const addHabitButton =
    document.getElementById("addHabitButton");
const addHabitPanel =
    document.getElementById("addHabitPanel");
const habitInput =
    document.getElementById("habitInput");
const saveHabitButton =
    document.getElementById("saveHabitButton");
const habitsList =
    document.getElementById("habitsList");
const emptyState =
    document.getElementById("emptyState");
/* =========================================================
   INITIALIZATION
   ========================================================= */
initialize();
function initialize() {
    loadUser();
    loadHabits();
    if (userName) {
        showHabitScreen();
    } else {
        showWelcomeScreen();
    }
    bindEvents();
}
/* =========================================================
   EVENTS
   ========================================================= */
function bindEvents() {
    continueButton.addEventListener(
        "click",
        handleNameSubmit
    );
    nameInput.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                handleNameSubmit();
            }
        }
    );
    addHabitButton.addEventListener(
        "click",
        toggleAddHabitPanel
    );
    saveHabitButton.addEventListener(
        "click",
        handleAddHabit
    );
    habitInput.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                handleAddHabit();
            }
        }
    );
}
/* =========================================================
   USER
   ========================================================= */
function loadUser() {
    userName =
        localStorage.getItem(USER_STORAGE_KEY) || "";
}
function saveUser() {
    localStorage.setItem(
        USER_STORAGE_KEY,
        userName
    );
}
/* =========================================================
   HABITS
   ========================================================= */
function loadHabits() {
    try {
        const stored =
            localStorage.getItem(HABITS_STORAGE_KEY);
        habits =
            stored
                ? JSON.parse(stored)
                : [];
        if (!Array.isArray(habits)) {
            habits = [];
        }
    } catch (error) {
        console.error(
            "Unable to load habits.",
            error
        );
        habits = [];
    }
}
function saveHabits() {
    localStorage.setItem(
        HABITS_STORAGE_KEY,
        JSON.stringify(habits)
    );
}
/* =========================================================
   SCREEN
   ========================================================= */
function showWelcomeScreen() {
    welcomeScreen.classList.remove("hidden");
    habitScreen.classList.add("hidden");
    setTimeout(() => {
        nameInput.focus();
    }, 100);
}
function showHabitScreen() {
    welcomeScreen.classList.add("hidden");
    habitScreen.classList.remove("hidden");
    renderHeader();
    renderHabits();
}
/* =========================================================
   NAME
   ========================================================= */
function handleNameSubmit() {
    const value =
        nameInput.value.trim();
    if (!value) {
        nameInput.focus();
        return;
    }
    userName = value;
    saveUser();
    showHabitScreen();
}
/* =========================================================
   HEADER
   ========================================================= */
function renderHeader() {
    const now = new Date();
    const hour =
        now.getHours();
    let greetingText = "Good evening";
    if (hour < 12) {
        greetingText = "Good morning";
    } else if (hour < 18) {
        greetingText = "Good afternoon";
    }
    greeting.textContent =
        `${greetingText}, ${userName}`;
    currentMonth.textContent =
        formatMonthYear(now);
}
/* =========================================================
   ADD HABIT PANEL
   ========================================================= */
function toggleAddHabitPanel() {
    const isHidden =
        addHabitPanel.classList.contains("hidden");
    addHabitPanel.classList.toggle(
        "hidden",
        !isHidden
    );
    if (isHidden) {
        setTimeout(() => {
            habitInput.focus();
        }, 100);
    }
}
/* =========================================================
   ADD HABIT
   ========================================================= */
function handleAddHabit() {
    const name =
        habitInput.value.trim();
    if (!name) {
        habitInput.focus();
        return;
    }
    const habit = {
        id:
            createId(),
        name,
        createdAt:
            getDateKey(new Date()),
        completions: {},
        isOpen: true
    };
    habits.unshift(habit);
    saveHabits();
    habitInput.value = "";
    addHabitPanel.classList.add("hidden");
    renderHabits();
}
/* =========================================================
   DELETE HABIT
   ========================================================= */
function deleteHabit(habitId) {
    const habit =
        habits.find(
            item => item.id === habitId
        );
    if (!habit) {
        return;
    }
    const confirmed =
        window.confirm(
            `Delete "${habit.name}"?`
        );
    if (!confirmed) {
        return;
    }
    habits =
        habits.filter(
            item => item.id !== habitId
        );
    saveHabits();
    renderHabits();
}
/* =========================================================
   TOGGLE CALENDAR
   ========================================================= */
function toggleCalendar(habitId) {
    const habit =
        habits.find(
            item => item.id === habitId
        );
    if (!habit) {
        return;
    }
    habit.isOpen =
        !habit.isOpen;
    saveHabits();
    renderHabits();
}
/* =========================================================
   TOGGLE DAY
   ========================================================= */
function toggleDay(habitId, date) {
    const targetDate =
        normalizeDate(date);
    const today =
        normalizeDate(new Date());
    /*
     * Future dates cannot be changed.
     */
    if (targetDate > today) {
        return;
    }
    /*
     * Past dates can be changed.
     * Today can also be completed manually.
     */
    const habit =
        habits.find(
            item => item.id === habitId
        );
    if (!habit) {
        return;
    }
    const key =
        getDateKey(targetDate);
    if (!habit.completions) {
        habit.completions = {};
    }
    if (habit.completions[key] === true) {
        delete habit.completions[key];
    } else {
        habit.completions[key] = true;
    }
    saveHabits();
    renderHabits();
}
/* =========================================================
   RENDER HABITS
   ========================================================= */
function renderHabits() {
    habitsList.innerHTML = "";
    emptyState.classList.toggle(
        "hidden",
        habits.length > 0
    );
    habits.forEach(habit => {
        const card =
            createHabitCard(habit);
        habitsList.appendChild(card);
    });
}
/* =========================================================
   CREATE HABIT CARD
   ========================================================= */
function createHabitCard(habit) {
    const card =
        document.createElement("article");
    card.className =
        "habit-card";
    if (habit.isOpen) {
        card.classList.add("is-open");
    }
    const header =
        document.createElement("button");
    header.type = "button";
    header.className = "habit-header";
    header.innerHTML = `
        <div class="habit-header-main">
            <div class="habit-name">
                ${escapeHtml(habit.name)}
            </div>
            <div class="habit-meta">
                <span>
                    ${getHabitMeta(habit)}
                </span>
            </div>
        </div>
        <div class="habit-chevron">
            ↓
        </div>
    `;
    header.addEventListener(
        "click",
        () => toggleCalendar(habit.id)
    );
    card.appendChild(header);
    if (habit.isOpen) {
        const calendar =
            createCalendar(habit);
        card.appendChild(calendar);
    }
    return card;
}
/* =========================================================
   CALENDAR
   ========================================================= */
function createCalendar(habit) {
    const container =
        document.createElement("div");
    container.className =
        "calendar-container";
    const divider =
        document.createElement("div");
    divider.className =
        "calendar-divider";
    container.appendChild(divider);
    const monthTitle =
        document.createElement("div");
    monthTitle.className =
        "calendar-month-title";
    monthTitle.textContent =
        formatMonthYear(new Date());
    container.appendChild(monthTitle);
    const weekdays =
        document.createElement("div");
    weekdays.className =
        "weekdays";
    getWeekdayNames().forEach(day => {
        const element =
            document.createElement("div");
        element.className =
            "weekday";
        element.textContent =
            day;
        weekdays.appendChild(element);
    });
    container.appendChild(weekdays);
    const grid =
        document.createElement("div");
    grid.className =
        "calendar-grid";
    renderMonthDays(
        grid,
        habit
    );
    container.appendChild(grid);
    const footer =
        document.createElement("div");
    footer.className =
        "habit-footer";
    const statistics =
        getHabitStatistics(habit);
    const stat =
        document.createElement("div");
    stat.className =
        "habit-stat";
    stat.textContent =
        `${statistics.completionRate}% completion · ${statistics.currentStreak} day streak`;
    footer.appendChild(stat);
    const deleteButton =
        document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
        "delete-habit";
    deleteButton.textContent =
        "DELETE";
    deleteButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            deleteHabit(habit.id);
        }
    );
    footer.appendChild(deleteButton);
    container.appendChild(footer);
    return container;
}
/* =========================================================
   RENDER MONTH
   ========================================================= */
function renderMonthDays(grid, habit) {
    const now =
        new Date();
    const year =
        now.getFullYear();
    const month =
        now.getMonth();
    const firstDay =
        new Date(year, month, 1);
    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();
    /*
     * Convert Sunday-first JavaScript index
     * to Monday-first calendar.
     */
    const firstWeekday =
        (firstDay.getDay() + 6) % 7;
    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {
        const empty =
            document.createElement("div");
        empty.className =
            "day-cell empty";
        grid.appendChild(empty);
    }
    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        const date =
            new Date(
                year,
                month,
                day
            );
        const status =
            getDayStatus(
                habit,
                date
            );
        const cell =
            document.createElement("button");
        cell.type = "button";
        cell.className =
            `day-cell ${status}`;
        cell.dataset.date =
            getDateKey(date);
        const number =
            document.createElement("span");
        number.className =
            "day-number";
        number.textContent =
            day;
        cell.appendChild(number);
        const symbol =
            document.createElement("span");
        symbol.className =
            "day-symbol";
        if (status === "completed") {
            symbol.textContent = "✓";
        }
        if (status === "missed") {
            symbol.textContent = "×";
        }
        cell.appendChild(symbol);
        if (status !== "future") {
            cell.addEventListener(
                "click",
                () => toggleDay(
                    habit.id,
                    date
                )
            );
        }
        grid.appendChild(cell);
    }
}
/* =========================================================
   HABIT META
   ========================================================= */
function getHabitMeta(habit) {
    const statistics =
        getHabitStatistics(habit);
    return `${statistics.completedDays} completed`;
}
/* =========================================================
   DATE HELPERS
   ========================================================= */
function normalizeDate(date) {
    const value =
        new Date(date);
    return new Date(
        value.getFullYear(),
        value.getMonth(),
        value.getDate()
    );
}
function getDateKey(date) {
    const value =
        normalizeDate(date);
    const year =
        value.getFullYear();
    const month =
        String(
            value.getMonth() + 1
        ).padStart(2, "0");
    const day =
        String(
            value.getDate()
        ).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
/* =========================================================
   FORMAT MONTH
   ========================================================= */
function formatMonthYear(date) {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    )
        .format(date)
        .toUpperCase();
}
/* =========================================================
   WEEKDAYS
   ========================================================= */
function getWeekdayNames() {
    return [
        "M",
        "T",
        "W",
        "T",
        "F",
        "S",
        "S"
    ];
}
/* =========================================================
   ID
   ========================================================= */
function createId() {
    return (
        "habit-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}
/* =========================================================
   HTML SAFETY
   ========================================================= */
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}