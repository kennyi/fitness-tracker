// Global variables
let currentDayIndex = 0;
let actualTodayIndex = 0;
let weekOffset = 0;
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const workoutIds = ['monday-workout', 'tuesday-workout', 'wednesday-workout', 'thursday-workout', 'friday-workout', 'saturday-workout', 'sunday-workout'];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    getCurrentDay();
    updateDayDisplay();
    loadProgress();
    updateDailyProgress();
    updateProgressStats();
    updateWeeklyOverview();
    bindEventListeners();
    console.log('App initialization complete');
});

function bindEventListeners() {
    console.log('Binding event listeners...');
    
    // Day navigation buttons
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Previous day clicked');
            goToPreviousDay();
        });
        console.log('Previous button listener added');
    } else {
        console.error('Previous button not found');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Next day clicked');
            goToNextDay();
        });
        console.log('Next button listener added');
    } else {
        console.error('Next button not found');
    }
    
    // Week selector buttons
    const weekBtns = document.querySelectorAll('.week-btn');
    console.log(`Found ${weekBtns.length} week buttons`);
    weekBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const weekNum = parseInt(this.dataset.week);
            console.log(`Week ${weekNum} clicked`);
            switchWeek(weekNum, this);
        });
    });
    
    // Exercise checkboxes - using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('exercise-checkbox')) {
            console.log('Exercise checkbox clicked');
            toggleExercise(e.target);
        }
    });
    console.log('Exercise checkbox delegation added');
    
    // Tab navigation
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`Found ${navItems.length} nav items`);
    navItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const label = this.querySelector('.nav-label');
            if (label) {
                const tabName = label.textContent.toLowerCase();
                console.log(`Tab ${tabName} clicked`);
                switchTab(tabName);
            }
        });
    });
    
    // Reset button
    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            console.log('Reset button clicked');
            resetAllProgress();
        });
        console.log('Reset button listener added');
    } else {
        console.error('Reset button not found');
    }
    
    console.log('All event listeners bound');
    
    // Timer button event listeners
    bindTimerListeners();
}

function bindTimerListeners() {
    // Timer buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('timer-btn')) {
            console.log('Timer button clicked');
            startTimer(e.target);
        }
    });
    
    // Timer modal controls
    const closeTimer = document.getElementById('close-timer');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerSkip = document.getElementById('timer-skip');
    
    if (closeTimer) {
        closeTimer.addEventListener('click', closeTimerModal);
    }
    
    if (timerStart) {
        timerStart.addEventListener('click', toggleTimer);
    }
    
    if (timerPause) {
        timerPause.addEventListener('click', pauseTimer);
    }
    
    if (timerSkip) {
        timerSkip.addEventListener('click', skipTimerPhase);
    }
    
    console.log('Timer listeners bound');
}

function getCurrentDay() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    actualTodayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentDayIndex = actualTodayIndex;
    console.log(`Current day index: ${currentDayIndex}`);
}

function updateDayDisplay() {
    console.log(`Updating day display for day ${currentDayIndex}`);
    
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
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = dateString;
        console.log(`Updated date to: ${dateString}`);
    }
    
    const dayMessages = {
        0: "Upper Body Power - Build strength with compound movements!",
        1: "Pool Session - Low-impact cardio and technique work!",
        2: "Lower Body Strength - Power through squats and deadlifts!",
        3: "Squash Session - Explosive movement and agility training!",
        4: "Full Body HIIT - High intensity with gym equipment!",
        5: "Long Swim - Endurance building in the pool!",
        6: "Complete Rest - Recovery and planning for next week!"
    };
    
    const currentMessageEl = document.getElementById('current-day-message');
    if (currentMessageEl) {
        currentMessageEl.textContent = dayMessages[currentDayIndex];
    }
    
    // Show/hide workout cards
    workoutIds.forEach((id, index) => {
        const card = document.getElementById(id);
        if (card) {
            if (index === currentDayIndex) {
                card.classList.add('active');
                console.log(`Activated workout card: ${id}`);
            } else {
                card.classList.remove('active');
            }
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
    const prevBtn = document.getElementById('prev-day-btn');
    const nextBtn = document.getElementById('next-day-btn');
    if (prevBtn) prevBtn.disabled = currentDayIndex === 0;
    if (nextBtn) nextBtn.disabled = currentDayIndex === 6;
    
    updateDailyProgress();
}

function goToPreviousDay() {
    console.log('goToPreviousDay called');
    if (currentDayIndex > 0) {
        currentDayIndex--;
        console.log(`Moving to day ${currentDayIndex}`);
        updateDayDisplay();
    }
}

function goToNextDay() {
    console.log('goToNextDay called');
    if (currentDayIndex < 6) {
        currentDayIndex++;
        console.log(`Moving to day ${currentDayIndex}`);
        updateDayDisplay();
    }
}

function switchTab(tabName) {
    console.log(`switchTab called with: ${tabName}`);
    
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
        console.log(`Activated tab: ${tabName}`);
    } else {
        console.error(`Tab not found: ${tabName}`);
    }
    
    // Mark clicked nav item as active
    document.querySelectorAll('.nav-item').forEach(item => {
        const label = item.querySelector('.nav-label');
        if (label && label.textContent.toLowerCase() === tabName.toLowerCase()) {
            item.classList.add('active');
            console.log(`Activated nav item for: ${tabName}`);
        }
    });
}

function switchWeek(weekNum, element) {
    console.log(`switchWeek called with week: ${weekNum}`);
    weekOffset = weekNum - 1;
    currentDayIndex = 0;
    
    // Update week button states
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
        console.log(`Activated week button: ${weekNum}`);
    }
    
    updateDayDisplay();
}

function toggleExercise(checkbox) {
    console.log('toggleExercise called');
    checkbox.classList.toggle('checked');
    if (checkbox.classList.contains('checked')) {
        checkbox.innerHTML = '✓';
        console.log('Exercise marked as completed');
    } else {
        checkbox.innerHTML = '';
        console.log('Exercise marked as incomplete');
    }
    
    saveProgress();
    updateDailyProgress();
}

function updateDailyProgress() {
    const currentWorkout = document.querySelector('.workout-card.active');
    if (!currentWorkout) {
        console.log('No active workout found');
        return;
    }
    
    const allExercises = currentWorkout.querySelectorAll('.exercise-checkbox');
    const completedExercises = currentWorkout.querySelectorAll('.exercise-checkbox.checked');
    
    if (allExercises.length === 0) {
        console.log('No exercises found in current workout');
        return;
    }
    
    const percentage = Math.round((completedExercises.length / allExercises.length) * 100);
    const progressElement = document.getElementById('daily-progress');
    if (progressElement) {
        progressElement.textContent = percentage + '%';
        console.log(`Updated daily progress to: ${percentage}%`);
    }
    
    // Update progress statistics
    updateProgressStats();
    updateWeeklyOverview();
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
    
    try {
        localStorage.setItem('fittracker-progress', JSON.stringify(progress));
        console.log('Progress saved to localStorage');
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

function loadProgress() {
    const saved = localStorage.getItem('fittracker-progress');
    if (!saved) {
        console.log('No saved progress found');
        return;
    }
    
    try {
        const progress = JSON.parse(saved);
        console.log('Loading saved progress...');
        
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
        console.log('Progress loaded successfully');
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function resetAllProgress() {
    console.log('resetAllProgress called');
    if (confirm('Are you sure you want to reset all progress?')) {
        localStorage.removeItem('fittracker-progress');
        document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
            checkbox.classList.remove('checked');
            checkbox.innerHTML = '';
        });
        updateDailyProgress();
        console.log('All progress reset');
    }
}

function updateProgressStats() {
    // Count completed workouts this week
    let weeklyCompletedWorkouts = 0;
    workoutIds.forEach((workoutId, dayIndex) => {
        const workout = document.getElementById(workoutId);
        if (workout) {
            const allExercises = workout.querySelectorAll('.exercise-checkbox');
            const completedExercises = workout.querySelectorAll('.exercise-checkbox.checked');
            
            // Consider workout completed if 80% or more exercises are done
            if (allExercises.length > 0 && (completedExercises.length / allExercises.length) >= 0.8) {
                weeklyCompletedWorkouts++;
            }
        }
    });
    
    // Update display
    const workoutElement = document.getElementById('workouts-completed');
    if (workoutElement) {
        workoutElement.textContent = weeklyCompletedWorkouts;
    }
    
    // Calculate streak
    let currentStreak = 0;
    for (let i = actualTodayIndex; i >= 0; i--) {
        const workout = document.getElementById(workoutIds[i]);
        if (workout) {
            const allExercises = workout.querySelectorAll('.exercise-checkbox');
            const completedExercises = workout.querySelectorAll('.exercise-checkbox.checked');
            
            if (allExercises.length > 0 && (completedExercises.length / allExercises.length) >= 0.8) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    
    const streakElement = document.getElementById('current-streak');
    if (streakElement) {
        streakElement.textContent = currentStreak;
    }
    
    // Total workouts
    const totalElement = document.getElementById('total-workouts');
    if (totalElement) {
        totalElement.textContent = weeklyCompletedWorkouts;
    }
}

function updateWeeklyOverview() {
    workoutIds.forEach((workoutId, dayIndex) => {
        const workout = document.getElementById(workoutId);
        const dayProgressElement = document.querySelector(`.day-progress[data-day="${dayIndex}"] .day-status`);
        
        if (workout && dayProgressElement) {
            const allExercises = workout.querySelectorAll('.exercise-checkbox');
            const completedExercises = workout.querySelectorAll('.exercise-checkbox.checked');
            
            // Remove existing classes
            dayProgressElement.classList.remove('completed', 'partial');
            
            if (allExercises.length > 0) {
                const completionRate = completedExercises.length / allExercises.length;
                
                if (completionRate >= 0.8) {
                    dayProgressElement.classList.add('completed');
                } else if (completionRate > 0) {
                    dayProgressElement.classList.add('partial');
                }
            }
        }
    });
}

// PWA Support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}

// Make functions globally available for debugging
window.goToPreviousDay = goToPreviousDay;
window.goToNextDay = goToNextDay;
window.switchTab = switchTab;
window.switchWeek = switchWeek;
window.toggleExercise = toggleExercise;
window.resetAllProgress = resetAllProgress;

// Timer System
let currentTimer = null;
let timerInterval = null;
let timerState = {
    isRunning: false,
    isPaused: false,
    currentPhase: 'ready', // 'ready', 'work', 'rest', 'complete'
    currentSet: 1,
    totalSets: 1,
    timeRemaining: 0,
    totalTime: 0,
    exerciseData: null
};

function startTimer(button) {
    console.log('Starting timer for:', button.dataset.exercise);
    
    const exerciseData = {
        name: button.dataset.exercise,
        type: button.dataset.type,
        workTime: parseInt(button.dataset.work) || 0,
        restTime: parseInt(button.dataset.rest) || 60,
        laps: parseInt(button.dataset.laps) || 1,
        distance: button.dataset.distance || null
    };
    
    // Determine total sets based on exercise type
    if (exerciseData.type === 'strength') {
        exerciseData.totalSets = 4; // Default for strength exercises
    } else if (exerciseData.type === 'hiit') {
        exerciseData.totalSets = 4; // 4 rounds for HIIT
    } else if (exerciseData.type === 'swimming') {
        exerciseData.totalSets = exerciseData.laps;
    }
    
    initializeTimer(exerciseData);
    showTimerModal();
}

function initializeTimer(exerciseData) {
    currentTimer = exerciseData;
    timerState = {
        isRunning: false,
        isPaused: false,
        currentPhase: 'ready',
        currentSet: 1,
        totalSets: exerciseData.totalSets,
        timeRemaining: 0,
        totalTime: 0,
        exerciseData: exerciseData
    };
    
    updateTimerDisplay();
    console.log('Timer initialized:', timerState);
}

function showTimerModal() {
    const modal = document.getElementById('timer-modal');
    const exerciseName = document.getElementById('timer-exercise-name');
    
    if (modal && exerciseName) {
        exerciseName.textContent = formatExerciseName(currentTimer.name);
        modal.classList.add('active');
        updateTimerStats();
    }
}

function closeTimerModal() {
    const modal = document.getElementById('timer-modal');
    if (modal) {
        modal.classList.remove('active');
        stopTimer();
    }
}

function toggleTimer() {
    if (timerState.isRunning) {
        pauseTimer();
    } else {
        if (timerState.currentPhase === 'ready') {
            startWorkPhase();
        } else {
            resumeTimer();
        }
    }
}

function startWorkPhase() {
    console.log('Starting work phase');
    
    if (currentTimer.type === 'strength') {
        // For strength exercises, just start rest timer after "set"
        timerState.currentPhase = 'rest';
        timerState.timeRemaining = currentTimer.restTime;
        timerState.totalTime = currentTimer.restTime;
    } else if (currentTimer.type === 'hiit') {
        // Start work interval
        timerState.currentPhase = 'work';
        timerState.timeRemaining = currentTimer.workTime;
        timerState.totalTime = currentTimer.workTime;
    } else if (currentTimer.type === 'swimming') {
        // Start swimming interval
        timerState.currentPhase = 'work';
        timerState.timeRemaining = 90; // 90 seconds for 50m lap estimate
        timerState.totalTime = 90;
    }
    
    timerState.isRunning = true;
    timerState.isPaused = false;
    
    startTimerInterval();
    updateTimerDisplay();
    updateTimerControls();
}

function startTimerInterval() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        if (timerState.isRunning && !timerState.isPaused) {
            timerState.timeRemaining--;
            
            if (timerState.timeRemaining <= 0) {
                handlePhaseComplete();
            }
            
            updateTimerDisplay();
            updateProgressCircle();
        }
    }, 1000);
}

function handlePhaseComplete() {
    console.log('Phase complete:', timerState.currentPhase);
    
    if (timerState.currentPhase === 'work') {
        // Work phase complete, start rest
        if (currentTimer.type === 'hiit' || currentTimer.type === 'swimming') {
            timerState.currentPhase = 'rest';
            timerState.timeRemaining = currentTimer.restTime;
            timerState.totalTime = currentTimer.restTime;
        }
    } else if (timerState.currentPhase === 'rest') {
        // Rest complete, move to next set or finish
        timerState.currentSet++;
        
        if (timerState.currentSet <= timerState.totalSets) {
            // Start next set
            startWorkPhase();
        } else {
            // Workout complete
            completeWorkout();
        }
    }
    
    updateTimerStats();
    updateTimerDisplay();
}

function pauseTimer() {
    timerState.isPaused = true;
    updateTimerControls();
    console.log('Timer paused');
}

function resumeTimer() {
    timerState.isPaused = false;
    updateTimerControls();
    console.log('Timer resumed');
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    timerState.isRunning = false;
    timerState.isPaused = false;
    console.log('Timer stopped');
}

function skipTimerPhase() {
    console.log('Skipping phase:', timerState.currentPhase);
    handlePhaseComplete();
}

function completeWorkout() {
    console.log('Workout completed!');
    timerState.currentPhase = 'complete';
    timerState.isRunning = false;
    
    // Mark exercise as completed
    markExerciseComplete();
    
    updateTimerDisplay();
    updateTimerControls();
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closeTimerModal();
    }, 3000);
}

function markExerciseComplete() {
    // Find the exercise checkbox and mark it as complete
    const exerciseCheckboxes = document.querySelectorAll('.exercise-checkbox');
    // This is a simplified approach - in a real app you'd want to match by exercise name
    // For now, just mark the first unchecked exercise in the current workout
    const currentWorkout = document.querySelector('.workout-card.active');
    if (currentWorkout) {
        const firstUnchecked = currentWorkout.querySelector('.exercise-checkbox:not(.checked)');
        if (firstUnchecked) {
            toggleExercise(firstUnchecked);
        }
    }
}

function updateTimerDisplay() {
    const timeElement = document.getElementById('timer-time');
    const phaseElement = document.getElementById('timer-phase');
    
    if (timeElement) {
        timeElement.textContent = formatTime(timerState.timeRemaining);
    }
    
    if (phaseElement) {
        phaseElement.textContent = getPhaseText();
    }
}

function updateTimerStats() {
    const currentSetElement = document.getElementById('timer-current-set');
    const totalSetsElement = document.getElementById('timer-total-sets');
    const completedElement = document.getElementById('timer-completed');
    
    if (currentSetElement) {
        currentSetElement.textContent = timerState.currentSet;
    }
    
    if (totalSetsElement) {
        totalSetsElement.textContent = timerState.totalSets;
    }
    
    if (completedElement) {
        completedElement.textContent = Math.max(0, timerState.currentSet - 1);
    }
}

function updateTimerControls() {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    
    if (startBtn) {
        if (timerState.isRunning && !timerState.isPaused) {
            startBtn.textContent = 'Pause';
            startBtn.className = 'timer-control-btn danger';
        } else {
            startBtn.textContent = timerState.currentPhase === 'ready' ? 'Start' : 'Resume';
            startBtn.className = 'timer-control-btn success';
        }
    }
}

function updateProgressCircle() {
    const circle = document.getElementById('timer-progress-circle');
    if (circle && timerState.totalTime > 0) {
        const progress = (timerState.totalTime - timerState.timeRemaining) / timerState.totalTime;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference * (1 - progress);
        
        circle.style.strokeDashoffset = offset;
        
        // Change color based on phase
        if (timerState.currentPhase === 'work') {
            circle.style.stroke = '#ff6b6b';
        } else if (timerState.currentPhase === 'rest') {
            circle.style.stroke = '#00b894';
        } else {
            circle.style.stroke = '#667eea';
        }
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatExerciseName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getPhaseText() {
    switch (timerState.currentPhase) {
        case 'ready': return 'Ready to start';
        case 'work': 
            if (currentTimer.type === 'strength') return 'Perform set';
            if (currentTimer.type === 'hiit') return 'Work hard!';
            if (currentTimer.type === 'swimming') return 'Swimming';
            return 'Work';
        case 'rest': return 'Rest period';
        case 'complete': return 'Well done!';
        default: return 'Ready';
    }
}