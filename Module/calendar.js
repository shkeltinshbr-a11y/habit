/* =========================================================
   HABIT
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
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", initialize);


function initialize() {

    cacheElements();

    loadUser();
    loadHabits();

    bindEvents();

    if (userName) {
        showHabitScreen();
    } else {
        showWelcomeScreen();
    }
}


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

let welcomeScreen;
let habitScreen;

let nameInput;
let continueButton;

let greeting;
let currentMonth;

let addHabitButton;
let addHabitPanel;

let habitInput;
let saveHabitButton;

let habitsList;
let emptyState;


function cacheElements() {

    welcomeScreen =
        document.getElementById("welcomeScreen");

    habitScreen =
        document.getElementById("habitScreen");

    nameInput =
        document.getElementById("nameInput");

    continueButton =
        document.getElementById("continueButton");

    greeting =
        document.getElementById("greeting");

    currentMonth =
        document.getElementById("currentMonth");

    addHabitButton =
        document.getElementById("addHabitButton");

    addHabitPanel =
        document.getElementById("addHabitPanel");

    habitInput =
        document.getElementById("habitInput");

    saveHabitButton =
        document.getElementById("saveHabitButton");

    habitsList =
        document.getElementById("habitsList");

    emptyState =
        document.getElementById("emptyState");


    const requiredElements = [
        welcomeScreen,
        habitScreen,
        nameInput,
        continueButton,
        greeting,
        currentMonth,
        addHabitButton,
        addHabitPanel,
        habitInput,
        saveHabitButton,
        habitsList,
        emptyState
    ];


    if (requiredElements.some(element => !element)) {

        console.error(
            "HABIT: one or more required HTML elements were not found."
        );

        return false;
    }


    return true;
}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

    if (!continueButton) {
        return;
    }


    continueButton.addEventListener(
        "click",
        handleNameSubmit
    );


    nameInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                event.preventDefault();

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
                event.preventDefault();

                handleAddHabit();
            }
        }
    );
}


/* =========================================================
   USER
   ========================================================= */

function loadUser() {

    try {

        userName =
            localStorage.getItem(
                USER_STORAGE_KEY
            ) || "";

    } catch (error) {

        console.error(
            "HABIT: unable to load user.",
            error
        );

        userName = "";
    }
}


function saveUser() {

    try {

        localStorage.setItem(
            USER_STORAGE_KEY,
            userName
        );

    } catch (error) {

        console.error(
            "HABIT: unable to save user.",
            error
        );
    }
}


/* =========================================================
   HABITS STORAGE
   ========================================================= */

function loadHabits() {

    try {

        const stored =
            localStorage.getItem(
                HABITS_STORAGE_KEY
            );


        habits =
            stored
                ? JSON.parse(stored)
                : [];


        if (!Array.isArray(habits)) {
            habits = [];
        }

    } catch (error) {

        console.error(
            "HABIT: unable to load habits.",
            error
        );

        habits = [];
    }
}


function saveHabits() {

    try {

        localStorage.setItem(
            HABITS_STORAGE_KEY,
            JSON.stringify(habits)
        );

    } catch (error) {

        console.error(
            "HABIT: unable to save habits.",
            error
        );
    }
}


/* =========================================================
   SCREENS
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
   NAME SUBMIT
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

    const now =
        new Date();


    const hour =
        now.getHours();


    let greetingText =
        "Good evening";


    if (hour < 12) {

        greetingText =
            "Good morning";

    } else if (hour < 18) {

        greetingText =
            "Good afternoon";
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

    console.log("HABIT: ADD HABIT clicked");

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
}function toggleAddHabitPanel() {

    const isHidden =
        addHabitPanel.classList.contains(
            "hidden"
        );


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

        id: createId(),

        name: name,

        createdAt:
            getDateKey(new Date()),

        completions: {},

        isOpen: true
    };


    habits.unshift(habit);


    saveHabits();


    habitInput.value = "";


    addHabitPanel.classList.add(
        "hidden"
    );


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


    if (targetDate > today) {
        return;
    }


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


    if (
        habit.completions[key] === true
    ) {

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

        card.classList.add(
            "is-open"
        );
    }


    const header =
        document.createElement("button");


    header.type = "button";

    header.className =
        "habit-header";


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
   CREATE CALENDAR
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
        formatMonthYear(
            new Date()
        );


    container.appendChild(
        monthTitle
    );


    const weekdays =
        document.createElement("div");


    weekdays.className =
        "weekdays";


    getWeekdayNames().forEach(
        day => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "weekday";


            element.textContent =
                day;


            weekdays.appendChild(
                element
            );
        }
    );


    container.appendChild(
        weekdays
    );


    const grid =
        document.createElement("div");


    grid.className =
        "calendar-grid";


    renderMonthDays(
        grid,
        habit
    );


    container.appendChild(
        grid
    );


    const footer =
        document.createElement("div");


    footer.className =
        "habit-footer";


    const statistics =
        getHabitStatistics(
            habit
        );


    const stat =
        document.createElement("div");


    stat.className =
        "habit-stat";


    stat.textContent =
        `${statistics.completionRate}% completion · ${statistics.currentStreak} day streak`;


    footer.appendChild(stat);


    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.className =
        "delete-habit";


    deleteButton.textContent =
        "DELETE";


    deleteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            deleteHabit(
                habit.id
            );
        }
    );


    footer.appendChild(
        deleteButton
    );


    container.appendChild(
        footer
    );


    return container;
}


/* =========================================================
   RENDER CURRENT MONTH
   ========================================================= */

function renderMonthDays(
    grid,
    habit
) {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const firstWeekday =
        (
            firstDay.getDay() + 6
        ) % 7;


    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "day-cell empty";


        grid.appendChild(
            empty
        );
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
            document.createElement(
                "button"
            );


        cell.type =
            "button";


        cell.className =
            `day-cell ${status}`;


        cell.dataset.date =
            getDateKey(date);


        const today =
            normalizeDate(
                new Date()
            );


        if (
            normalizeDate(date).getTime()
            === today.getTime()
        ) {

            cell.classList.add(
                "today"
            );
        }


        const number =
            document.createElement(
                "span"
            );


        number.className =
            "day-number";


        number.textContent =
            day;


        cell.appendChild(
            number
        );


        const symbol =
            document.createElement(
                "span"
            );


        symbol.className =
            "day-symbol";


        if (status === "completed") {

            symbol.textContent =
                "✓";
        }


        if (status === "missed") {

            symbol.textContent =
                "×";
        }


        cell.appendChild(
            symbol
        );


        if (status !== "future") {

            cell.addEventListener(
                "click",
                () => toggleDay(
                    habit.id,
                    date
                )
            );
        }


        grid.appendChild(
            cell
        );
    }
}


/* =========================================================
   HABIT META
   ========================================================= */

function getHabitMeta(habit) {

    const statistics =
        getHabitStatistics(
            habit
        );


    return `${statistics.completedDays} completed`;
}


/* =========================================================
   DATE
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
   MONTH FORMAT
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

console.log("HABIT: calendar.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("HABIT: DOM loaded");
    initialize();
});

