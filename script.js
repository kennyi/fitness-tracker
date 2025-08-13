// Global variables
let currentDayIndex = 0;
let actualTodayIndex = 0;
let weekOffset = 0;
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const workoutIds = ['monday-workout', 'tuesday-workout', 'wednesday-workout', 'thursday-workout', 'friday-workout', 'saturday-workout', 'sunday-workout'];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    getCurrentDay();
    updateDayDisplay();
    loadProgress();
    updateDailyProgress();
});

function getCurrentDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    actualTodayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentDayIndex = actualTodayIndex;
}

function updateDayDisplay() {
    // Calculate date for current viewing day
    const today = new Date();
    const currentWeekMonday = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
    
    const viewingDate = new Date(currentWeekMonday);
    viewingDate.setDate(currentWeekMonday.getDate() + (weekOffset * 7) + currentDayIndex);
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = viewingDate.toLocaleDateString('en-GB', options);
    
    // Update current day display
    document.getElementById('current-date').textContent = dateString;
    
    const dayMessages = {
        0: "Upper Body Power - Start strong with compound movements!",
        1: "Hill Cardio + Bands - Take advantage of your countryside location!",
        2: "Lower Body Strength - Build that foundation!",
        3: "Active Recovery Walk - Perfect for mobility and prep!",
        4: "Full Body HIIT - High intensity day with all equipment!",
        5: "Long Countryside Run - Enjoy the scenic cardio!",
        6: "Complete Rest - Recovery and prep for next week!"
    };
    
    document.getElementById('current-day-message').textContent = dayMessages[currentDayIndex];
    
    // Show/hide workout cards
    workoutIds.forEach((id, index) => {
        const card = document.getElementById(id);
        if (card) {
            card.classList.toggle('active', index === currentDayIndex);
        }
    });
    
    // Update progress dots
    const dots = document.querySelectorAll('.day-dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('today', 'active');
        
        if (weekOffset === 0 && index === actualTodayIndex) {
            dot.classList.add('today');
        }
        
        if (index === currentDayIndex) {
            dot.classList.add('active');
        }
    });
    
    // Update navigation buttons
    document.getElementById('prev-day-btn').disabled = currentDayIndex === 0;
    document.getElementById('next-day-btn').disabled = currentDayIndex === 6;
    
    updateDailyProgress();
}

function goToPreviousDay() {
    if (currentDayIndex > 0) {
        currentDayIndex--;
        updateDayDisplay();
    }
}

function goToNextDay() {
    if (currentDayIndex < 6) {
        currentDayIndex++;
        updateDayDisplay();
    }
}

function goToToday() {
    currentDayIndex = actualTodayIndex;
    weekOffset = 0;
    updateDayDisplay();
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Mark clicked nav item as active
    const clickedNav = event.target.closest('.nav-item');
    if (clickedNav) {
        clickedNav.classList.add('active');
    }
}

function switchWeek(weekNum, element) {
    weekOffset = weekNum - 1;
    currentDayIndex = 0;
    
    // Update week button states
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    }
    
    updateDayDisplay();
}

function toggleExercise(checkbox) {
    checkbox.classList.toggle('checked');
    if (checkbox.classList.contains('checked')) {
        checkbox.innerHTML = '✓';
    } else {
        checkbox.innerHTML = '';
    }
    
    saveProgress();
    updateDailyProgress();
}

function updateDailyProgress() {
    const currentWorkout = document.querySelector('.workout-card.active');
    if (!currentWorkout) return;
    
    const allExercises = currentWorkout.querySelectorAll('.exercise-checkbox');
    const completedExercises = currentWorkout.querySelectorAll('.exercise-checkbox.checked');
    
    if (allExercises.length === 0) return;
    
    const percentage = Math.round((completedExercises.length / allExercises.length) * 100);
    document.getElementById('daily-progress').textContent = percentage + '%';
}

function saveProgress() {
    const progress = {};
    
    workoutIds.forEach((workoutId, dayIndex) => {
        const workout = document.getElementById(workoutId);
        if (workout) {
            const exercises = workout.querySelectorAll('.exercise-checkbox');
            progress[dayIndex] = [];
            exercises.forEach((exercise, exerciseIndex) => {
                progress[dayIndex][exerciseIndex] = exercise.classList.contains('checked');
            });
        }
    });
    
    localStorage.setItem('fittracker-progress', JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem('fittracker-progress');
    if (!saved) return;
    
    const progress = JSON.parse(saved);
    
    workoutIds.forEach((workoutId, dayIndex) => {
        const workout = document.getElementById(workoutId);
        if (workout && progress[dayIndex]) {
            const exercises = workout.querySelectorAll('.exercise-checkbox');
            exercises.forEach((exercise, exerciseIndex) => {
                if (progress[dayIndex][exerciseIndex]) {
                    exercise.classList.add('checked');
                    exercise.innerHTML = '✓';
                }
            });
        }
    });
}

function resetAllProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('fittracker-progress');
        document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
            checkbox.classList.remove('checked');
            checkbox.innerHTML = '';
        });
        updateDailyProgress();
    }
}

// PWA Support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}