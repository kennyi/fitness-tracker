// ========================================
// FIXED FITTRACKER PRO SCRIPT
// ========================================

// Global variables
let currentDayIndex = 0;
let actualTodayIndex = 0;
let weekOffset = 0;
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const workoutIds = ['workout-0', 'workout-1', 'workout-2', 'workout-3', 'workout-4', 'workout-5', 'workout-6'];

// Exercise Database
const exerciseDatabase = {
    categories: {
        'chest': ['Bench Press', 'Incline Bench Press', 'Push-ups', 'Dumbbell Press'],
        'back': ['Pull-ups', 'Lat Pulldown', 'Seated Cable Row', 'Bent-over Row'],
        'shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises'],
        'arms': ['Bicep Curls', 'Tricep Dips', 'Hammer Curls'],
        'legs': ['Squats', 'Leg Press', 'Lunges', 'Calf Raises'],
        'core': ['Plank', 'Crunches', 'Russian Twists'],
        'cardio': ['Running', 'Cycling', 'Swimming', 'Rowing']
    }
};

// Current workout state
let currentWorkout = {
    date: null,
    exercises: [],
    startTime: null,
    endTime: null,
    notes: ''
};

// ========================================
// CORE NAVIGATION FUNCTIONS
// ========================================

function getCurrentDay() {
    console.log('📅 Getting current day...');
    try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        actualTodayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        currentDayIndex = actualTodayIndex;
        console.log('📅 Today is day index:', currentDayIndex);
    } catch (error) {
        console.error('❌ Error getting current day:', error);
    }
}

function updateDayDisplay() {
    console.log('🔄 Updating day display for day', currentDayIndex);
    
    try {
        const today = new Date();
        const currentWeekMonday = new Date(today);
        const daysSinceMonday = (today.getDay() + 6) % 7;
        currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
        
        const viewingDate = new Date(currentWeekMonday);
        viewingDate.setDate(currentWeekMonday.getDate() + (weekOffset * 7) + currentDayIndex);
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = viewingDate.toLocaleDateString('en-GB', options);
        
        const currentDateEl = document.getElementById('current-date');
        if (currentDateEl) {
            currentDateEl.textContent = dateString;
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
        
        const prevBtn = document.getElementById('prev-day-btn');
        const nextBtn = document.getElementById('next-day-btn');
        if (prevBtn) prevBtn.disabled = currentDayIndex === 0;
        if (nextBtn) nextBtn.disabled = currentDayIndex === 6;
        
        workoutIds.forEach((id, index) => {
            const card = document.getElementById(id);
            if (card) {
                if (index === currentDayIndex) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        updateDailyProgress();
        
    } catch (error) {
        console.error('❌ Error updating day display:', error);
    }
}

function goToPreviousDay() {
    if (currentDayIndex > 0) {
        currentDayIndex--;
        updateDayDisplay();
        updateWorkoutForDay();
    }
}

function goToNextDay() {
    if (currentDayIndex < 6) {
        currentDayIndex++;
        updateDayDisplay();
        updateWorkoutForDay();
    }
}

function switchTab(tabName) {
    try {
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        navItems.forEach(item => {
            const label = item.querySelector('.nav-label');
            if (label && label.textContent.toLowerCase() === tabName.toLowerCase()) {
                item.classList.add('active');
            }
        });
        
        const floatingProgress = document.getElementById('daily-progress');
        if (floatingProgress) {
            if (tabName === 'workout') {
                floatingProgress.style.display = 'flex';
            } else {
                floatingProgress.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('❌ Error switching tabs:', error);
    }
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

// ========================================
// DAILY PROGRESS CALCULATION
// ========================================

function updateDailyProgress() {
    try {
        if (currentWorkout.exercises.length > 0) {
            const exercisesWithSets = currentWorkout.exercises.filter(ex => 
                ex.sets.length > 0 && ex.sets.some(set => set.reps > 0)
            );
            const completionRate = (exercisesWithSets.length / currentWorkout.exercises.length) * 100;
            const percentage = Math.round(completionRate);
            
            const progressElement = document.getElementById('daily-progress');
            if (progressElement) {
                progressElement.textContent = percentage + '%';
            }
            
            updateProgressStats();
            return;
        }
        
        const activeWorkoutCard = document.querySelector('.workout-card[style*="block"]');
        if (!activeWorkoutCard) {
            const progressElement = document.getElementById('daily-progress');
            if (progressElement) {
                progressElement.textContent = '0%';
            }
            return;
        }
        
        const allExercises = activeWorkoutCard.querySelectorAll('.exercise-checkbox');
        const completedExercises = activeWorkoutCard.querySelectorAll('.exercise-checkbox.checked');
        
        if (allExercises.length === 0) {
            const progressElement = document.getElementById('daily-progress');
            if (progressElement) {
                progressElement.textContent = '0%';
            }
            return;
        }
        
        const percentage = Math.round((completedExercises.length / allExercises.length) * 100);
        const progressElement = document.getElementById('daily-progress');
        if (progressElement) {
            progressElement.textContent = percentage + '%';
        }
        
        updateProgressStats();
        updateWeeklyOverview();
        
    } catch (error) {
        console.error('❌ Error updating daily progress:', error);
    }
}

function updateProgressStats() {
    try {
        let weeklyCompletedWorkouts = 0;
        workoutIds.forEach((workoutId) => {
            const workout = document.getElementById(workoutId);
            if (workout) {
                const allExercises = workout.querySelectorAll('.exercise-checkbox');
                const completedExercises = workout.querySelectorAll('.exercise-checkbox.checked');
                
                if (allExercises.length > 0 && (completedExercises.length / allExercises.length) >= 0.8) {
                    weeklyCompletedWorkouts++;
                }
            }
        });
        
        const workoutElement = document.getElementById('workouts-completed');
        if (workoutElement) {
            workoutElement.textContent = weeklyCompletedWorkouts;
        }
        
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
        
        const totalElement = document.getElementById('total-workouts');
        if (totalElement) {
            totalElement.textContent = weeklyCompletedWorkouts;
        }
        
    } catch (error) {
        console.error('❌ Error updating progress stats:', error);
    }
}

function updateWeeklyOverview() {
    try {
        workoutIds.forEach((workoutId, dayIndex) => {
            const workout = document.getElementById(workoutId);
            const dayProgressElement = document.querySelector(`.day-progress[data-day="${dayIndex}"] .day-status`);
            
            if (workout && dayProgressElement) {
                const allExercises = workout.querySelectorAll('.exercise-checkbox');
                const completedExercises = workout.querySelectorAll('.exercise-checkbox.checked');
                
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
    } catch (error) {
        console.error('❌ Error updating weekly overview:', error);
    }
}

// ========================================
// LOCAL STORAGE FUNCTIONS
// ========================================

function saveProgress() {
    try {
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
        
    } catch (error) {
        console.error('❌ Error saving progress:', error);
    }
}

function loadProgress() {
    try {
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
        
    } catch (error) {
        console.error('❌ Error loading progress:', error);
    }
}

function resetAllProgress() {
    if (confirm('Are you sure you want to reset all workout data? This action cannot be undone.')) {
        try {
            localStorage.removeItem('fittracker-workouts');
            localStorage.removeItem('fittracker-progress');
            
            currentWorkout.exercises = [];
            
            document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
                checkbox.classList.remove('checked');
                checkbox.innerHTML = '';
            });
            
            updateWorkoutDisplay();
            loadRecentWorkouts();
            updateDailyProgress();
            
        } catch (error) {
            console.error('❌ Error resetting progress:', error);
        }
    }
}

// ========================================
// WORKOUT LOGGER SYSTEM
// ========================================

function initializeWorkoutLogger() {
    try {
        const today = new Date();
        currentWorkout.date = today.toISOString().split('T')[0];
    } catch (error) {
        console.error('❌ Error initializing workout logger:', error);
    }
}

function updateWorkoutForDay() {
    try {
        const today = new Date();
        const currentWeekMonday = new Date(today);
        const daysSinceMonday = (today.getDay() + 6) % 7;
        currentWeekMonday.setDate(today.getDate() - daysSinceMonday);
        
        const selectedDate = new Date(currentWeekMonday);
        selectedDate.setDate(currentWeekMonday.getDate() + (weekOffset * 7) + currentDayIndex);
        
        currentWorkout.date = selectedDate.toISOString().split('T')[0];
        loadTodaysWorkout();
        
    } catch (error) {
        console.error('❌ Error updating workout for day:', error);
    }
}

function loadTodaysWorkout() {
    try {
        const saved = localStorage.getItem('fittracker-workouts');
        const workouts = saved ? JSON.parse(saved) : {};
        
        if (workouts[currentWorkout.date]) {
            currentWorkout = workouts[currentWorkout.date];
        } else {
            currentWorkout.exercises = [];
            currentWorkout.startTime = null;
            currentWorkout.endTime = null;
            currentWorkout.notes = '';
        }
        
        updateWorkoutDisplay();
        
    } catch (error) {
        console.error('❌ Error loading today\'s workout:', error);
    }
}

function updateWorkoutDisplay() {
    try {
        const exercisesContainer = document.getElementById('workout-exercises');
        const noExercisesDiv = document.getElementById('no-exercises');
        const finishBtn = document.getElementById('finish-workout-btn');
        
        if (!exercisesContainer) return;
        
        if (currentWorkout.exercises.length === 0) {
            if (noExercisesDiv) {
                noExercisesDiv.style.display = 'block';
            }
            if (finishBtn) {
                finishBtn.style.display = 'none';
            }
        } else {
            if (noExercisesDiv) {
                noExercisesDiv.style.display = 'none';
            }
            if (finishBtn) {
                finishBtn.style.display = 'block';
            }
            
            renderExercises();
        }
        
        updateDailyProgress();
        
    } catch (error) {
        console.error('❌ Error updating workout display:', error);
    }
}

function renderExercises() {
    try {
        const exercisesContainer = document.getElementById('workout-exercises');
        if (!exercisesContainer) return;
        
        const existingExercises = exercisesContainer.querySelectorAll('.exercise-item');
        existingExercises.forEach(item => item.remove());
        
        currentWorkout.exercises.forEach((exercise, index) => {
            const exerciseElement = createExerciseElement(exercise, index);
            exercisesContainer.appendChild(exerciseElement);
        });
        
    } catch (error) {
        console.error('❌ Error rendering exercises:', error);
    }
}

function createExerciseElement(exercise, index) {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    div.dataset.index = index;
    
    const setsHtml = exercise.sets.map((set, setIndex) => {
        const volume = set.weight * set.reps;
        return `
            <div class="set-item">
                <span class="set-info">Set ${setIndex + 1}: ${set.weight}kg × ${set.reps} reps</span>
                <span class="set-volume">${volume}kg volume</span>
            </div>
        `;
    }).join('');
    
    const notesHtml = exercise.notes ? `
        <div class="exercise-notes">
            <strong>Notes:</strong> ${exercise.notes}
        </div>
    ` : '';
    
    div.innerHTML = `
        <div class="exercise-header">
            <span class="exercise-title">${exercise.name}</span>
            <span class="exercise-category">${exercise.category}</span>
        </div>
        <div class="exercise-details">
            Equipment: ${exercise.equipment} • ${exercise.sets.length} sets
        </div>
        <div class="sets-list">
            ${setsHtml}
        </div>
        ${notesHtml}
    `;
    
    return div;
}

function loadRecentWorkouts() {
    try {
        const saved = localStorage.getItem('fittracker-workouts');
        const workouts = saved ? JSON.parse(saved) : {};
        
        const recentWorkoutsList = document.getElementById('recent-workout-list');
        if (!recentWorkoutsList) return;
        
        const sortedDates = Object.keys(workouts)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 5);
        
        if (sortedDates.length === 0) {
            recentWorkoutsList.innerHTML = `
                <div class="recent-workout-item">
                    <span class="workout-date">No recent workouts</span>
                    <span class="workout-summary">Start logging to see your history!</span>
                </div>
            `;
            return;
        }
        
        const recentHtml = sortedDates.map(date => {
            const workout = workouts[date];
            const exerciseCount = workout.exercises.length;
            const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            const duration = workout.duration || 0;
            
            const displayDate = new Date(date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            return `
                <div class="recent-workout-item">
                    <span class="workout-date">${displayDate}</span>
                    <span class="workout-summary">${exerciseCount} exercises, ${totalSets} sets, ${duration}min</span>
                </div>
            `;
        }).join('');
        
        recentWorkoutsList.innerHTML = recentHtml;
        
    } catch (error) {
        console.error('❌ Error loading recent workouts:', error);
    }
}

// ========================================
// EXERCISE MODAL FUNCTIONS
// ========================================

function openExerciseModal() {
    try {
        const modal = document.getElementById('exercise-modal');
        if (modal) {
            modal.classList.add('active');
            resetExerciseModal();
            populateExerciseCategories();
        }
    } catch (error) {
        console.error('❌ Error opening exercise modal:', error);
    }
}

function closeExerciseModal() {
    try {
        const modal = document.getElementById('exercise-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    } catch (error) {
        console.error('❌ Error closing exercise modal:', error);
    }
}

function resetExerciseModal() {
    try {
        document.getElementById('exercise-category').value = '';
        document.getElementById('exercise-name').value = '';
        document.getElementById('exercise-equipment').value = 'bodyweight';
        document.getElementById('exercise-notes').value = '';
        
        const setsContainer = document.getElementById('sets-container');
        if (setsContainer) {
            setsContainer.innerHTML = `
                <div class="set-entry">
                    <span class="set-number">Set 1:</span>
                    <input type="number" class="set-weight" placeholder="Weight" step="0.5">
                    <span class="unit">kg</span>
                    <input type="number" class="set-reps" placeholder="Reps">
                    <span class="unit">reps</span>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('❌ Error resetting exercise modal:', error);
    }
}

function populateExerciseCategories() {
    try {
        const categorySelect = document.getElementById('exercise-category');
        if (!categorySelect) return;
        
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }
        
        Object.keys(exerciseDatabase.categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('❌ Error populating exercise categories:', error);
    }
}

function updateExerciseOptions() {
    try {
        const categorySelect = document.getElementById('exercise-category');
        const exerciseSelect = document.getElementById('exercise-name');
        
        if (!categorySelect || !exerciseSelect) return;
        
        const selectedCategory = categorySelect.value;
        
        while (exerciseSelect.children.length > 1) {
            exerciseSelect.removeChild(exerciseSelect.lastChild);
        }
        
        if (selectedCategory && exerciseDatabase.categories[selectedCategory]) {
            exerciseDatabase.categories[selectedCategory].forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise;
                option.textContent = exercise;
                exerciseSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('❌ Error updating exercise options:', error);
    }
}

function addSetEntry() {
    try {
        const setsContainer = document.getElementById('sets-container');
        if (!setsContainer) return;
        
        const setCount = setsContainer.children.length + 1;
        const setDiv = document.createElement('div');
        setDiv.className = 'set-entry';
        setDiv.innerHTML = `
            <span class="set-number">Set ${setCount}:</span>
            <input type="number" class="set-weight" placeholder="Weight" step="0.5">
            <span class="unit">kg</span>
            <input type="number" class="set-reps" placeholder="Reps">
            <span class="unit">reps</span>
        `;
        
        setsContainer.appendChild(setDiv);
        
    } catch (error) {
        console.error('❌ Error adding set entry:', error);
    }
}

function saveExercise() {
    try {
        const category = document.getElementById('exercise-category').value;
        const name = document.getElementById('exercise-name').value;
        const equipment = document.getElementById('exercise-equipment').value;
        const notes = document.getElementById('exercise-notes').value;
        
        if (!category || !name) {
            alert('Please select a category and exercise');
            return;
        }
        
        const setEntries = document.querySelectorAll('.set-entry');
        const sets = [];
        
        setEntries.forEach(entry => {
            const weight = parseFloat(entry.querySelector('.set-weight').value) || 0;
            const reps = parseInt(entry.querySelector('.set-reps').value) || 0;
            
            if (reps > 0) {
                sets.push({ weight, reps });
            }
        });
        
        if (sets.length === 0) {
            alert('Please add at least one set with reps');
            return;
        }
        
        const exercise = {
            name,
            category,
            equipment,
            sets,
            notes,
            timestamp: new Date().toISOString()
        };
        
        currentWorkout.exercises.push(exercise);
        
        if (currentWorkout.exercises.length === 1 && !currentWorkout.startTime) {
            currentWorkout.startTime = new Date().toISOString();
        }
        
        saveCurrentWorkout();
        updateWorkoutDisplay();
        closeExerciseModal();
        
    } catch (error) {
        console.error('❌ Error saving exercise:', error);
    }
}

function saveCurrentWorkout() {
    try {
        const saved = localStorage.getItem('fittracker-workouts');
        const workouts = saved ? JSON.parse(saved) : {};
        
        workouts[currentWorkout.date] = currentWorkout;
        localStorage.setItem('fittracker-workouts', JSON.stringify(workouts));
        
    } catch (error) {
        console.error('❌ Error saving workout:', error);
    }
}

function finishWorkout() {
    try {
        if (currentWorkout.exercises.length === 0) {
            alert('No exercises to finish!');
            return;
        }
        
        currentWorkout.endTime = new Date().toISOString();
        
        if (currentWorkout.startTime) {
            const start = new Date(currentWorkout.startTime);
            const end = new Date(currentWorkout.endTime);
            const durationMs = end - start;
            currentWorkout.duration = Math.round(durationMs / (1000 * 60));
        }
        
        saveCurrentWorkout();
        
        const exerciseCount = currentWorkout.exercises.length;
        const totalSets = currentWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const duration = currentWorkout.duration || 0;
        
        alert(`Workout completed!\n\n${exerciseCount} exercises\n${totalSets} sets\n${duration} minutes`);
        
        loadRecentWorkouts();
        
    } catch (error) {
        console.error('❌ Error finishing workout:', error);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function bindEventListeners() {
    try {
        const prevBtn = document.getElementById('prev-day-btn');
        const nextBtn = document.getElementById('next-day-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', goToPreviousDay);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', goToNextDay);
        }
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                const label = this.querySelector('.nav-label');
                if (label) {
                    const tabName = label.textContent.toLowerCase();
                    switchTab(tabName);
                }
            });
        });
        
        const resetBtn = document.getElementById('reset-progress-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllProgress);
        }
        
        const addExerciseBtn = document.getElementById('add-exercise-btn');
        const addFirstExerciseBtn = document.getElementById('add-first-exercise');
        
        if (addExerciseBtn) {
            addExerciseBtn.addEventListener('click', openExerciseModal);
        }
        
        if (addFirstExerciseBtn) {
            addFirstExerciseBtn.addEventListener('click', openExerciseModal);
        }
        
        const closeModalBtn = document.getElementById('close-exercise-modal');
        const cancelBtn = document.getElementById('cancel-exercise');
        const saveBtn = document.getElementById('save-exercise');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeExerciseModal);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeExerciseModal);
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', saveExercise);
        }
        
        const categorySelect = document.getElementById('exercise-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', updateExerciseOptions);
        }
        
        const addSetBtn = document.getElementById('add-set-btn');
        if (addSetBtn) {
            addSetBtn.addEventListener('click', addSetEntry);
        }
        
        const finishWorkoutBtn = document.getElementById('finish-workout-btn');
        if (finishWorkoutBtn) {
            finishWorkoutBtn.addEventListener('click', finishWorkout);
        }
        
    } catch (error) {
        console.error('❌ Error binding event listeners:', error);
    }
}

// ========================================
// APP INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing FitTracker Pro...');
    
    try {
        getCurrentDay();
        updateDayDisplay();
        initializeWorkoutLogger();
        loadTodaysWorkout();
        loadRecentWorkouts();
        loadProgress();
        updateProgressStats();
        updateWeeklyOverview();
        bindEventListeners();
        
        console.log('🎉 FitTracker Pro initialization complete!');
        
    } catch (error) {
        console.error('❌ Error during app initialization:', error);
    }
});

// Make functions globally available for debugging
window.goToPreviousDay = goToPreviousDay;
window.goToNextDay = goToNextDay;
window.switchTab = switchTab;
window.toggleExercise = toggleExercise;
window.resetAllProgress = resetAllProgress;