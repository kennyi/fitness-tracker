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
    
    // Exercise tracking event listeners
    bindTrackingListeners();
    
    // Profile event listeners
    bindProfileListeners();
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

function bindTrackingListeners() {
    // Log Set buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('log-btn')) {
            console.log('Log set button clicked');
            logExerciseSet(e.target);
        }
    });
    
    console.log('Exercise tracking listeners bound');
    
    // Load exercise history on startup
    loadExerciseHistory();
}

function bindProfileListeners() {
    try {
        // Save profile button
        const saveProfileBtn = document.getElementById('save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', saveUserProfile);
        }
        
        // Save equipment button
        const saveEquipmentBtn = document.getElementById('save-equipment');
        if (saveEquipmentBtn) {
            saveEquipmentBtn.addEventListener('click', saveUserEquipment);
        }
        
        // Log weight button
        const logWeightBtn = document.getElementById('log-weight');
        if (logWeightBtn) {
            logWeightBtn.addEventListener('click', logUserWeight);
        }
        
        // Goal weight input
        const goalWeightInput = document.getElementById('goal-weight');
        if (goalWeightInput) {
            goalWeightInput.addEventListener('change', saveGoalWeight);
        }
        
        // Weight input - allow Enter key to log weight
        const currentWeightInput = document.getElementById('current-weight');
        if (currentWeightInput) {
            currentWeightInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    logUserWeight();
                }
            });
        }
        
        console.log('Profile listeners bound');
        
        // Load profile data on startup
        loadUserProfile();
        loadUserEquipment();
        loadWeightHistory();
        
    } catch (error) {
        console.error('Error binding profile listeners:', error);
        showErrorMessage('Failed to set up profile features');
    }
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
    
    try {
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
            
            // If switching to profile tab, refresh weight chart
            if (tabName === 'profile') {
                updateWeightChart();
            }
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
        
        // Show/hide floating progress based on tab
        const floatingProgress = document.getElementById('daily-progress');
        if (floatingProgress) {
            if (tabName === 'workout') {
                floatingProgress.style.display = 'flex';
            } else {
                floatingProgress.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error switching tabs:', error);
        showErrorMessage('Failed to switch tabs');
    }
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
    updateProgressSummary();
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
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-progress');
        if (!saved) {
            console.log('No saved progress found');
            return;
        }
        
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
        showErrorMessage('Failed to load saved progress');
    }
}

function resetAllProgress() {
    console.log('resetAllProgress called');
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
        try {
            safeLocalStorageOperation('remove', 'fittracker-progress');
            document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
                checkbox.classList.remove('checked');
                checkbox.innerHTML = '';
            });
            updateDailyProgress();
            console.log('All progress reset');
        } catch (error) {
            console.error('Error resetting progress:', error);
            showErrorMessage('Failed to reset progress');
        }
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

// Exercise Tracking System
function logExerciseSet(button) {
    const exerciseName = button.dataset.exercise;
    const weightInput = document.querySelector(`.weight-input[data-exercise="${exerciseName}"]`);
    const repsInput = document.querySelector(`.reps-input[data-exercise="${exerciseName}"]`);
    
    if (!weightInput || !repsInput) {
        console.error('Weight or reps input not found for:', exerciseName);
        return;
    }
    
    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);
    
    if (!weight || !reps || weight <= 0 || reps <= 0) {
        alert('Please enter valid weight and reps');
        return;
    }
    
    // Calculate one-rep max using Epley formula: Weight * (1 + reps/30)
    const oneRepMax = weight * (1 + reps / 30);
    
    const setData = {
        weight: weight,
        reps: reps,
        oneRepMax: Math.round(oneRepMax * 10) / 10,
        date: new Date().toISOString(),
        volume: weight * reps
    };
    
    console.log('Logging set:', setData);
    
    // Save the set
    saveExerciseSet(exerciseName, setData);
    
    // Update display
    updateExerciseHistory(exerciseName);
    
    // Clear inputs
    weightInput.value = '';
    repsInput.value = '';
    
    // Mark button as logged
    button.classList.add('logged');
    button.textContent = 'Logged!';
    
    setTimeout(() => {
        button.classList.remove('logged');
        button.textContent = 'Log Set';
    }, 2000);
}

function saveExerciseSet(exerciseName, setData) {
    try {
        // Get existing data
        const saved = safeLocalStorageOperation('get', 'fittracker-exercise-history');
        let exerciseHistory = saved ? JSON.parse(saved) : {};
        
        // Initialize exercise if not exists
        if (!exerciseHistory[exerciseName]) {
            exerciseHistory[exerciseName] = {
                sets: [],
                personalRecords: {
                    maxWeight: 0,
                    maxReps: 0,
                    maxOneRepMax: 0,
                    maxVolume: 0
                }
            };
        }
        
        // Add new set
        exerciseHistory[exerciseName].sets.push(setData);
        
        // Update personal records
        const prs = exerciseHistory[exerciseName].personalRecords;
        let newPR = false;
        
        if (setData.weight > prs.maxWeight) {
            prs.maxWeight = setData.weight;
            newPR = true;
        }
        
        if (setData.reps > prs.maxReps) {
            prs.maxReps = setData.reps;
            newPR = true;
        }
        
        if (setData.oneRepMax > prs.maxOneRepMax) {
            prs.maxOneRepMax = setData.oneRepMax;
            newPR = true;
        }
        
        if (setData.volume > prs.maxVolume) {
            prs.maxVolume = setData.volume;
            newPR = true;
        }
        
        // Save to localStorage
        const saveSuccess = safeLocalStorageOperation('set', 'fittracker-exercise-history', JSON.stringify(exerciseHistory));
        
        if (saveSuccess) {
            // Show PR celebration if new record
            if (newPR) {
                celebratePersonalRecord(exerciseName);
            }
            
            console.log('Exercise set saved:', exerciseName, setData);
        } else {
            showErrorMessage('Failed to save exercise data');
        }
        
    } catch (error) {
        console.error('Error saving exercise set:', error);
        showErrorMessage('Failed to save exercise data');
    }
}

function loadExerciseHistory() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-exercise-history');
        if (!saved) return;
        
        const exerciseHistory = JSON.parse(saved);
        
        // Update displays for all exercises
        Object.keys(exerciseHistory).forEach(exerciseName => {
            updateExerciseHistory(exerciseName);
        });
        
        console.log('Exercise history loaded');
        
    } catch (error) {
        console.error('Error loading exercise history:', error);
    }
}

function updateExerciseHistory(exerciseName) {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-exercise-history');
        if (!saved) return;
        
        const exerciseHistory = JSON.parse(saved);
        const exerciseData = exerciseHistory[exerciseName];
        
        if (!exerciseData || exerciseData.sets.length === 0) return;
        
        // Get the history display element
        const historyElement = document.getElementById(`${exerciseName}-history`);
        if (!historyElement) return;
        
        // Get last performance
        const lastSet = exerciseData.sets[exerciseData.sets.length - 1];
        const lastPerformanceEl = historyElement.querySelector('.last-performance');
        const personalRecordEl = historyElement.querySelector('.personal-record');
        
        if (lastPerformanceEl) {
            lastPerformanceEl.textContent = `Last: ${lastSet.weight}kg x ${lastSet.reps}`;
        }
        
        if (personalRecordEl) {
            const prs = exerciseData.personalRecords;
            personalRecordEl.textContent = `PR: ${prs.maxOneRepMax}kg (1RM)`;
        }
        
    } catch (error) {
        console.error('Error updating exercise history:', error);
    }
}

function celebratePersonalRecord(exerciseName) {
    console.log('🎉 New Personal Record for:', exerciseName);
    
    const historyElement = document.getElementById(`${exerciseName}-history`);
    if (historyElement) {
        const prElement = historyElement.querySelector('.personal-record');
        if (prElement) {
            prElement.classList.add('new-pr');
            
            setTimeout(() => {
                prElement.classList.remove('new-pr');
            }, 2000);
        }
    }
    
    // Could add sound effect or more visual celebration here
}

function getExerciseStats(exerciseName) {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-exercise-history');
        if (!saved) return null;
        
        const exerciseHistory = JSON.parse(saved);
        return exerciseHistory[exerciseName] || null;
        
    } catch (error) {
        console.error('Error getting exercise stats:', error);
        return null;
    }
}

function updateProgressSummary() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-exercise-history');
        if (!saved) {
            // Show zero values if no data
            updateSummaryElement('total-sets-logged', '0');
            updateSummaryElement('total-prs', '0');
            updateSummaryElement('total-volume', '0kg');
            return;
        }
        
        const exerciseHistory = JSON.parse(saved);
        let totalSets = 0;
        let totalPRs = 0;
        let totalVolume = 0;
        
        Object.values(exerciseHistory).forEach(exercise => {
            totalSets += exercise.sets.length;
            totalVolume += exercise.sets.reduce((sum, set) => sum + set.volume, 0);
            
            // Count PRs (any non-zero personal record)
            const prs = exercise.personalRecords;
            if (prs.maxWeight > 0) totalPRs++;
            if (prs.maxReps > 0) totalPRs++;
            if (prs.maxOneRepMax > 0) totalPRs++;
            if (prs.maxVolume > 0) totalPRs++;
        });
        
        // Update display
        updateSummaryElement('total-sets-logged', totalSets.toString());
        updateSummaryElement('total-prs', totalPRs.toString());
        updateSummaryElement('total-volume', `${Math.round(totalVolume)}kg`);
        
    } catch (error) {
        console.error('Error updating progress summary:', error);
    }
}

function updateSummaryElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Enhanced error handling utility
function showErrorMessage(message) {
    console.error(message);
    // Could implement a toast notification system here
    // For now, just log to console
}

function safeLocalStorageOperation(operation, key, data = null) {
    try {
        switch (operation) {
            case 'get':
                return localStorage.getItem(key);
            case 'set':
                localStorage.setItem(key, data);
                return true;
            case 'remove':
                localStorage.removeItem(key);
                return true;
            default:
                throw new Error('Invalid localStorage operation');
        }
    } catch (error) {
        console.error(`localStorage ${operation} failed for key ${key}:`, error);
        
        if (error.name === 'QuotaExceededError') {
            showErrorMessage('Storage quota exceeded. Some data may not be saved.');
            // Could implement cleanup of old data here
        }
        
        return operation === 'get' ? null : false;
    }
}

// Enhanced Weight Tracking System
function logUserWeight() {
    try {
        const weightInput = document.getElementById('current-weight');
        if (!weightInput) {
            console.error('Weight input not found');
            return;
        }
        
        const weight = parseFloat(weightInput.value);
        if (isNaN(weight) || weight <= 0 || weight > 500) {
            alert('Please enter a valid weight between 1 and 500 kg');
            return;
        }
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const weightEntry = {
            weight: weight,
            date: now.toISOString(),
            dateOnly: today.toISOString().split('T')[0], // YYYY-MM-DD format
            timestamp: today.getTime(), // Use start of day for consistency
            displayDate: today.toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short'
            })
        };
        
        console.log('Logging weight:', weightEntry);
        
        // Get existing weight history
        const saved = safeLocalStorageOperation('get', 'fittracker-weight-history');
        let weightHistory = saved ? JSON.parse(saved) : [];
        
        // Check if there's already an entry for today
        const existingTodayIndex = weightHistory.findIndex(entry => 
            entry.dateOnly === weightEntry.dateOnly
        );
        
        if (existingTodayIndex !== -1) {
            // Update existing entry for today
            if (confirm('You already logged weight today. Update today\'s weight?')) {
                weightHistory[existingTodayIndex] = weightEntry;
                console.log('Updated today\'s weight entry');
            } else {
                return; // User cancelled
            }
        } else {
            // Add new entry
            weightHistory.push(weightEntry);
        }
        
        // Sort by date (newest first) and limit to last 100 entries
        weightHistory.sort((a, b) => b.timestamp - a.timestamp);
        weightHistory = weightHistory.slice(0, 100);
        
        // Save updated history
        const saveSuccess = safeLocalStorageOperation('set', 'fittracker-weight-history', JSON.stringify(weightHistory));
        
        if (saveSuccess) {
            console.log('Weight saved successfully');
            
            // Clear input
            weightInput.value = '';
            
            // Update displays
            updateWeightDisplays();
            updateWeightChart();
            updateWeightHistoryList();
            
            // Show success feedback
            const logBtn = document.getElementById('log-weight');
            if (logBtn) {
                const originalText = logBtn.textContent;
                logBtn.textContent = existingTodayIndex !== -1 ? 'Updated!' : 'Logged!';
                logBtn.style.background = '#00b894';
                
                setTimeout(() => {
                    logBtn.textContent = originalText;
                    logBtn.style.background = '';
                }, 2000);
            }
        } else {
            showErrorMessage('Failed to save weight data');
        }
        
    } catch (error) {
        console.error('Error logging weight:', error);
        showErrorMessage('Failed to log weight');
    }
}

function loadWeightHistory() {
    try {
        updateWeightDisplays();
        updateWeightChart();
        updateWeightHistoryList();
        console.log('Weight history loaded');
    } catch (error) {
        console.error('Error loading weight history:', error);
    }
}

function updateWeightDisplays() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-weight-history');
        const weightHistory = saved ? JSON.parse(saved) : [];
        
        const currentWeightDisplay = document.getElementById('current-weight-display');
        const goalWeightDisplay = document.getElementById('goal-weight-display');
        const weightChangeDisplay = document.getElementById('weight-change-display');
        
        if (weightHistory.length > 0) {
            const currentEntry = weightHistory[0];
            const currentWeight = currentEntry.weight;
            const startWeight = weightHistory[weightHistory.length - 1].weight;
            const weightChange = currentWeight - startWeight;
            
            if (currentWeightDisplay) {
                const displayText = `${currentWeight.toFixed(1)} kg`;
                const dateText = currentEntry.displayDate || 'Unknown date';
                currentWeightDisplay.innerHTML = `${displayText}<br><span style="font-size: 0.7em; color: #a0aec0;">${dateText}</span>`;
            }
            
            if (weightChangeDisplay) {
                const changeText = weightChange >= 0 ? `+${weightChange.toFixed(1)}` : `${weightChange.toFixed(1)}`;
                weightChangeDisplay.textContent = `${changeText} kg`;
                weightChangeDisplay.style.color = weightChange >= 0 ? '#ff6b6b' : '#00b894';
            }
        } else {
            if (currentWeightDisplay) currentWeightDisplay.textContent = '-- kg';
            if (weightChangeDisplay) weightChangeDisplay.textContent = '-- kg';
        }
        
        // Load goal weight
        const goalWeight = safeLocalStorageOperation('get', 'fittracker-goal-weight');
        if (goalWeightDisplay) {
            goalWeightDisplay.textContent = goalWeight ? `${goalWeight} kg` : '-- kg';
        }
        
    } catch (error) {
        console.error('Error updating weight displays:', error);
    }
}

function updateWeightChart() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-weight-history');
        const weightHistory = saved ? JSON.parse(saved) : [];
        
        const chartCanvas = document.getElementById('weight-chart');
        const chartPlaceholder = document.getElementById('chart-placeholder');
        
        if (!chartCanvas || !chartPlaceholder) return;
        
        if (weightHistory.length < 2) {
            // Show placeholder if not enough data
            chartCanvas.style.display = 'none';
            chartPlaceholder.style.display = 'flex';
            return;
        }
        
        // Hide placeholder and show chart
        chartPlaceholder.style.display = 'none';
        chartCanvas.style.display = 'block';
        
        // Draw chart using Canvas API
        const ctx = chartCanvas.getContext('2d');
        const rect = chartCanvas.getBoundingClientRect();
        chartCanvas.width = rect.width * window.devicePixelRatio;
        chartCanvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        const width = rect.width;
        const height = rect.height;
        const padding = 50; // Increased padding for date labels
        const bottomPadding = 70; // Extra space for date labels
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Sort data by date (oldest first for chart)
        const sortedData = [...weightHistory].sort((a, b) => a.timestamp - b.timestamp);
        
        // Get data ranges - anchor Y-axis to 0
        const weights = sortedData.map(entry => entry.weight);
        const maxWeight = Math.max(...weights);
        const minWeight = 0; // Anchor to 0
        const weightRange = maxWeight - minWeight;
        const chartTop = padding;
        const chartBottom = height - bottomPadding;
        const chartHeight = chartBottom - chartTop;
        
        // Chart styling
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#667eea';
        
        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1;
        
        // Y-axis
        ctx.moveTo(padding, chartTop);
        ctx.lineTo(padding, chartBottom);
        
        // X-axis  
        ctx.moveTo(padding, chartBottom);
        ctx.lineTo(width - padding, chartBottom);
        ctx.stroke();
        
        // Draw horizontal grid lines and Y-axis labels
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 0.5;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const weight = minWeight + (weightRange * i / gridLines);
            const y = chartBottom - (i / gridLines) * chartHeight;
            
            // Grid line
            if (i > 0) { // Don't draw grid line at bottom
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
            
            // Y-axis label
            ctx.fillStyle = '#a0aec0';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${weight.toFixed(0)}kg`, padding - 8, y + 4);
        }
        
        // Draw weight line
        ctx.beginPath();
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        
        sortedData.forEach((entry, index) => {
            const x = padding + (index / (sortedData.length - 1)) * (width - 2 * padding);
            const y = chartBottom - ((entry.weight - minWeight) / weightRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#667eea';
        sortedData.forEach((entry, index) => {
            const x = padding + (index / (sortedData.length - 1)) * (width - 2 * padding);
            const y = chartBottom - ((entry.weight - minWeight) / weightRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add white border to data points
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = '#667eea';
        });
        
        // Draw date labels (X-axis)
        ctx.fillStyle = '#a0aec0';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        
        // Show dates for first, last, and some intermediate points
        const maxDateLabels = Math.min(5, sortedData.length);
        const dateStep = Math.max(1, Math.floor(sortedData.length / (maxDateLabels - 1)));
        
        sortedData.forEach((entry, index) => {
            if (index === 0 || index === sortedData.length - 1 || index % dateStep === 0) {
                const x = padding + (index / (sortedData.length - 1)) * (width - 2 * padding);
                const dateLabel = entry.displayDate || new Date(entry.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                });
                
                // Rotate text for better fit
                ctx.save();
                ctx.translate(x, chartBottom + 15);
                ctx.rotate(-Math.PI / 6); // -30 degrees
                ctx.fillText(dateLabel, 0, 0);
                ctx.restore();
                
                // Add weight value above point
                ctx.fillStyle = '#2d3748';
                ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
                const y = chartBottom - ((entry.weight - minWeight) / weightRange) * chartHeight;
                ctx.fillText(`${entry.weight.toFixed(1)}`, x, y - 10);
                ctx.fillStyle = '#a0aec0';
                ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            }
        });
        
        // Add chart title
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Weight Progress Over Time', width / 2, 20);
        
        console.log('Weight chart updated with', sortedData.length, 'data points');
        
    } catch (error) {
        console.error('Error updating weight chart:', error);
    }
}

function saveGoalWeight() {
    try {
        const goalWeightInput = document.getElementById('goal-weight');
        if (!goalWeightInput) return;
        
        const goalWeight = parseFloat(goalWeightInput.value);
        if (isNaN(goalWeight) || goalWeight <= 0 || goalWeight > 500) {
            return; // Invalid input, don't save
        }
        
        safeLocalStorageOperation('set', 'fittracker-goal-weight', goalWeight.toString());
        updateWeightDisplays();
        console.log('Goal weight saved:', goalWeight);
        
    } catch (error) {
        console.error('Error saving goal weight:', error);
    }
}

function saveUserProfile() {
    try {
        const height = document.getElementById('user-height')?.value;
        const age = document.getElementById('user-age')?.value;
        const goal = document.getElementById('fitness-goal')?.value;
        
        const profile = {
            height: height ? parseFloat(height) : null,
            age: age ? parseInt(age) : null,
            goal: goal || null,
            lastUpdated: new Date().toISOString()
        };
        
        const saveSuccess = safeLocalStorageOperation('set', 'fittracker-profile', JSON.stringify(profile));
        
        if (saveSuccess) {
            console.log('Profile saved:', profile);
            
            // Show success feedback
            const saveBtn = document.getElementById('save-profile');
            if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = 'Saved!';
                saveBtn.style.background = '#00b894';
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.style.background = '';
                }, 2000);
            }
        } else {
            showErrorMessage('Failed to save profile');
        }
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showErrorMessage('Failed to save profile');
    }
}

function loadUserProfile() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-profile');
        if (!saved) return;
        
        const profile = JSON.parse(saved);
        
        if (profile.height) {
            const heightInput = document.getElementById('user-height');
            if (heightInput) heightInput.value = profile.height;
        }
        
        if (profile.age) {
            const ageInput = document.getElementById('user-age');
            if (ageInput) ageInput.value = profile.age;
        }
        
        if (profile.goal) {
            const goalSelect = document.getElementById('fitness-goal');
            if (goalSelect) goalSelect.value = profile.goal;
        }
        
        console.log('Profile loaded:', profile);
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function saveUserEquipment() {
    try {
        const equipment = {};
        const checkboxes = document.querySelectorAll('.equipment-checkbox');
        
        checkboxes.forEach(checkbox => {
            equipment[checkbox.id] = checkbox.checked;
        });
        
        const saveSuccess = safeLocalStorageOperation('set', 'fittracker-equipment', JSON.stringify(equipment));
        
        if (saveSuccess) {
            console.log('Equipment saved:', equipment);
            
            // Show success feedback
            const saveBtn = document.getElementById('save-equipment');
            if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = 'Saved!';
                saveBtn.style.background = '#00b894';
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.style.background = '';
                }, 2000);
            }
        } else {
            showErrorMessage('Failed to save equipment preferences');
        }
        
    } catch (error) {
        console.error('Error saving equipment:', error);
        showErrorMessage('Failed to save equipment preferences');
    }
}

function loadUserEquipment() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-equipment');
        if (!saved) return;
        
        const equipment = JSON.parse(saved);
        
        Object.keys(equipment).forEach(equipmentId => {
            const checkbox = document.getElementById(equipmentId);
            if (checkbox) {
                checkbox.checked = equipment[equipmentId];
            }
        });
        
        console.log('Equipment loaded:', equipment);
        
    } catch (error) {
        console.error('Error loading equipment:', error);
    }
}

function updateWeightHistoryList() {
    try {
        const saved = safeLocalStorageOperation('get', 'fittracker-weight-history');
        const weightHistory = saved ? JSON.parse(saved) : [];
        
        const historyList = document.getElementById('weight-history-list');
        if (!historyList) return;
        
        if (weightHistory.length === 0) {
            historyList.innerHTML = `
                <div class="weight-history-item">
                    <span class="history-date">No entries yet</span>
                    <span class="history-weight">Start tracking your weight!</span>
                </div>
            `;
            return;
        }
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayString = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            .toISOString().split('T')[0];
        
        // Sort by date (newest first) and show last 7 entries
        const sortedHistory = [...weightHistory]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 7);
        
        const historyHTML = sortedHistory.map(entry => {
            const isToday = entry.dateOnly === todayString;
            const displayDate = entry.displayDate || new Date(entry.date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            return `
                <div class="weight-history-item ${isToday ? 'today' : ''}">
                    <span class="history-date">${displayDate}${isToday ? ' (Today)' : ''}</span>
                    <span class="history-weight">${entry.weight.toFixed(1)} kg</span>
                </div>
            `;
        }).join('');
        
        historyList.innerHTML = historyHTML;
        
        console.log('Weight history list updated with', sortedHistory.length, 'entries');
        
    } catch (error) {
        console.error('Error updating weight history list:', error);
    }
}