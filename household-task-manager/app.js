// App logic for the Household Task Manager
// Using direct DOM manipulation and simple State Management

// Global Error Handler for mobile debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global JS Error:", message, "at", source, ":", lineno, ":", colno, error);
  if (typeof showToast === 'function') {
    showToast(`שגיאת מערכת: ${message} (שורה ${lineno})`, 'warning');
  } else {
    alert(`שגיאת מערכת: ${message}\nשורה: ${lineno}`);
  }
  return false;
};

// Elements
const elActiveAvatar = document.getElementById('active-avatar');
const elActiveName = document.getElementById('active-name');
const elActiveRole = document.getElementById('active-role');
const elActiveBalance = document.getElementById('active-balance');
const elSwitchUserBtn = document.getElementById('active-profile-card');
const elEnableNotificationsBtn = document.getElementById('enable-notifications-btn');

const elUserPickerOverlay = document.getElementById('user-picker-overlay');
const elUsersGrid = document.getElementById('users-grid');

const elNavTabs = document.querySelectorAll('.nav-tab');
const elTabPanels = document.querySelectorAll('.tab-content');

// Stats Elements
const elStatPendingTasks = document.getElementById('stat-pending-tasks');
const elStatCompletedTasks = document.getElementById('stat-completed-tasks');
const elStatActiveBalance = document.getElementById('stat-active-balance');
const elHistoryList = document.getElementById('history-list');
const elRankingList = document.getElementById('ranking-list');

// Task Board Elements
const elTasksGrid = document.getElementById('tasks-grid');
const elFilterButtons = document.querySelectorAll('.filter-btn');
const elTaskAssigneeFilter = document.getElementById('task-assignee-filter');

// Calendar Elements
const elCalendarTitle = document.getElementById('calendar-title');
const elCalendarPrevBtn = document.getElementById('calendar-prev-btn');
const elCalendarNextBtn = document.getElementById('calendar-next-btn');
const elCalendarDaysGrid = document.getElementById('calendar-days-grid');
const elDayModalOverlay = document.getElementById('day-modal-overlay');
const elDayModalTitle = document.getElementById('day-modal-title');
const elDayModalTaskList = document.getElementById('day-modal-task-list');
const elDayModalCloseBtn = document.getElementById('day-modal-close-btn');

// Admin Elements
const elAdminAssignee = document.getElementById('admin-assignee');
const elAdminForm = document.getElementById('admin-form');
const elAdminUsersList = document.getElementById('admin-users-list');
const elAdminProfilesList = document.getElementById('admin-profiles-list');
const elAdminAddProfileForm = document.getElementById('admin-add-profile-form');
const elEditProfileOverlay = document.getElementById('edit-profile-overlay');
const elEditProfileCloseBtn = document.getElementById('edit-profile-close-btn');
const elAdminEditProfileForm = document.getElementById('admin-edit-profile-form');
const elFamilySettingsOverlay = document.getElementById('family-settings-overlay');
const elFamilySettingsCloseBtn = document.getElementById('family-settings-close-btn');

// Edit Task Elements
const elEditTaskOverlay = document.getElementById('edit-task-overlay');
const elEditTaskCloseBtn = document.getElementById('edit-task-close-btn');
const elAdminEditTaskForm = document.getElementById('admin-edit-task-form');
const elAdminEditTaskDeleteBtn = document.getElementById('admin-edit-task-delete-btn');

// Toast Container
const elToastContainer = document.getElementById('toast-container');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdBfzY1kZkJniEc4nz4Z0FaIOVoAGUBeE",
  authDomain: "choreboard-818be.firebaseapp.com",
  projectId: "choreboard-818be",
  storageBucket: "choreboard-818be.firebasestorage.app",
  messagingSenderId: "480176247969",
  appId: "1:480176247969:web:e9168b02b9bd1c0f4a8ce0",
  measurementId: "G-NRXVF16WYH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Helper to show Firebase errors clearly on the UI
function showFirebaseErrorAlert(source, error) {
  let alertEl = document.getElementById('firebase-error-banner');
  if (!alertEl) {
    alertEl = document.createElement('div');
    alertEl.id = 'firebase-error-banner';
    alertEl.style.position = 'fixed';
    alertEl.style.top = '12px';
    alertEl.style.left = '12px';
    alertEl.style.right = '12px';
    alertEl.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
    alertEl.style.color = '#fff';
    alertEl.style.padding = '16px';
    alertEl.style.borderRadius = '8px';
    alertEl.style.zIndex = '99999';
    alertEl.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
    alertEl.style.direction = 'rtl';
    alertEl.style.textAlign = 'right';
    alertEl.style.fontFamily = 'system-ui, sans-serif';
    alertEl.style.fontSize = '0.95rem';
    alertEl.style.lineHeight = '1.5';
    document.body.appendChild(alertEl);
  }
  
  let errorMsg = error.message || error;
  let suggestion = '';
  if (errorCodeContains(errorMsg, 'permission-denied') || errorCodeContains(errorMsg, 'permissions')) {
    suggestion = '<br><strong>פתרון אפשרי:</strong> נראה שחוקי האבטחה (Rules) ב-Firebase Firestore אינם מאפשרים קריאה/כתיבה. יש לוודא שהגדרת את חוקי האבטחה של Firestore ל-<strong>Test Mode</strong> (כלומר, allow read, write: if true; או rule set for true).';
  } else if (errorCodeContains(errorMsg, 'not-found') || errorCodeContains(errorMsg, 'not enabled') || errorCodeContains(errorMsg, 'failed-precondition') || errorCodeContains(errorMsg, 'disabled')) {
    suggestion = '<br><strong>פתרון אפשרי:</strong> יש לוודא שהפעלת את <strong>Cloud Firestore</strong> בתוך פרויקט ה-Firebase שלך (נכנסים ל-Firebase Console -> Build -> Firestore Database -> לוחצים על Create Database).';
  } else {
    suggestion = '<br><strong>פתרון אפשרי:</strong> ודא/י שהמכשיר מחובר לאינטרנט ושההגדרות של ה-config תואמות בדיוק לפרויקט ב-Firebase Console.';
  }
  
  alertEl.innerHTML = `
    <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 6px; display: flex; justify-content: space-between;">
      <span>⚠️ שגיאת התחברות ל-Firebase Firestore (${source})</span>
      <button onclick="document.getElementById('firebase-error-banner').remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; font-weight: bold;">&times;</button>
    </div>
    <div style="margin-top: 8px;"><strong>פירוט השגיאה מהשרת:</strong> ${errorMsg}</div>
    ${suggestion}
  `;
}

function errorCodeContains(msg, term) {
  if (!msg) return false;
  return msg.toLowerCase().indexOf(term.toLowerCase()) !== -1;
}

// Function to seed initial data in Firestore if empty for the current group
async function seedDatabaseIfEmpty(groupId) {
  if (!groupId) return;
  try {
    const usersSnap = await db.collection('users').where('groupId', '==', groupId).get();
    if (usersSnap.empty) {
      console.log(`Firestore database is empty for group ${groupId}. Seeding default data...`);
      
      // Seed Users
      const userPromises = window.householdMockData.users.map(u => {
        const uCopy = {
          ...u,
          id: `${groupId}-${u.id}`,
          groupId: groupId
        };
        return db.collection('users').doc(uCopy.id).set(uCopy);
      });
      
      // Seed Tasks
      const taskPromises = window.householdMockData.tasks.map((t, idx) => {
        const taskData = {
          ...t,
          id: `${groupId}-${t.id}`,
          groupId: groupId,
          status: t.status === 'pending' ? 'new' : t.status,
          time: t.time || (idx === 1 ? '19:00' : idx === 3 ? '16:30' : '10:00'),
          order: idx
        };
        if (t.assignee && t.assignee !== 'all') {
          taskData.assignee = `${groupId}-${t.assignee}`;
        }
        // Set tomorrow for car wash
        if (idx === 1) {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          taskData.dueDate = formatDateString(tomorrow);
        }
        return db.collection('tasks').doc(taskData.id).set(taskData);
      });
      
      // Seed History
      const historyPromises = window.householdMockData.history.map(h => {
        const hCopy = {
          ...h,
          id: `${groupId}-${h.id}`,
          groupId: groupId
        };
        if (hCopy.completedBy) {
          hCopy.completedBy = `${groupId}-${hCopy.completedBy}`;
        }
        if (hCopy.taskId) {
          hCopy.taskId = `${groupId}-${hCopy.taskId}`;
        }
        return db.collection('history').doc(hCopy.id).set(hCopy);
      });
      
      await Promise.all([...userPromises, ...taskPromises, ...historyPromises]);
      console.log(`Firestore database seeded successfully for group ${groupId}!`);
    }
  } catch (error) {
    console.error("Firebase seeding error:", error);
    throw error;
  }
}

// State Object
let state = {
  groupId: null,
  groupName: 'המשפחה שלי',
  users: [],
  tasks: [],
  history: [],
  currentUser: null
};

// Global variables for Calendar navigation
let currentCalendarDate = new Date();
const HebrewMonths = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];
const HebrewWeekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Track already notified task IDs for the current minute
let triggeredReminderTimes = {};

// Function to load local storage state or seed from mockData
function loadLocalState() {
  const groupSuffix = state.groupId ? `_${state.groupId}` : '';
  const groupName = localStorage.getItem(`household_group_name${groupSuffix}`);
  state.groupName = groupName || 'המשפחה שלי';

  const users = localStorage.getItem(`household_users${groupSuffix}`);
  const tasks = localStorage.getItem(`household_tasks${groupSuffix}`);
  const history = localStorage.getItem(`household_history${groupSuffix}`);
  
  if (users) {
    state.users = JSON.parse(users);
  } else {
    state.users = JSON.parse(JSON.stringify(window.householdMockData.users));
    if (state.groupId) {
      state.users.forEach(u => {
        u.groupId = state.groupId;
        if (!u.id.startsWith(state.groupId + '-')) {
          u.id = `${state.groupId}-${u.id}`;
        }
      });
    }
    localStorage.setItem(`household_users${groupSuffix}`, JSON.stringify(state.users));
  }
  
  if (tasks) {
    state.tasks = JSON.parse(tasks);
  } else {
    state.tasks = JSON.parse(JSON.stringify(window.householdMockData.tasks));
    if (state.groupId) {
      state.tasks.forEach(t => {
        t.groupId = state.groupId;
        if (!t.id.startsWith(state.groupId + '-')) {
          t.id = `${state.groupId}-${t.id}`;
        }
        if (t.assignee && t.assignee !== 'all' && !t.assignee.startsWith(state.groupId + '-')) {
          t.assignee = `${state.groupId}-${t.assignee}`;
        }
      });
    }
    localStorage.setItem(`household_tasks${groupSuffix}`, JSON.stringify(state.tasks));
  }
  
  if (history) {
    state.history = JSON.parse(history);
  } else {
    state.history = JSON.parse(JSON.stringify(window.householdMockData.history));
    if (state.groupId) {
      state.history.forEach(h => {
        h.groupId = state.groupId;
        if (!h.id.startsWith(state.groupId + '-')) {
          h.id = `${state.groupId}-${h.id}`;
        }
        if (h.completedBy && !h.completedBy.startsWith(state.groupId + '-')) {
          h.completedBy = `${state.groupId}-${h.completedBy}`;
        }
        if (h.taskId && !h.taskId.startsWith(state.groupId + '-')) {
          h.taskId = `${state.groupId}-${h.taskId}`;
        }
      });
    }
    localStorage.setItem(`household_history${groupSuffix}`, JSON.stringify(state.history));
  }
}

// Function to save local fallback state
function saveLocalFallbackState() {
  if (firebaseLoaded) return;
  const groupSuffix = state.groupId ? `_${state.groupId}` : '';
  localStorage.setItem(`household_group_name${groupSuffix}`, state.groupName || 'המשפחה שלי');
  localStorage.setItem(`household_users${groupSuffix}`, JSON.stringify(state.users));
  localStorage.setItem(`household_tasks${groupSuffix}`, JSON.stringify(state.tasks));
  localStorage.setItem(`household_history${groupSuffix}`, JSON.stringify(state.history));
}

let isInitialLoad = true;
let firebaseLoaded = false;
let firebaseFallbackTimer = null;

function setupFirebaseListeners() {
  if (!state.groupId) return;

  // Listen to group metadata changes (nickname)
  db.collection('groups').doc(state.groupId).onSnapshot(doc => {
    if (doc.exists) {
      state.groupName = doc.data().name;
      updateGroupNameUI();
    }
  }, error => {
    console.error("Firebase Group Listener Error:", error);
  });

  db.collection('users').where('groupId', '==', state.groupId).onSnapshot(snapshot => {
    const usersList = [];
    snapshot.forEach(doc => {
      usersList.push(doc.data());
    });
    state.users = usersList;
    
    if (state.currentUser) {
      const freshUser = state.users.find(u => u.id === state.currentUser.id);
      if (freshUser) {
        state.currentUser = freshUser;
      }
    }
    onStateUpdated();
  }, error => {
    console.error("Firebase Users Listener Error:", error);
    showFirebaseErrorAlert("קבלת משתמשים", error);
  });

  db.collection('tasks').where('groupId', '==', state.groupId).onSnapshot(snapshot => {
    const tasksList = [];
    snapshot.forEach(doc => {
      tasksList.push(doc.data());
    });
    // Sort tasks by order
    tasksList.sort((a, b) => (a.order || 0) - (b.order || 0));
    state.tasks = tasksList;
    onStateUpdated();
  }, error => {
    console.error("Firebase Tasks Listener Error:", error);
    showFirebaseErrorAlert("קבלת משימות", error);
  });

  db.collection('history').where('groupId', '==', state.groupId).onSnapshot(snapshot => {
    const historyList = [];
    snapshot.forEach(doc => {
      historyList.push(doc.data());
    });
    // Sort descending by timestamp or id
    historyList.sort((a, b) => new Date(b.timestamp || b.id.replace('hist-', '') * 1) - new Date(a.timestamp || a.id.replace('hist-', '') * 1));
    state.history = historyList;
    onStateUpdated();
  }, error => {
    console.error("Firebase History Listener Error:", error);
    showFirebaseErrorAlert("קבלת היסטוריה", error);
  });
}

function updateGroupNameUI() {
  const elSubtitle = document.querySelector('.logo-section p');
  if (elSubtitle && state.groupName) {
    elSubtitle.textContent = `מערכת המשימות והתגמולים של ${state.groupName}`;
  }
  const elNicknameInput = document.getElementById('admin-family-nickname-input');
  if (elNicknameInput && state.groupName && document.activeElement !== elNicknameInput) {
    elNicknameInput.value = state.groupName;
  }
}

function onStateUpdated() {
  if (state.users.length === 0) return;

  const elFamilyCodeText = document.getElementById('family-code-text');
  if (elFamilyCodeText && state.groupId) {
    elFamilyCodeText.textContent = state.groupId;
  }
  updateGroupNameUI();
  
  if (isInitialLoad) {
    firebaseLoaded = true;
    if (firebaseFallbackTimer) {
      clearTimeout(firebaseFallbackTimer);
    }
    const savedCurrentUser = localStorage.getItem('household_current_user');
    if (savedCurrentUser) {
      state.currentUser = state.users.find(u => u.id === savedCurrentUser) || state.users[0];
    } else {
      const defaultMomId = state.groupId ? `${state.groupId}-user-mom` : 'user-mom';
      state.currentUser = state.users.find(u => u.id === defaultMomId) || state.users[0];
    }
    
    let activeTab = localStorage.getItem('household_active_tab') || 'tasks';
    if (state.currentUser.role !== 'admin' && activeTab === 'admin') {
      activeTab = 'tasks';
      localStorage.setItem('household_active_tab', 'tasks');
    }

    document.querySelectorAll('.nav-tab').forEach(t => {
      if (t.getAttribute('data-tab') === activeTab) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    document.querySelectorAll('.tab-content').forEach(panel => {
      if (panel.id === `${activeTab}-tab-content`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });



    populateAdminAssigneeSelect();
    populateTaskAssigneeFilter();

    const defaultFilter = state.currentUser.role === 'admin' ? 'all' : 'my';
    setTaskFilter(defaultFilter);

    setInterval(checkTaskReminders, 10000);

    initAvatarPicker('admin-new');
    initAvatarPicker('admin-edit');
    selectAvatarOption('admin-new', '👧');

    populateHourMinuteSelects('admin-recurring');
    populateHourMinuteSelects('admin-reminder');
    populateHourMinuteSelects('admin-edit-task-recurring');
    populateHourMinuteSelects('admin-edit-task-reminder');

    if (document.getElementById('admin-recurring-hour')) {
      document.getElementById('admin-recurring-hour').value = '09';
    }
    if (document.getElementById('admin-recurring-minute')) {
      document.getElementById('admin-recurring-minute').value = '00';
    }
    if (document.getElementById('admin-reminder-hour')) {
      document.getElementById('admin-reminder-hour').value = '12';
    }
    if (document.getElementById('admin-reminder-minute')) {
      document.getElementById('admin-reminder-minute').value = '00';
    }

    initStarRatingSelectors();

    const pendingToast = localStorage.getItem('household_pending_toast');
    if (pendingToast) {
      try {
        const { message, type } = JSON.parse(pendingToast);
        showToast(message, type);
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('household_pending_toast');
    }

    // New Group Onboarding Banner Logic
    const isOnboarding = localStorage.getItem('household_new_group_onboarding') === 'true';
    if (isOnboarding && state.currentUser.role === 'admin') {
      if (elFamilySettingsOverlay) {
        elFamilySettingsOverlay.classList.add('active');
        renderProfilesList();
      }
      const elBanner = document.getElementById('admin-onboarding-banner');
      const elCloseBannerBtn = document.getElementById('close-onboarding-banner-btn');
      if (elBanner && elCloseBannerBtn) {
        elBanner.style.display = 'block';
        elCloseBannerBtn.addEventListener('click', () => {
          elBanner.style.display = 'none';
          localStorage.removeItem('household_new_group_onboarding');
        });
      }
    }

    isInitialLoad = false;
  }

  updateProfileUI();
  renderDashboard();
  renderTasks();
  renderAdminPanel();
}

// Fallback function to load local data if Firebase configuration is missing or broken
function loadFallbackLocalData() {
  console.warn("Falling back to local mock data...");
  loadLocalState();
  
  // Bind events if they haven't been bound yet
  bindEvents();
  
  // Set initial load state
  isInitialLoad = true;
  onStateUpdated();
  
  showToast("המערכת פועלת במצב מקומי (Offline Fallback) עקב שגיאת התחברות ל-Firebase", "warning");
}

async function initApp() {
  // Debug / Reset Query Param helpers
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('reset') || urlParams.has('first')) {
    const currentGroupId = localStorage.getItem('household_group_id');
    localStorage.removeItem('household_visited');
    localStorage.removeItem('household_current_user');
    localStorage.removeItem('household_color_theme');
    localStorage.removeItem('household_active_tab');
    localStorage.removeItem('household_users');
    localStorage.removeItem('household_tasks');
    localStorage.removeItem('household_history');
    if (currentGroupId) {
      localStorage.removeItem(`household_users_${currentGroupId}`);
      localStorage.removeItem(`household_tasks_${currentGroupId}`);
      localStorage.removeItem(`household_history_${currentGroupId}`);
    }
    localStorage.removeItem('household_group_id');
    
    if (currentGroupId) {
      try {
        const usersSnap = await db.collection('users').where('groupId', '==', currentGroupId).get();
        const userDeletes = [];
        usersSnap.forEach(doc => userDeletes.push(doc.ref.delete()));
        
        const tasksSnap = await db.collection('tasks').where('groupId', '==', currentGroupId).get();
        const taskDeletes = [];
        tasksSnap.forEach(doc => taskDeletes.push(doc.ref.delete()));
        
        const historySnap = await db.collection('history').where('groupId', '==', currentGroupId).get();
        const historyDeletes = [];
        historySnap.forEach(doc => historyDeletes.push(doc.ref.delete()));
        
        await Promise.all([...userDeletes, ...taskDeletes, ...historyDeletes]);
      } catch (e) {
        console.error("Failed to clear Firestore database during reset:", e);
        showFirebaseErrorAlert("איפוס מסד נתונים", e);
      }
    }
    
    // Clean URL query parameters and reload to start fresh
    window.location.href = window.location.pathname;
    return;
  }

  // Legacy Migration Check
  const legacyUsers = localStorage.getItem('household_users');
  if (legacyUsers && !urlParams.has('join') && !urlParams.has('reset')) {
    let targetGroupId = localStorage.getItem('household_group_id');
    if (!targetGroupId) {
      targetGroupId = `family-${Math.floor(10000 + Math.random() * 90000)}`;
      localStorage.setItem('household_group_id', targetGroupId);
    }
    state.groupId = targetGroupId;
    
    try {
      // 1. Delete any automatically seeded data in this group to avoid mixing
      const usersSnap = await db.collection('users').where('groupId', '==', targetGroupId).get();
      const userDeletes = [];
      usersSnap.forEach(doc => userDeletes.push(doc.ref.delete()));
      
      const tasksSnap = await db.collection('tasks').where('groupId', '==', targetGroupId).get();
      const taskDeletes = [];
      tasksSnap.forEach(doc => taskDeletes.push(doc.ref.delete()));
      
      const historySnap = await db.collection('history').where('groupId', '==', targetGroupId).get();
      const historyDeletes = [];
      historySnap.forEach(doc => historyDeletes.push(doc.ref.delete()));
      
      await Promise.all([...userDeletes, ...taskDeletes, ...historyDeletes]);
      
      // 2. Migrate Users
      const parsedUsers = JSON.parse(legacyUsers);
      const userPromises = parsedUsers.map(u => {
        const uCopy = {
          ...u,
          id: `${targetGroupId}-${u.id}`,
          groupId: targetGroupId
        };
        // Update current user mapping if it matches
        const savedCurrentUser = localStorage.getItem('household_current_user');
        if (savedCurrentUser === u.id || savedCurrentUser === `${targetGroupId}-${u.id}`) {
          localStorage.setItem('household_current_user', uCopy.id);
        }
        return db.collection('users').doc(uCopy.id).set(uCopy);
      });
      
      // 3. Migrate Tasks
      const legacyTasks = localStorage.getItem('household_tasks');
      const parsedTasks = legacyTasks ? JSON.parse(legacyTasks) : [];
      const taskPromises = parsedTasks.map(t => {
        const tCopy = {
          ...t,
          id: `${targetGroupId}-${t.id}`,
          groupId: targetGroupId
        };
        if (tCopy.assignedTo && tCopy.assignedTo !== 'all') {
          tCopy.assignedTo = `${targetGroupId}-${tCopy.assignedTo}`;
        }
        if (tCopy.completedBy) {
          tCopy.completedBy = `${targetGroupId}-${tCopy.completedBy}`;
        }
        return db.collection('tasks').doc(tCopy.id).set(tCopy);
      });
      
      // 4. Migrate History
      const legacyHistory = localStorage.getItem('household_history');
      const parsedHistory = legacyHistory ? JSON.parse(legacyHistory) : [];
      const historyPromises = parsedHistory.map(h => {
        const hCopy = {
          ...h,
          id: `${targetGroupId}-${h.id}`,
          groupId: targetGroupId
        };
        if (hCopy.completedBy) {
          hCopy.completedBy = `${targetGroupId}-${hCopy.completedBy}`;
        }
        if (hCopy.taskId) {
          hCopy.taskId = `${targetGroupId}-${hCopy.taskId}`;
        }
        return db.collection('history').doc(hCopy.id).set(hCopy);
      });
      
      await Promise.all([...userPromises, ...taskPromises, ...historyPromises]);
      
      // Save to group-prefixed localStorage keys
      localStorage.setItem(`household_users_${targetGroupId}`, JSON.stringify(parsedUsers.map(u => ({ ...u, id: `${targetGroupId}-${u.id}`, groupId: targetGroupId }))));
      localStorage.setItem(`household_tasks_${targetGroupId}`, JSON.stringify(parsedTasks.map(t => ({ ...t, id: `${targetGroupId}-${t.id}`, groupId: targetGroupId, assignedTo: t.assignedTo && t.assignedTo !== 'all' ? `${targetGroupId}-${t.assignedTo}` : t.assignedTo, completedBy: t.completedBy ? `${targetGroupId}-${t.completedBy}` : t.completedBy }))));
      localStorage.setItem(`household_history_${targetGroupId}`, JSON.stringify(parsedHistory.map(h => ({ ...h, id: `${targetGroupId}-${h.id}`, groupId: targetGroupId, completedBy: h.completedBy ? `${targetGroupId}-${h.completedBy}` : h.completedBy, taskId: h.taskId ? `${targetGroupId}-${h.taskId}` : h.taskId }))));
      
      // Clear legacy localStorage keys to complete migration
      localStorage.removeItem('household_users');
      localStorage.removeItem('household_tasks');
      localStorage.removeItem('household_history');
      
      localStorage.setItem('household_visited', 'true');
      
      // If the current user doesn't exist in the migrated users, set to the first migrated user
      const savedCurrentUser = localStorage.getItem('household_current_user');
      const userExists = parsedUsers.some(u => `${targetGroupId}-${u.id}` === savedCurrentUser || u.id === savedCurrentUser);
      if (!userExists && parsedUsers.length > 0) {
        localStorage.setItem('household_current_user', `${targetGroupId}-${parsedUsers[0].id}`);
      }
      
      localStorage.setItem('household_pending_toast', JSON.stringify({
        message: `משפחתך הועברה בהצלחה לקבוצה: ${targetGroupId}! 🎉`,
        type: 'success'
      }));
      
      window.location.reload();
      return;
    } catch (err) {
      console.error("Legacy migration failed:", err);
    }
  }

  // Check if group ID exists
  let groupId = localStorage.getItem('household_group_id');
  
  // If groupId query parameter exists, prioritize it and save it
  const groupParam = urlParams.get('group');
  if (groupParam) {
    localStorage.setItem('household_group_id', groupParam);
    groupId = groupParam;
  }

  state.groupId = groupId;

  if (urlParams.has('join')) {
    // Show join overlay
    const joinOverlay = document.getElementById('join-family-overlay');
    if (joinOverlay) {
      joinOverlay.classList.add('active');
      initJoinAvatarPicker();
      setupJoinFormHandlers();
    }
    return; // Stop app initialization
  }

  if (!groupId) {
    // Show group setup overlay
    const groupSetupOverlay = document.getElementById('group-setup-overlay');
    if (groupSetupOverlay) {
      groupSetupOverlay.classList.add('active');
    }
    
    // Bind group setup buttons
    const btnCreateNewGroup = document.getElementById('btn-create-new-group');
    if (btnCreateNewGroup) {
      btnCreateNewGroup.addEventListener('click', async () => {
        const inputGroupName = document.getElementById('input-group-name');
        const groupName = (inputGroupName && inputGroupName.value.trim()) ? inputGroupName.value.trim() : 'המשפחה שלי';

        // Generate a random group code, e.g., family-38492
        const randomCode = `family-${Math.floor(10000 + Math.random() * 90000)}`;
        localStorage.setItem('household_group_id', randomCode);
        state.groupId = randomCode;
        state.groupName = groupName;
        
        // Seed database immediately for this group
        try {
          // Save group metadata
          await db.collection('groups').doc(randomCode).set({
            id: randomCode,
            name: groupName,
            createdAt: new Date().toISOString()
          });
          
          await seedDatabaseIfEmpty(randomCode);
        } catch (e) {
          console.error("Failed to seed new group:", e);
        }
        
        // Save nickname locally for fallback
        localStorage.setItem(`household_group_name_${randomCode}`, groupName);

        // Set default current user to Mom (prefixed)
        localStorage.setItem('household_current_user', `${randomCode}-user-mom`);
        localStorage.setItem('household_visited', 'true');
        
        // Redirect to tasks tab by default for profile updates and open settings modal
        localStorage.setItem('household_active_tab', 'tasks');
        localStorage.setItem('household_new_group_onboarding', 'true');
        
        localStorage.setItem('household_pending_toast', JSON.stringify({
          message: `הקבוצה "${groupName}" הוקמה בהצלחה! 🎉`,
          type: 'success'
        }));
        
        // Reload to start fresh under this group
        window.location.reload();
      });
    }
    
    const btnJoinGroupCode = document.getElementById('btn-join-group-code');
    const inputGroupCode = document.getElementById('input-group-code');
    if (btnJoinGroupCode && inputGroupCode) {
      btnJoinGroupCode.addEventListener('click', () => {
        const enteredCode = inputGroupCode.value.trim();
        if (!enteredCode) {
          showToast('אנא הכנס קוד משפחה תקין', 'warning');
          return;
        }
        
        localStorage.setItem('household_group_id', enteredCode);
        localStorage.setItem('household_visited', 'true');
        
        localStorage.setItem('household_pending_toast', JSON.stringify({
          message: `הצטרפת לקבוצה ${enteredCode} בהצלחה! 🏠`,
          type: 'success'
        }));
        
        window.location.reload();
      });
    }
    
    return; // Stop app initialization until group is set
  }

  // Hide group setup overlay if it was open
  const groupSetupOverlay = document.getElementById('group-setup-overlay');
  if (groupSetupOverlay) {
    groupSetupOverlay.classList.remove('active');
  }

  // Initialize Theme Selector
  initThemeSelector();

  // Show welcome overlay on first visit
  const isFirstVisit = !localStorage.getItem('household_visited');
  if (isFirstVisit) {
    const elWelcomeOverlay = document.getElementById('welcome-overlay');
    const elWelcomeCloseBtn = document.getElementById('welcome-close-btn');
    if (elWelcomeOverlay && elWelcomeCloseBtn) {
      elWelcomeOverlay.classList.add('active');
      elWelcomeCloseBtn.addEventListener('click', () => {
        elWelcomeOverlay.classList.remove('active');
        localStorage.setItem('household_visited', 'true');
      });
    }
  }

  // Set a fallback timer for 4 seconds to detect Firebase hanging
  firebaseFallbackTimer = setTimeout(() => {
    if (!firebaseLoaded) {
      console.warn("Firebase did not load within 4 seconds. Falling back to local data.");
      showFirebaseErrorAlert("חיבור לרשת (Timeout)", new Error("פג זמן ההמתנה לשרתי Firebase. ייתכן שיש בעיית תקשורת, חוקי אבטחה חוסמים, או שהמסד לא מופעל."));
      loadFallbackLocalData();
    }
  }, 4000);

  try {
    // Seed initial mock data in Firestore if empty for this group
    await seedDatabaseIfEmpty(state.groupId);

    // Bind events (must run once)
    bindEvents();

    // Setup Firebase real-time listeners (this handles loading the data and rendering)
    setupFirebaseListeners();
  } catch (error) {
    console.error("Failed to initialize Firebase App:", error);
    showFirebaseErrorAlert("אתחול האפליקציה", error);
    
    // Fallback: If Firebase fails, load using the local mock data
    loadFallbackLocalData();
  }
}

function saveState() {
  if (state.currentUser) {
    localStorage.setItem('household_current_user', state.currentUser.id);
  }
  saveLocalFallbackState();
}

// Helpers
function getAvatarHTML(avatar) {
  if (!avatar) return '👤';
  if (avatar.startsWith('data:image/') || avatar.startsWith('http') || avatar.startsWith('blob:')) {
    return `<img src="${avatar}" class="profile-avatar-img" alt="avatar" />`;
  }
  return avatar;
}

const cuteEmojis = [
  '👧', '👦', '👩‍🦰', '👨‍🦱', '👵', '👴', '👶', '🦊',
  '🐱', '🐶', '🦁', '🐼', '🐨', '🦄', '🦖', '🐙',
  '🐧', '⚽', '🎨', '🚀', '🎮', '🍕'
];

function initAvatarPicker(prefix) {
  const gridEl = document.getElementById(`${prefix}-avatar-options-grid`);
  const hiddenInputEl = document.getElementById(`${prefix}-profile-avatar`);
  const fileInputEl = document.getElementById(`${prefix}-profile-upload`);
  
  if (!gridEl || !hiddenInputEl || !fileInputEl) return;

  gridEl.innerHTML = '';
  
  // Render default emojis
  cuteEmojis.forEach(emoji => {
    const opt = document.createElement('div');
    opt.className = 'avatar-option';
    opt.textContent = emoji;
    opt.dataset.value = emoji;
    
    opt.addEventListener('click', () => {
      fileInputEl.value = '';
      hiddenInputEl.value = emoji;
      gridEl.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('active'));
      opt.classList.add('active');
    });
    
    gridEl.appendChild(opt);
  });
  
  // Render custom photo upload button
  const uploadBtn = document.createElement('div');
  uploadBtn.className = 'avatar-option upload-btn';
  uploadBtn.innerHTML = '📷<br><span style="font-size:0.6rem; font-weight:bold;">העלאה</span>';
  uploadBtn.title = 'העלה תמונה אישית מהמחשב';
  
  uploadBtn.addEventListener('click', () => {
    fileInputEl.click();
  });
  
  fileInputEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('נא לבחור קובץ תמונה תקין', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawImgData = event.target.result;
        compressImage(rawImgData, 128, 128, (compressedBase64) => {
          hiddenInputEl.value = compressedBase64;
          gridEl.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('active'));
          uploadBtn.classList.add('active');
          uploadBtn.innerHTML = `<img src="${compressedBase64}" class="profile-avatar-img" />`;
          uploadBtn.dataset.value = compressedBase64;
        });
      };
      reader.readAsDataURL(file);
    }
  });
  
  gridEl.appendChild(uploadBtn);
}

function initJoinAvatarPicker() {
  const gridEl = document.getElementById('join-avatar-options-grid');
  const hiddenInputEl = document.getElementById('join-profile-avatar');
  if (!gridEl || !hiddenInputEl) return;
  
  gridEl.innerHTML = '';
  
  cuteEmojis.forEach(emoji => {
    const opt = document.createElement('div');
    opt.className = 'avatar-option';
    opt.textContent = emoji;
    opt.dataset.value = emoji;
    if (emoji === '👧') opt.classList.add('active');
    
    opt.addEventListener('click', () => {
      hiddenInputEl.value = emoji;
      gridEl.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('active'));
      opt.classList.add('active');
    });
    
    gridEl.appendChild(opt);
  });
}

function setupJoinFormHandlers() {
  const memberCard = document.getElementById('join-role-card-member');
  const adminCard = document.getElementById('join-role-card-admin');
  const roleInput = document.getElementById('join-profile-role');
  
  if (memberCard && adminCard && roleInput) {
    memberCard.addEventListener('click', () => {
      memberCard.classList.add('active');
      memberCard.style.background = 'rgba(139, 92, 246, 0.08)';
      memberCard.style.borderColor = 'var(--accent-purple)';
      adminCard.classList.remove('active');
      adminCard.style.background = 'none';
      adminCard.style.borderColor = 'var(--border-color)';
      roleInput.value = 'member';
    });
    
    adminCard.addEventListener('click', () => {
      adminCard.classList.add('active');
      adminCard.style.background = 'rgba(139, 92, 246, 0.08)';
      adminCard.style.borderColor = 'var(--accent-purple)';
      memberCard.classList.remove('active');
      memberCard.style.background = 'none';
      memberCard.style.borderColor = 'var(--border-color)';
      roleInput.value = 'admin';
    });
  }
  
  const joinForm = document.getElementById('join-family-form');
  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('join-profile-name').value.trim();
      const role = roleInput ? roleInput.value : 'member';
      const avatar = document.getElementById('join-profile-avatar').value;
      const color = document.getElementById('join-profile-color').value;
      
      if (!name) {
        showToast('נא להזין שם', 'warning');
        return;
      }
      
      const groupId = state.groupId || localStorage.getItem('household_group_id');
      if (!groupId) {
        showToast('שגיאה: חסר קוד משפחה בקישור ההזמנה', 'warning');
        return;
      }
      const userId = `${groupId}-user-${Date.now()}`;
      const newUser = {
        id: userId,
        groupId,
        name,
        role,
        avatar,
        color,
        balance: 0,
        stars: 0
      };
      
      try {
        await db.collection('users').doc(userId).set(newUser);
        
        const histId = `${groupId}-hist-${Date.now()}`;
        await db.collection('history').doc(histId).set({
          id: histId,
          groupId,
          title: `הצטרף/ה למשפחה! 🚀`,
          reward: 0,
          stars: 0,
          completedBy: userId,
          completedDate: formatDateString(new Date()),
          timestamp: new Date().toISOString(),
          action: 'created'
        });
        
        localStorage.setItem('household_current_user', userId);
        localStorage.setItem('household_visited', 'true');
        
        localStorage.setItem('household_pending_toast', JSON.stringify({
          message: `ברוך הבא למשפחה, ${name}! 🎉`,
          type: 'success'
        }));
        
        window.location.href = window.location.pathname;
      } catch (err) {
        console.error("Failed to save registered profile:", err);
        showToast('שגיאה ברישום הפרופיל במערכת', 'warning');
      }
    });
  }
}


function compressImage(base64Data, maxWidth, maxHeight, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    const compressedData = canvas.toDataURL('image/jpeg', 0.85);
    callback(compressedData);
  };
  img.src = base64Data;
}

function selectAvatarOption(prefix, avatarVal) {
  const gridEl = document.getElementById(`${prefix}-avatar-options-grid`);
  const hiddenInputEl = document.getElementById(`${prefix}-profile-avatar`);
  
  if (!gridEl || !hiddenInputEl) return;
  
  hiddenInputEl.value = avatarVal;
  gridEl.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('active'));
  
  const uploadBtn = gridEl.querySelector('.upload-btn');
  
  if (avatarVal.startsWith('data:image/') || avatarVal.startsWith('http') || avatarVal.startsWith('blob:')) {
    uploadBtn.classList.add('active');
    uploadBtn.innerHTML = `<img src="${avatarVal}" class="profile-avatar-img" />`;
    uploadBtn.dataset.value = avatarVal;
  } else {
    uploadBtn.innerHTML = '📷<br><span style="font-size:0.6rem; font-weight:bold;">העלאה</span>';
    delete uploadBtn.dataset.value;
    
    const matchingOpt = Array.from(gridEl.querySelectorAll('.avatar-option')).find(el => el.dataset.value === avatarVal);
    if (matchingOpt) {
      matchingOpt.classList.add('active');
    } else {
      const defaultOpt = Array.from(gridEl.querySelectorAll('.avatar-option')).find(el => el.dataset.value === '👧');
      if (defaultOpt) defaultOpt.classList.add('active');
    }
  }
}

function populateHourMinuteSelects(prefix) {
  const hourEl = document.getElementById(`${prefix}-hour`);
  const minEl = document.getElementById(`${prefix}-minute`);
  if (!hourEl || !minEl) return;

  hourEl.innerHTML = '';
  minEl.innerHTML = '';

  // Hours: 00 to 23
  for (let h = 0; h < 24; h++) {
    const val = String(h).padStart(2, '0');
    hourEl.innerHTML += `<option value="${val}">${val}</option>`;
  }

  // Minutes: 00 to 59
  for (let m = 0; m < 60; m++) {
    const val = String(m).padStart(2, '0');
    minEl.innerHTML += `<option value="${val}">${val}</option>`;
  }
}

function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isTaskCompletedToday(task) {
  const todayStr = formatDateString(new Date());
  return state.history.some(h => h.taskId === task.id && h.completedDate === todayStr && (h.action === 'completed' || h.action === undefined));
}

function setTaskFilter(filterName) {
  if (elFilterButtons) {
    elFilterButtons.forEach(btn => {
      if (btn.getAttribute('data-filter') === filterName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  if (elTaskAssigneeFilter) {
    if (filterName === 'my') {
      elTaskAssigneeFilter.value = state.currentUser.id;
    } else {
      elTaskAssigneeFilter.value = 'any';
    }
  }

  // Show family member filter dropdown only when "Everyone's Tasks" (all) is selected
  const elAssigneeFilterContainer = document.getElementById('assignee-filter-container');
  if (elAssigneeFilterContainer) {
    if (filterName === 'all') {
      elAssigneeFilterContainer.style.display = 'flex';
    } else {
      elAssigneeFilterContainer.style.display = 'none';
    }
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'success' : ''}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✨' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  elToastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// UI Rendering
function updateProfileUI() {
  if (!state.currentUser) return;
  elActiveAvatar.innerHTML = getAvatarHTML(state.currentUser.avatar);
  elActiveName.textContent = state.currentUser.name;
  elActiveRole.textContent = state.currentUser.role === 'admin' ? 'הורה (מנהל)' : 'משתתף';
  if (elActiveBalance) {
    elActiveBalance.textContent = `₪${state.currentUser.balance}`;
  }

  const elHeaderCashVal = document.getElementById('header-cash-val');
  if (elHeaderCashVal) {
    elHeaderCashVal.textContent = `₪${state.currentUser.balance}`;
  }
  const elHeaderStarsVal = document.getElementById('header-stars-val');
  if (elHeaderStarsVal) {
    elHeaderStarsVal.textContent = `⭐ ${state.currentUser.stars || 0}`;
  }

  // Highlight active user and update active balance indicator in dashboard
  elStatActiveBalance.textContent = `₪${state.currentUser.balance}`;

  // Toggle Header Admin Gear Button for parents
  const elHeaderAdminGearBtn = document.getElementById('header-admin-gear-btn');
  if (elHeaderAdminGearBtn) {
    if (state.currentUser.role === 'admin') {
      elHeaderAdminGearBtn.style.display = 'flex';
    } else {
      elHeaderAdminGearBtn.style.display = 'none';
    }
  }

  // Toggle Navigation Add Task button for all family members
  const elNavAddTaskBtn = document.getElementById('nav-add-task-btn');
  if (elNavAddTaskBtn) {
    elNavAddTaskBtn.style.display = 'flex';
  }

  // Toggle admin dashboard in-context add task button
  const elAdminAddTaskBtn = document.getElementById('admin-add-task-btn');
  if (elAdminAddTaskBtn) {
    if (state.currentUser.role === 'admin') {
      elAdminAddTaskBtn.style.display = 'flex';
    } else {
      elAdminAddTaskBtn.style.display = 'none';
    }
  }

  // Toggle share invite button for parents
  const elAdminShareInviteBtn = document.getElementById('admin-share-invite-btn');
  if (elAdminShareInviteBtn) {
    if (state.currentUser.role === 'admin') {
      elAdminShareInviteBtn.style.display = 'flex';
    } else {
      elAdminShareInviteBtn.style.display = 'none';
    }
  }
}

function switchTab(targetTab) {
  // Update Tab class
  elNavTabs.forEach(t => {
    if (t.getAttribute('data-tab') === targetTab) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  // Update Panel class
  elTabPanels.forEach(panel => {
    if (panel.id === `${targetTab}-tab-content`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  localStorage.setItem('household_active_tab', targetTab);

  // Special re-render triggers
  if (targetTab === 'calendar') {
    renderCalendar();
  } else if (targetTab === 'tasks') {
    renderTasks();
  } else if (targetTab === 'dashboard') {
    renderDashboard();
  }
}

function bindEvents() {
  // Header Admin Settings Gear click - opens the Settings Modal
  const elGearBtn = document.getElementById('header-admin-gear-btn');
  if (elGearBtn && elFamilySettingsOverlay) {
    elGearBtn.addEventListener('click', () => {
      elFamilySettingsOverlay.classList.add('active');
      renderProfilesList();
    });
  }

  const closeSettingsModal = () => {
    if (elFamilySettingsOverlay) {
      elFamilySettingsOverlay.classList.remove('active');
    }
    localStorage.removeItem('household_new_group_onboarding');
    const elBanner = document.getElementById('admin-onboarding-banner');
    if (elBanner) {
      elBanner.style.display = 'none';
    }
  };

  // Settings Modal Close
  if (elFamilySettingsCloseBtn && elFamilySettingsOverlay) {
    elFamilySettingsCloseBtn.addEventListener('click', closeSettingsModal);
    elFamilySettingsOverlay.addEventListener('click', (e) => {
      if (e.target === elFamilySettingsOverlay) {
        closeSettingsModal();
      }
    });
  }

  const elFamilySettingsFinishBtn = document.getElementById('family-settings-finish-btn');

  // Collapsible Add Profile Form Toggle
  const elToggleAddProfileBtn = document.getElementById('toggle-add-profile-btn');
  if (elToggleAddProfileBtn && elAdminAddProfileForm) {
    elToggleAddProfileBtn.addEventListener('click', () => {
      const isHidden = elAdminAddProfileForm.style.display === 'none';
      if (isHidden) {
        elAdminAddProfileForm.style.display = 'block';
        elToggleAddProfileBtn.innerHTML = '➖ ביטול הוספת בן משפחה';
        elToggleAddProfileBtn.style.borderStyle = 'solid';
        if (elFamilySettingsFinishBtn) {
          elFamilySettingsFinishBtn.style.display = 'none';
        }
        
        // Auto scroll to make form fully visible inside settings modal
        setTimeout(() => {
          elAdminAddProfileForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        elAdminAddProfileForm.style.display = 'none';
        elToggleAddProfileBtn.innerHTML = '➕ הוספת בן משפחה חדש';
        elToggleAddProfileBtn.style.borderStyle = 'dashed';
        if (elFamilySettingsFinishBtn) {
          elFamilySettingsFinishBtn.style.display = 'block';
        }
      }
    });
  }

  // Settings Modal Finish Button click
  if (elFamilySettingsFinishBtn && elFamilySettingsOverlay) {
    elFamilySettingsFinishBtn.addEventListener('click', () => {
      closeSettingsModal();
      showToast('הקבוצה עודכנה בהצלחה! 🏠', 'success');
    });
  }

  // Push Notification setup click
  if (elEnableNotificationsBtn) {
    if (typeof Notification !== 'undefined') {
      elEnableNotificationsBtn.addEventListener('click', () => {
        try {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              elEnableNotificationsBtn.style.display = 'none';
              showToast('התראות דפדפן הופעלו בהצלחה!', 'success');
            } else {
              showToast('התראות דפדפן נחסמו.', 'warning');
            }
          }).catch(err => {
            console.error('Notification.requestPermission failed:', err);
            showToast('שגיאה בהפעלת התראות', 'warning');
          });
        } catch (e) {
          console.error('Notification.requestPermission failed:', e);
          showToast('התראות אינן נתמכות בדפדפן זה', 'warning');
        }
      });
    } else {
      elEnableNotificationsBtn.style.display = 'none';
    }
  }

  // Save Family Nickname Button click
  const elSaveNicknameBtn = document.getElementById('admin-save-nickname-btn');
  const elNicknameInput = document.getElementById('admin-family-nickname-input');
  if (elSaveNicknameBtn && elNicknameInput) {
    elSaveNicknameBtn.addEventListener('click', async () => {
      const newNickname = elNicknameInput.value.trim();
      if (!newNickname) {
        showToast('נא להזין כינוי תקין למשפחה', 'warning');
        return;
      }
      
      state.groupName = newNickname;
      
      // Update locally for fallback
      const groupSuffix = state.groupId ? `_${state.groupId}` : '';
      localStorage.setItem(`household_group_name${groupSuffix}`, newNickname);
      
      // Update in Firestore
      try {
        await db.collection('groups').doc(state.groupId).set({
          id: state.groupId,
          name: newNickname,
          createdAt: new Date().toISOString()
        }, { merge: true });
        showToast('כינוי המשפחה עודכן בהצלחה! 🎉', 'success');
      } catch (err) {
        console.error("Failed to update group nickname on Firebase:", err);
        showToast('שגיאה בעדכון כינוי המשפחה במסד הנתונים', 'warning');
      }
      
      updateGroupNameUI();
    });
  }

  // WhatsApp Share Invite Link Button click
  const elAdminShareInviteBtn = document.getElementById('admin-share-invite-btn');
  if (elAdminShareInviteBtn) {
    elAdminShareInviteBtn.addEventListener('click', () => {
      const inviteLink = window.location.origin + window.location.pathname + `?join=true&group=${state.groupId}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteLink).then(() => {
          showToast('קישור ההזמנה הועתק! שלח אותו למשפחה בוואטסאפ 🚀', 'success');
        }).catch(err => {
          console.error('Failed to copy link:', err);
          showToast('שגיאה בהעתקת הקישור. הקישור הוא: ' + inviteLink, 'warning');
        });
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = inviteLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
          document.execCommand('copy');
          showToast('קישור ההזמנה הועתק! שלח אותו למשפחה בוואטסאפ 🚀', 'success');
        } catch (err) {
          alert('אנא העתק את הקישור הבא: ' + inviteLink);
        }
        document.body.removeChild(tempInput);
      }
    });
  }

  // User switcher
  elSwitchUserBtn.addEventListener('click', () => {
    renderUserPicker();
    elUserPickerOverlay.classList.add('active');
  });

  elUserPickerOverlay.addEventListener('click', (e) => {
    if (e.target === elUserPickerOverlay) {
      elUserPickerOverlay.classList.remove('active');
    }
  });

  // Tab switcher
  elNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Dashboard Stat Card click behavior
  const elStatCardPending = document.getElementById('stat-card-pending');
  if (elStatCardPending) {
    elStatCardPending.addEventListener('click', () => {
      switchTab('tasks');
      setTaskFilter('my');
      renderTasks();
    });
  }

  const elStatCardCompleted = document.getElementById('stat-card-completed');
  if (elStatCardCompleted) {
    elStatCardCompleted.addEventListener('click', () => {
      switchTab('tasks');
      setTaskFilter('completed');
      renderTasks();
    });
  }

  // Task list Filters
  elFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setTaskFilter(filter);
      renderTasks();
    });
  });

  // Watch Task Assignee Filter changing
  if (elTaskAssigneeFilter) {
    elTaskAssigneeFilter.addEventListener('change', () => {
      renderTasks();
    });
  }

  // Watch Payment Type changing in Edit Task form
  const editPaymentSelect = document.getElementById('admin-edit-task-payment-type');
  if (editPaymentSelect) {
    editPaymentSelect.addEventListener('change', (e) => {
      const value = e.target.value;
      const rewardGroup = document.getElementById('edit-reward-amount-group');
      const starsGroup = document.getElementById('edit-reward-stars-group');
      if (value === 'paid') {
        rewardGroup.style.display = 'block';
        if (starsGroup) starsGroup.style.display = 'none';
        window.setStarRatingValue('edit-star-rating', 'admin-edit-task-reward-stars', 0);
      } else {
        rewardGroup.style.display = 'none';
        document.getElementById('admin-edit-task-reward').value = '0';
        if (starsGroup) starsGroup.style.display = 'block';
        window.setStarRatingValue('edit-star-rating', 'admin-edit-task-reward-stars', 1);
      }
    });
  }

  // Watch isRecurring checkbox in Edit Task form
  const editRecCheck = document.getElementById('admin-edit-task-is-recurring');
  if (editRecCheck) {
    editRecCheck.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.getElementById('edit-recurring-config-group').style.display = isChecked ? 'block' : 'none';
    });
  }

  // Watch hasReminder checkbox in Edit Task form
  const editRemCheck = document.getElementById('admin-edit-task-has-reminder');
  if (editRemCheck) {
    editRemCheck.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.getElementById('edit-reminder-config-group').style.display = isChecked ? 'block' : 'none';
    });
  }

  // Open Create Task Modal
  const elNavAddTaskBtn = document.getElementById('nav-add-task-btn');
  const elAdminAddTaskBtn = document.getElementById('admin-add-task-btn');
  const elCreateTaskOverlay = document.getElementById('create-task-overlay');
  const elCreateTaskCloseBtn = document.getElementById('create-task-close-btn');

  const openCreateTaskModal = () => {
    // Prefill defaults
    if (document.getElementById('admin-recurring-hour')) {
      document.getElementById('admin-recurring-hour').value = '09';
    }
    if (document.getElementById('admin-recurring-minute')) {
      document.getElementById('admin-recurring-minute').value = '00';
    }
    if (document.getElementById('admin-reminder-hour')) {
      document.getElementById('admin-reminder-hour').value = '12';
    }
    if (document.getElementById('admin-reminder-minute')) {
      document.getElementById('admin-reminder-minute').value = '00';
    }
    if (elCreateTaskOverlay) {
      elCreateTaskOverlay.classList.add('active');
    }
  };

  if (elNavAddTaskBtn) {
    elNavAddTaskBtn.addEventListener('click', openCreateTaskModal);
  }
  if (elAdminAddTaskBtn) {
    elAdminAddTaskBtn.addEventListener('click', openCreateTaskModal);
  }

  // Close Create Task Modal
  if (elCreateTaskCloseBtn && elCreateTaskOverlay) {
    elCreateTaskCloseBtn.addEventListener('click', () => {
      elCreateTaskOverlay.classList.remove('active');
    });
    elCreateTaskOverlay.addEventListener('click', (e) => {
      if (e.target === elCreateTaskOverlay) {
        elCreateTaskOverlay.classList.remove('active');
      }
    });
  }

  // Close Edit Task Modal
  if (elEditTaskCloseBtn) {
    elEditTaskCloseBtn.addEventListener('click', () => {
      elEditTaskOverlay.classList.remove('active');
    });
  }

  // Save Edit Task Form Submit
  if (elAdminEditTaskForm) {
    elAdminEditTaskForm.addEventListener('submit', saveTaskEdit);
  }

  // Delete Task Button click
  if (elAdminEditTaskDeleteBtn) {
    elAdminEditTaskDeleteBtn.addEventListener('click', () => {
      const taskId = document.getElementById('admin-edit-task-id').value;
      deleteTask(taskId);
    });
  }

  // Calendar Controls
  if (elCalendarPrevBtn && elCalendarNextBtn) {
    elCalendarPrevBtn.addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar();
    });

    elCalendarNextBtn.addEventListener('click', () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // Close calendar day modal
  if (elDayModalCloseBtn && elDayModalOverlay) {
    elDayModalCloseBtn.addEventListener('click', () => {
      elDayModalOverlay.classList.remove('active');
    });

    elDayModalOverlay.addEventListener('click', (e) => {
      if (e.target === elDayModalOverlay) {
        elDayModalOverlay.classList.remove('active');
      }
    });
  }

  // Watch Payment Type changing in form
  document.getElementById('admin-payment-type').addEventListener('change', (e) => {
    const value = e.target.value;
    const rewardGroup = document.getElementById('reward-amount-group');
    const starsGroup = document.getElementById('reward-stars-group');
    if (value === 'paid') {
      rewardGroup.style.display = 'block';
      if (starsGroup) starsGroup.style.display = 'none';
      window.setStarRatingValue('create-star-rating', 'admin-reward-stars', 0);
    } else {
      rewardGroup.style.display = 'none';
      document.getElementById('admin-reward').value = '0';
      if (starsGroup) starsGroup.style.display = 'block';
      window.setStarRatingValue('create-star-rating', 'admin-reward-stars', 1);
    }
  });

  // Watch isRecurring checkbox in form
  document.getElementById('admin-is-recurring').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.getElementById('recurring-config-group').style.display = isChecked ? 'block' : 'none';
  });

  // Watch hasReminder checkbox in form
  document.getElementById('admin-has-reminder').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    document.getElementById('reminder-config-group').style.display = isChecked ? 'block' : 'none';
  });

  // Admin New Task Form submit
  elAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const title = document.getElementById('admin-task-title').value.trim();
    const description = document.getElementById('admin-task-desc').value.trim();
    const assignedTo = document.getElementById('admin-assignee').value;
    const paymentType = document.getElementById('admin-payment-type').value;
    
    const rewardInput = document.getElementById('admin-reward').value;
    const reward = paymentType === 'paid' && rewardInput ? parseFloat(rewardInput) : 0;
    
    const starsInput = document.getElementById('admin-reward-stars').value;
    const stars = paymentType === 'volunteer' && starsInput ? parseInt(starsInput) : 0;
    
    const isRecurring = document.getElementById('admin-is-recurring').checked;
    const hasReminder = document.getElementById('admin-has-reminder').checked;
    
    // Determine scheduling values
    let dayOfWeek = null;
    let dueDate = '';
    let time = '09:00';
    let reminderDateTime = null;
    
    if (isRecurring) {
      const recHour = document.getElementById('admin-recurring-hour').value || '09';
      const recMin = document.getElementById('admin-recurring-minute').value || '00';
      time = `${recHour}:${recMin}`;
      dayOfWeek = parseInt(document.getElementById('admin-weekly-day').value);
    }
    
    if (hasReminder) {
      const remDate = document.getElementById('admin-reminder-date').value;
      const remHour = document.getElementById('admin-reminder-hour').value || '12';
      const remMin = document.getElementById('admin-reminder-minute').value || '00';
      
      if (remDate) {
        reminderDateTime = `${remDate}T${remHour}:${remMin}`;
        dueDate = remDate;
        if (!isRecurring) {
          time = `${remHour}:${remMin}`;
        }
      } else {
        reminderDateTime = null;
        dueDate = '';
        if (!isRecurring) time = '';
      }
    } else if (!isRecurring) {
      dueDate = '';
      time = '';
    }

    if (!title) {
      showToast('נא להזין כותרת למשימה', 'warning');
      return;
    }

    if (!assignedTo) {
      showToast('נא לבחור בן משפחה לביצוע המשימה', 'warning');
      return;
    }

    // Add task to state
    const newTask = {
      id: `${state.groupId}-task-${Date.now()}`,
      groupId: state.groupId,
      title,
      description,
      assignedTo,
      type: isRecurring ? 'recurring' : 'one-off',
      recurrence: isRecurring ? 'weekly' : null,
      reward,
      stars,
      dueDate,
      time,
      dayOfWeek,
      hasReminder,
      reminderDateTime,
      status: 'new',
      completedBy: null,
      completedDate: null,
      order: state.tasks.length
    };

    const historyId = `${state.groupId}-hist-${Date.now()}`;
    const historyEntry = {
      id: historyId,
      groupId: state.groupId,
      taskId: newTask.id,
      title: newTask.title,
      action: 'created',
      reward: newTask.reward,
      stars: newTask.stars,
      completedBy: state.currentUser.id,
      completedDate: formatDateString(new Date()),
      timestamp: new Date().toISOString()
    };
    
    try {
      await db.collection('tasks').doc(newTask.id).set(newTask);
      await db.collection('history').doc(historyId).set(historyEntry);
    } catch (err) {
      console.error("Firebase save task failed:", err);
    }
    
    saveState();
    
    const elCreateTaskOverlay = document.getElementById('create-task-overlay');
    if (elCreateTaskOverlay) {
      elCreateTaskOverlay.classList.remove('active');
    }
    
    localStorage.setItem('household_pending_toast', JSON.stringify({
      message: `המשימה "${title}" נוצרה בהצלחה!`,
      type: 'success'
    }));
    window.location.reload();
  });

  // Profile Management - Add Profile
  if (elAdminAddProfileForm) {
    elAdminAddProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-new-profile-name').value.trim();
      const avatar = document.getElementById('admin-new-profile-avatar').value;
      const role = document.getElementById('admin-new-profile-role').value;
      const color = document.getElementById('admin-new-profile-color').value;

      if (!name) return;

      const newUser = {
        id: `${state.groupId}-user-${Date.now()}`,
        groupId: state.groupId,
        name,
        role,
        avatar,
        color,
        balance: 0,
        stars: 0
      };

      try {
        await db.collection('users').doc(newUser.id).set(newUser);
      } catch (err) {
        console.error("Firebase create user failed:", err);
      }
      saveState();
      
      elAdminAddProfileForm.reset();
      document.getElementById('admin-new-profile-color').value = '#8b5cf6';
      selectAvatarOption('admin-new', '👧');
      
      // Reset collapsible state
      if (elAdminAddProfileForm) {
        elAdminAddProfileForm.style.display = 'none';
      }
      const elToggleAddProfileBtn = document.getElementById('toggle-add-profile-btn');
      if (elToggleAddProfileBtn) {
        elToggleAddProfileBtn.innerHTML = '➕ הוספת בן משפחה חדש';
        elToggleAddProfileBtn.style.borderStyle = 'dashed';
      }
      const elFamilySettingsFinishBtn = document.getElementById('family-settings-finish-btn');
      if (elFamilySettingsFinishBtn) {
        elFamilySettingsFinishBtn.style.display = 'block';
      }
      
      // Update the profiles list on the UI immediately
      renderProfilesList();
      
      showToast(`הפרופיל עבור ${name} נוצר בהצלחה!`, 'success');
    });
  }

  // Profile Management - Edit Profile Modal Close
  if (elEditProfileCloseBtn) {
    elEditProfileCloseBtn.addEventListener('click', () => {
      elEditProfileOverlay.classList.remove('active');
    });
  }

  // Profile Management - Save Profile Edits
  if (elAdminEditProfileForm) {
    elAdminEditProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-edit-profile-id').value;
      const name = document.getElementById('admin-edit-profile-name').value.trim();
      const avatar = document.getElementById('admin-edit-profile-avatar').value;
      const role = document.getElementById('admin-edit-profile-role').value;
      const color = document.getElementById('admin-edit-profile-color').value;

      if (!name) return;

      const user = state.users.find(u => u.id === id);
      if (user) {
        const updatedUser = {
          ...user,
          groupId: state.groupId,
          name,
          avatar,
          role,
          color
        };
        try {
          await db.collection('users').doc(id).set(updatedUser);
        } catch (err) {
          console.error("Firebase update user failed:", err);
        }

        if (state.currentUser.id === id) {
          state.currentUser = updatedUser;
        }

        saveState();
        elEditProfileOverlay.classList.remove('active');

        localStorage.setItem('household_pending_toast', JSON.stringify({
          message: 'הפרופיל עודכן בהצלחה!',
          type: 'success'
        }));
        window.location.reload();
      }
    });
  }

  // Handle global calendar menu toggle clicks
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.calendar-menu-container')) {
      document.querySelectorAll('.calendar-dropdown').forEach(d => d.classList.remove('active'));
    }
  });
}

// User Picker logic
function renderUserPicker() {
  elUsersGrid.innerHTML = '';
  state.users.forEach(user => {
    const isCurrent = user.id === state.currentUser.id;
    const card = document.createElement('div');
    card.className = `user-card ${isCurrent ? 'active' : ''}`;
    if (isCurrent) {
      card.style.borderColor = 'var(--accent-purple)';
      card.style.boxShadow = 'var(--shadow-glow)';
    }
    
    card.innerHTML = `
      <div class="avatar" style="box-shadow: inset 0 0 15px ${user.color}40">${getAvatarHTML(user.avatar)}</div>
      <div class="name">${user.name}</div>
      <div class="role">${user.role === 'admin' ? '👨‍👩‍👧‍👦 הורה' : '👦 ילד'}</div>
      <div class="balance" style="color: var(--accent-emerald); font-weight: 700;">₪${user.balance}</div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      selectUser(user.id);
      if (elUserPickerOverlay) {
        elUserPickerOverlay.classList.remove('active');
      }
    });
    
    elUsersGrid.appendChild(card);
  });
}

function selectUser(userId) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    // Ensure overlay is closed immediately to guarantee visual feedback
    if (elUserPickerOverlay) {
      elUserPickerOverlay.classList.remove('active');
    }
    
    state.currentUser = user;
    saveState();
    updateProfileUI();

    // Adjust filter based on role
    const defaultFilter = user.role === 'admin' ? 'all' : 'my';
    setTaskFilter(defaultFilter);

    // If the new active user is not an admin, redirect them from the admin tab to the tasks tab and close settings modal
    if (user.role !== 'admin') {
      if (elFamilySettingsOverlay) {
        elFamilySettingsOverlay.classList.remove('active');
      }
      const activeTab = localStorage.getItem('household_active_tab') || 'tasks';
      if (activeTab === 'admin') {
        localStorage.setItem('household_active_tab', 'tasks');
        // Update nav tabs active classes
        document.querySelectorAll('.nav-tab').forEach(t => {
          if (t.getAttribute('data-tab') === 'tasks') {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
        document.querySelectorAll('.tab-content').forEach(panel => {
          if (panel.id === 'tasks-tab-content') {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      }
    }
    
    // Trigger fully-refreshed layouts wrapped in try-catch to avoid blocking close operations
    try {
      renderDashboard();
      renderTasks();
      renderCalendar();
      renderAdminPanel();
    } catch (err) {
      console.error("Error rendering UI components on user change:", err);
    }
    
    showToast(`שלום ${user.name}, מחובר כעת!`, 'success');
  }
}

// Dashboard Logic
function renderDashboard() {
  // Count stats
  // Tasks assigned to current user, or "all" open tasks
  const myTasks = state.tasks.filter(t => t.status !== 'completed' && t.assignedTo === state.currentUser.id && !isTaskCompletedToday(t));
  const pendingCount = myTasks.length;
  
  // Total completions by current user
  const compCount = state.history.filter(h => h.completedBy === state.currentUser.id).length;

  elStatPendingTasks.textContent = pendingCount;
  elStatCompletedTasks.textContent = compCount;

  // Render recent activity history list
  elHistoryList.innerHTML = '';
  if (state.history.length === 0) {
    elHistoryList.innerHTML = `<div class="empty-state">אין היסטוריית פעילות עדיין.</div>`;
  } else {
    // Show last 10 completed tasks, newest first
    const sortedHist = [...state.history].reverse().slice(0, 10);
    sortedHist.forEach(item => {
      const completionUser = state.users.find(u => u.id === item.completedBy) || { name: 'משתמש', avatar: '👤' };
      const formattedDate = formatDateHebrew(item.completedDate);
      
      let editBtnHTML = '';
      if (state.currentUser && state.currentUser.role === 'admin' && item.action !== 'deleted') {
        editBtnHTML = `
          <button class="btn-edit-history" onclick="editTaskFromHistory('${item.id}')" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); color: #a78bfa; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'" title="ערוך משימה">
            ✏️ ערוך
          </button>
        `;
      }
      
      let badgeHTML = '';
      let priceHTML = '';
      let itemStyle = '';
      
      const action = item.action || 'completed';
      
      if (action === 'created') {
        badgeHTML = `<span class="task-badge status-new" style="background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2);">➕ נוצרה</span>`;
        if (item.reward > 0) {
          priceHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">₪${item.reward}</span>`;
        } else if (item.stars > 0) {
          priceHTML = `<span style="font-size: 0.85rem; color: #a78bfa; font-weight: bold;">⭐ ${item.stars}</span>`;
        } else {
          priceHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">משימה שוטפת</span>`;
        }
      } else if (action === 'in-progress') {
        badgeHTML = `<span class="task-badge status-in-progress" style="background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2);">⏳ בטיפול</span>`;
        if (item.reward > 0) {
          priceHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">₪${item.reward}</span>`;
        } else if (item.stars > 0) {
          priceHTML = `<span style="font-size: 0.85rem; color: #a78bfa; font-weight: bold;">⭐ ${item.stars}</span>`;
        } else {
          priceHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">משימה שוטפת</span>`;
        }
      } else if (action === 'deleted') {
        badgeHTML = `<span class="task-badge status-completed" style="background: rgba(244, 63, 94, 0.1); color: #f87171; border: 1px solid rgba(244, 63, 94, 0.2);">🗑️ נמחקה</span>`;
        priceHTML = ``;
        itemStyle = `opacity: 0.65; border-style: dashed;`;
      } else { // completed
        badgeHTML = `<span class="task-badge status-completed" style="background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2);">✅ בוצע</span>`;
        if (item.reward > 0) {
          priceHTML = `<span class="history-price">+₪${item.reward}</span>`;
        } else if (item.stars > 0) {
          priceHTML = `<span class="history-price" style="color: #a78bfa; font-weight: bold;">+⭐${item.stars}</span>`;
        } else {
          priceHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">בוצע</span>`;
        }
      }
      
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      if (itemStyle) itemEl.style.cssText = itemStyle;
      const completionAvatarHTML = getAvatarHTML(completionUser.avatar);
      itemEl.innerHTML = `
        <div class="history-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="history-title" style="${action === 'deleted' ? 'text-decoration: line-through;' : ''}">${item.title}</span>
            ${badgeHTML}
          </div>
          <span class="history-time">${formattedDate}</span>
        </div>
        <div class="history-meta" style="display: flex; align-items: center; gap: 12px;">
          <span class="history-who" style="display: inline-flex; align-items: center; gap: 6px;">
            <span style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%; font-size: 0.95rem;">${completionAvatarHTML}</span>
            <span>${completionUser.name}</span>
          </span>
          ${priceHTML}
          ${editBtnHTML}
        </div>
      `;
      elHistoryList.appendChild(itemEl);
    });
  }

  // Render earnings ranking
  elRankingList.innerHTML = '';
  // Sort users by balance desc
  const sortedUsers = [...state.users].sort((a, b) => b.balance - a.balance);
  sortedUsers.forEach(u => {
    const rankEl = document.createElement('div');
    rankEl.className = 'ranking-item';
    
    const isParent = state.currentUser.role === 'admin';
    const canPayout = u.balance > 0;
    
    rankEl.innerHTML = `
      <div class="ranking-user">
        <span class="ranking-avatar">${getAvatarHTML(u.avatar)}</span>
        <div style="display: flex; flex-direction: column;">
          <span class="ranking-name">${u.name}</span>
          ${isParent ? `<span style="font-size: 0.7rem; color: var(--text-secondary);">${u.role === 'admin' ? 'הורה' : 'ילד/משתתף'}</span>` : ''}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="ranking-amount" style="display: flex; gap: 8px; align-items: center;">
          <span style="color: var(--accent-emerald); font-weight: 700;">₪${u.balance}</span>
          <span style="color: var(--text-muted); font-size: 0.8rem;">|</span>
          <span style="color: #a78bfa; font-weight: 700;">⭐ ${u.stars || 0}</span>
        </span>
        ${isParent && u.role !== 'admin' ? `
          <button type="button" class="btn btn-primary btn-payout-dashboard" style="padding: 4px 10px; font-size: 0.8rem; background: var(--accent-emerald); border: none; border-radius: var(--border-radius-sm); cursor: pointer; font-weight: bold; color: #000;" ${canPayout ? '' : 'disabled'}>
            💵 שלם
          </button>
        ` : ''}
      </div>
    `;
    
    if (isParent && u.role !== 'admin' && canPayout) {
      rankEl.querySelector('.btn-payout-dashboard').addEventListener('click', () => {
        payoutUser(u.id);
      });
    }
    
    elRankingList.appendChild(rankEl);
  });
}

function formatDateHebrew(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Populate admin options
function populateAdminAssigneeSelect() {
  elAdminAssignee.innerHTML = '<option value="" disabled selected>בחר בן משפחה...</option>';
  state.users.forEach(u => {
    elAdminAssignee.innerHTML += `<option value="${u.id}">${u.name} (${u.role === 'admin' ? 'הורה' : 'ילד'})</option>`;
  });
}

function populateTaskAssigneeFilter() {
  if (!elTaskAssigneeFilter) return;
  const currentVal = elTaskAssigneeFilter.value || 'any';
  
  elTaskAssigneeFilter.innerHTML = `
    <option value="any">🔎 כל המשימות</option>
  `;
  
  state.users.forEach(u => {
    elTaskAssigneeFilter.innerHTML += `<option value="${u.id}">👤 ${u.name}</option>`;
  });
  
  // Restore value if it still exists
  if (Array.from(elTaskAssigneeFilter.options).some(opt => opt.value === currentVal)) {
    elTaskAssigneeFilter.value = currentVal;
  } else {
    elTaskAssigneeFilter.value = 'any';
  }
}

// Tasks Panel Logic
// Tasks Panel Logic
function renderTasks() {
  const elTasksGrid = document.getElementById('tasks-grid');
  if (elTasksGrid) elTasksGrid.innerHTML = '';

  // Get active filter
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'my';

  // Toggle assignee filter visibility: hide in "My Tasks"
  const elAssigneeFilterContainer = document.getElementById('assignee-filter-container');
  if (elAssigneeFilterContainer) {
    if (filter === 'my') {
      elAssigneeFilterContainer.style.display = 'none';
    } else {
      elAssigneeFilterContainer.style.display = 'flex';
    }
  }

  if (filter === 'my' && elTaskAssigneeFilter) {
    elTaskAssigneeFilter.value = state.currentUser.id;
  }

  let filteredTasks = [];
  
  if (filter === 'my') {
    // Tasks assigned directly to current user that are active (not completed today or completed permanently)
    filteredTasks = state.tasks.filter(t => {
      return t.assignedTo === state.currentUser.id && t.status !== 'completed' && !isTaskCompletedToday(t);
    });
  } else if (filter === 'paid') {
    // Show paid active tasks
    filteredTasks = state.tasks.filter(t => t.status !== 'completed' && t.reward > 0 && !isTaskCompletedToday(t));
  } else if (filter === 'completed') {
    // Show completed tasks (one-off completed permanently, or recurring completed today)
    filteredTasks = state.tasks.filter(t => t.status === 'completed' || isTaskCompletedToday(t));
  } else {
    // 'all' active tasks (excluding completed ones)
    filteredTasks = state.tasks.filter(t => t.status !== 'completed' && !isTaskCompletedToday(t));
  }

  // Apply assignee dropdown filter
  const assigneeFilter = elTaskAssigneeFilter ? elTaskAssigneeFilter.value : 'any';
  if (assigneeFilter !== 'any') {
    filteredTasks = filteredTasks.filter(t => {
      if (t.status === 'completed') {
        return t.completedBy === assigneeFilter;
      }
      return t.assignedTo === assigneeFilter;
    });
  }

  if (filteredTasks.length === 0) {
    if (elTasksGrid) {
      elTasksGrid.innerHTML = `
        <div class="empty-state" style="width: 100%; grid-column: 1 / -1;">
          <div class="empty-state-icon">📋</div>
          <div>אין משימות להצגה.</div>
        </div>
      `;
    }
    return;
  }

  filteredTasks.forEach(task => {
    const card = document.createElement('div');
    card.id = `task-card-${task.id}`;
    card.className = `task-card glass-panel ${task.reward > 0 ? 'paid-task' : ''}`;
    
    // Disable native HTML5 drag-and-drop on touch devices to prevent touch events (clicks) on child buttons from being cancelled
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    card.draggable = !isTouchDevice;
    
    if (!isTouchDevice) {
      card.setAttribute('ondragstart', `dragTask(event, '${task.id}')`);
      card.setAttribute('ondragend', 'dragEndTask(event)');
      card.setAttribute('ondragover', `dragOverTaskCard(event, '${task.id}')`);
      card.setAttribute('ondragleave', `dragLeaveTaskCard(event, '${task.id}')`);
      card.setAttribute('ondrop', `dropTaskOnCard(event, '${task.id}')`);
    }
    
    // Assignee details
    let assigneeName = 'כל בני הבית';
    let assigneeColor = 'var(--text-muted)';
    if (task.assignedTo !== 'all') {
      const taskUser = state.users.find(u => u.id === task.assignedTo);
      if (taskUser) {
        assigneeName = taskUser.name;
        assigneeColor = taskUser.color;
      }
    }

    // Task badge details
    const badgeText = task.type === 'recurring' ? 
      (task.recurrence === 'daily' ? 'יומי שוטף' : 'שבועי שוטף') : 'חד-פעמי';
    const badgeClass = task.type === 'recurring' ? 'recurring' : 'one-off';

    let statusText = '';
    let statusClass = '';
    if (task.status === 'new') {
      statusText = 'חדש';
      statusClass = 'status-new';
    } else if (task.status === 'in-progress') {
      statusText = 'בטיפול';
      statusClass = 'status-in-progress';
    } else if (task.status === 'completed') {
      statusText = 'הסתיים';
      statusClass = 'status-completed';
    }

    // Build actions based on user and task state
    let actionHTML = '';
    const isAdmin = state.currentUser.role === 'admin';

    if (task.status !== 'completed') {
      if (task.assignedTo === 'all') {
        actionHTML += `
          <button class="btn btn-secondary" onclick="claimTask('${task.id}')" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); color: #a78bfa; flex-grow: 1;">🙋 שייך אליי</button>
        `;
      } else {
        actionHTML += `
          <button class="btn btn-primary" onclick="triggerCompleteTask('${task.id}')" style="flex-grow: 1;">סמן כבוצע</button>
        `;
      }

      if (isAdmin) {
        actionHTML += `
          <button class="btn btn-secondary" onclick="triggerEditTask('${task.id}')" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); flex-grow: 0.5;">✏️ ערוך</button>
        `;
      }

      actionHTML = `
        <div style="display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
          ${actionHTML}
          <div class="calendar-menu-container" style="flex-grow: 0.5;">
            <button class="btn btn-secondary btn-calendar" onclick="toggleCalendarMenu(event, '${task.id}')" style="width: 100%;">📅 הוסף ללוח</button>
            <div class="calendar-dropdown" id="cal-drop-${task.id}">
              <button class="calendar-dropdown-item" onclick="exportToGoogle('${task.id}')">🌐 גוגל (Google)</button>
              <button class="calendar-dropdown-item" onclick="exportToApple('${task.id}')">🍎 אפל (Apple)</button>
            </div>
          </div>
        </div>
      `;
    } else {
      const compUser = state.users.find(u => u.id === task.completedBy) || { name: 'מישהו' };
      actionHTML = `
        <span style="color: var(--accent-emerald); font-weight: 600; text-align: center; width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px;">
          ✓ בוצע על ידי ${compUser.name}
        </span>
      `;
      if (isAdmin) {
        actionHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            ${actionHTML}
            <button class="btn btn-secondary" onclick="triggerEditTask('${task.id}')" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); width: 100%;">✏️ ערוך משימה (הורה)</button>
          </div>
        `;
      }
    }

    // Format scheduling string
    let scheduleHTML = '';
    if (task.type === 'one-off') {
      if (task.dueDate) {
        scheduleHTML = `
          <div style="font-size: 0.8rem; color: #a78bfa; font-weight: 500; margin-bottom: 8px;">
            📅 יעד: ${formatDateHebrew(task.dueDate)} בשעה ${task.time || '12:00'}
          </div>
        `;
      }
    } else {
      let scheduleText = '';
      if (task.recurrence === 'daily') {
        scheduleText = `🔄 מדי יום בשעה ${task.time || '09:00'}`;
      } else {
        scheduleText = `🔄 יום ${HebrewWeekdays[task.dayOfWeek]} בשעה ${task.time || '09:00'}`;
      }
      scheduleHTML = `
        <div style="font-size: 0.8rem; color: #a78bfa; font-weight: 500; margin-bottom: 8px;">
          ${scheduleText}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="task-header">
        <h4 class="task-title">${task.title}</h4>
        <div style="display: flex; gap: 4px; flex-shrink: 0; align-items: center;">
          <span class="task-badge ${badgeClass}">${badgeText}</span>
          <span class="task-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      <p class="task-desc">${task.description || 'אין פירוט נוסף.'}</p>
      ${scheduleHTML}
      <div class="task-meta">
        <span class="task-assignee" style="background: ${assigneeColor === 'var(--text-muted)' ? 'rgba(255, 255, 255, 0.02)' : assigneeColor + '12'}; border: 1px solid ${assigneeColor === 'var(--text-muted)' ? 'rgba(255, 255, 255, 0.08)' : assigneeColor + '30'}; color: ${assigneeColor === 'var(--text-muted)' ? 'var(--text-secondary)' : assigneeColor}; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;">
          <span class="assignee-dot" style="background-color: ${assigneeColor === 'var(--text-muted)' ? 'var(--text-muted)' : assigneeColor}; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 6px ${assigneeColor === 'var(--text-muted)' ? 'transparent' : assigneeColor};"></span>
          <span>שיוך: ${assigneeName}</span>
        </span>
        <span class="task-price" style="${task.reward > 0 ? '' : (task.stars > 0 ? 'color: #a78bfa;' : '')}">
          ${task.reward > 0 ? `₪${task.reward}` : (task.stars > 0 ? `⭐ ${task.stars}` : 'משימה שוטפת')}
        </span>
      </div>
      <div class="task-actions">
        ${actionHTML}
      </div>
    `;

    if (elTasksGrid) {
      elTasksGrid.appendChild(card);
    }
  });
}

// Expand/Collapse Calendar Menu dropdowns
window.toggleCalendarMenu = function(event, taskId) {
  event.stopPropagation();
  const dropdown = document.getElementById(`cal-drop-${taskId}`);
  const wasActive = dropdown.classList.contains('active');
  
  // Close all other dropdowns
  document.querySelectorAll('.calendar-dropdown').forEach(d => d.classList.remove('active'));
  
  if (!wasActive) {
    dropdown.classList.add('active');
  }
};

window.claimAndCompleteTask = async function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task && task.assignedTo === 'all') {
    task.assignedTo = state.currentUser.id;
    await triggerCompleteTask(taskId);
  }
};

window.triggerCompleteTask = async function(taskId) {
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  const task = state.tasks[taskIndex];
  
  // Find card element in DOM and add fade-out class
  const cardEl = document.getElementById(`task-card-${taskId}`);
  if (cardEl) {
    cardEl.classList.add('fade-out-complete');
  }

  const todayStr = formatDateString(new Date());
  const historyId = `${state.groupId}-hist-${Date.now()}`;
  const historyEntry = {
    id: historyId,
    groupId: state.groupId,
    taskId: task.id,
    title: task.title,
    action: 'completed',
    reward: task.reward,
    stars: task.stars || 0,
    completedBy: state.currentUser.id,
    completedDate: todayStr,
    timestamp: new Date().toISOString()
  };

  const user = state.users.find(u => u.id === state.currentUser.id);
  if (task.reward > 0) {
    if (user) {
      user.balance += task.reward;
      state.currentUser.balance = user.balance; // Sync active context
      showToast(`הרווחת ₪${task.reward} על ביצוע: ${task.title}!`, 'success');
    }
  } else {
    const starsToReward = task.stars || 0;
    if (starsToReward > 0) {
      if (user) {
        user.stars = (user.stars || 0) + starsToReward;
        state.currentUser.stars = user.stars; // Sync active context
        showToast(`קיבלת ⭐${starsToReward} על ביצוע: ${task.title}!`, 'success');
      }
    } else {
      showToast(`המשימה "${task.title}" הושלמה!`, 'success');
    }
  }

  // Handle recurrence vs one-off
  if (task.type === 'recurring') {
    if (task.title.includes('הכלב') || task.title.includes('כלים') || task.title.includes('רכב')) {
      const originalTask = window.householdMockData.tasks.find(t => t.title === task.title);
      if (originalTask && originalTask.assignedTo === 'all') {
        task.assignedTo = 'all';
      }
    }
    task.status = 'new';
  } else {
    task.status = 'completed';
    task.completedBy = state.currentUser.id;
    task.completedDate = todayStr;
  }

  try {
    const promises = [];
    promises.push(db.collection('tasks').doc(task.id).set(task));
    if (user) {
      promises.push(db.collection('users').doc(user.id).set(user));
    }
    promises.push(db.collection('history').doc(historyId).set(historyEntry));
    await Promise.all(promises);
  } catch (err) {
    console.error("Firebase update failed:", err);
  }

  saveState();
  updateProfileUI();

  const delay = cardEl ? 350 : 0;
  setTimeout(() => {
    renderDashboard();
    renderTasks();
    renderAdminPanel();
  }, delay);
};

window.editTaskFromHistory = function(histId) {
  const histItem = state.history.find(h => h.id === histId);
  if (!histItem) return;
  
  // Find by taskId first
  let task = state.tasks.find(t => t.id === histItem.taskId);
  
  // Fallback: search by title match
  if (!task) {
    task = state.tasks.find(t => t.title === histItem.title);
  }
  
  if (task) {
    triggerEditTask(task.id);
  } else {
    showToast('המשימה המקורית לא נמצאה או שנמחקה', 'warning');
  }
};

// Calendar Integrations (Exporting/Subscribing)
window.exportToGoogle = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  // Decide date
  let dateStr = task.dueDate;
  if (!dateStr) {
    // For weekly/recurring, find the next occurrence of dayOfWeek or use today
    const d = new Date();
    if (task.dayOfWeek !== null) {
      const currentDay = d.getDay();
      let diff = task.dayOfWeek - currentDay;
      if (diff < 0) diff += 7; // Next week
      d.setDate(d.getDate() + diff);
    }
    dateStr = formatDateString(d);
  }

  // Format dates for Google TEMPLATE: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS (local time)
  const cleanDate = dateStr.replace(/-/g, '');
  const taskTime = task.time || '09:00';
  const timeClean = taskTime.replace(':', '') + '00';
  
  const [h, m] = taskTime.split(':').map(Number);
  const endHour = String((h + 1) % 24).padStart(2, '0');
  const endTimeClean = endHour + String(m).padStart(2, '0') + '00';
  
  let endDateClean = cleanDate;
  if (h === 23) {
    const dObj = new Date(dateStr);
    dObj.setDate(dObj.getDate() + 1);
    endDateClean = formatDateString(dObj).replace(/-/g, '');
  }
  
  const googleDates = `${cleanDate}T${timeClean}/${endDateClean}T${endTimeClean}`;
  const title = encodeURIComponent(`מטלה: ${task.title}`);
  const details = encodeURIComponent(`${task.description || ''}\nהערה: הוגדר דרך מערכת משימות הבית. תגמול: ₪${task.reward || 0}`);
  
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${googleDates}&sf=true&output=xml`;
  
  window.open(googleUrl, '_blank');
  showToast('יוצר קישור ומעביר לגוגל קלנדר...', 'info');
};

window.exportToApple = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  // Decide date
  let dateStr = task.dueDate;
  if (!dateStr) {
    const d = new Date();
    if (task.dayOfWeek !== null) {
      const currentDay = d.getDay();
      let diff = task.dayOfWeek - currentDay;
      if (diff < 0) diff += 7;
      d.setDate(d.getDate() + diff);
    }
    dateStr = formatDateString(d);
  }

  const cleanDate = dateStr.replace(/-/g, '');
  const taskTime = task.time || '09:00';
  const timeClean = taskTime.replace(':', '') + '00';

  const [h, m] = taskTime.split(':').map(Number);
  const endHour = String((h + 1) % 24).padStart(2, '0');
  const endTimeClean = endHour + String(m).padStart(2, '0') + '00';

  let endDateClean = cleanDate;
  if (h === 23) {
    const dObj = new Date(dateStr);
    dObj.setDate(dObj.getDate() + 1);
    endDateClean = formatDateString(dObj).replace(/-/g, '');
  }

  const now = new Date();
  const timeStamp = formatDateString(now).replace(/-/g, '') + 'T' + 
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0') + '00Z';

  // Construct iCal text file
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Household Task Manager//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:task-${task.id}@householdtasks.com`,
    `DTSTAMP:${timeStamp}`,
    `DTSTART:${cleanDate}T${timeClean}`,
    `DTEND:${endDateClean}T${endTimeClean}`,
    `SUMMARY:מטלה: ${task.title}`,
    `DESCRIPTION:${task.description || ''} (תגמול: ₪${task.reward || 0})`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${task.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('קובץ לוח השנה (.ics) הורד בהצלחה!', 'success');
};

// Calendar Tab Generation
function renderCalendar() {
  if (!elCalendarTitle || !elCalendarDaysGrid) return;
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth(); // 0-indexed

  // Header month-year
  elCalendarTitle.textContent = `${HebrewMonths[month]} ${year}`;

  // Clear Grid
  elCalendarDaysGrid.innerHTML = '';

  // Get first day of the month and count of days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Create weekday headers if not already generated by HTML static elements
  // We already have .calendar-weekdays-grid in HTML, so we just populate days

  // Prev month padding cells (inactive)
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day-cell inactive';
    const dayNum = prevMonthTotalDays - i;
    dayCell.innerHTML = `<span class="day-number">${dayNum}</span>`;
    elCalendarDaysGrid.appendChild(dayCell);
  }

  // Current month active cells
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day-cell';
    if (isCurrentMonth && today.getDate() === day) {
      dayCell.classList.add('today');
    }

    const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cellDateObj = new Date(year, month, day);
    const dayOfWeek = cellDateObj.getDay();

    // Render day number
    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    // Filter tasks that fall on this day
    const dayTasks = state.tasks.filter(task => {
      if (task.status === 'completed') return false;
      
      if (task.type === 'one-off') {
        return task.dueDate === cellDateStr;
      } else if (task.type === 'recurring') {
        if (task.recurrence === 'daily') {
          return true; // daily tasks show every day
        }
        if (task.recurrence === 'weekly') {
          return task.dayOfWeek === dayOfWeek;
        }
      }
      return false;
    });

    // Create subcontainer for tasks list
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'calendar-day-tasks';

    // Show top 2 tasks as text tags, others as a "+X" count indicator
    dayTasks.slice(0, 2).forEach(task => {
      const taskTag = document.createElement('div');
      const isAssignedToMe = task.assignedTo === state.currentUser.id;
      taskTag.className = `calendar-task-dot ${task.assignedTo === 'all' ? 'general' : 'assigned'}`;
      taskTag.textContent = `${task.time || '09:00'} - ${task.title}`;
      tasksContainer.appendChild(taskTag);
    });

    if (dayTasks.length > 2) {
      const moreIndicator = document.createElement('div');
      moreIndicator.style.fontSize = '0.65rem';
      moreIndicator.style.color = 'var(--text-secondary)';
      moreIndicator.style.fontWeight = '600';
      moreIndicator.style.textAlign = 'center';
      moreIndicator.textContent = `+ עוד ${dayTasks.length - 2}`;
      tasksContainer.appendChild(moreIndicator);
    }

    dayCell.appendChild(tasksContainer);

    // Click on day opens list modal
    dayCell.addEventListener('click', () => {
      openDayModal(cellDateStr, dayTasks);
    });

    elCalendarDaysGrid.appendChild(dayCell);
  }

  // Next month padding cells to complete a 6-row or 5-row grid nicely
  const gridCellsCount = firstDayIndex + totalDays;
  const nextMonthPadding = (7 - (gridCellsCount % 7)) % 7;
  for (let i = 1; i <= nextMonthPadding; i++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day-cell inactive';
    dayCell.innerHTML = `<span class="day-number">${i}</span>`;
    elCalendarDaysGrid.appendChild(dayCell);
  }
}

// Calendar Day modal logic
function openDayModal(dateStr, tasks) {
  // Format Title
  const parts = dateStr.split('-');
  const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const formattedTitle = `משימות ליום ${HebrewWeekdays[dObj.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
  
  elDayModalTitle.textContent = formattedTitle;
  elDayModalTaskList.innerHTML = '';

  if (tasks.length === 0) {
    elDayModalTaskList.innerHTML = '<div class="empty-state">אין משימות מתוכננות ליום זה.</div>';
  } else {
    tasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'day-task-card-mini';
      
      let assigneeName = 'כולם';
      if (task.assignedTo !== 'all') {
        const u = state.users.find(user => user.id === task.assignedTo);
        if (u) assigneeName = u.name;
      }

      item.innerHTML = `
        <div class="day-task-info-mini">
          <span class="day-task-title-mini">${task.title}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">שעה: ${task.time || '09:00'} | שיוך: ${assigneeName} | ${task.type === 'recurring' ? 'מחזורית' : 'חד פעמית'}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 8px;">
          <span class="day-task-reward-mini">${task.reward > 0 ? `₪${task.reward}` : 'משימה שוטפת'}</span>
          <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="closeModalAndComplete('${task.id}')">בצע</button>
        </div>
      `;
      elDayModalTaskList.appendChild(item);
    });
  }

  elDayModalOverlay.classList.add('active');
}

window.closeModalAndComplete = function(taskId) {
  elDayModalOverlay.classList.remove('active');
  setTimeout(() => {
    if (state.tasks.find(t => t.id === taskId).assignedTo === 'all') {
      claimAndCompleteTask(taskId);
    } else {
      triggerCompleteTask(taskId);
    }
  }, 100);
};

// Admin Panel Logic
function renderAdminPanel() {
  // Dynamically render the profiles manager list in the settings modal
  renderProfilesList();
}

// Render active users list for editing/deleting in Admin
function renderProfilesList() {
  if (!elAdminProfilesList) return;
  elAdminProfilesList.innerHTML = '';

  state.users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'admin-user-item';
    item.style.padding = '12px 16px';
    
    const isSelf = user.id === state.currentUser.id;
    
    item.innerHTML = `
      <div class="admin-user-details">
        <span style="font-size: 1.6rem; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); box-shadow: inset 0 0 10px ${user.color}30; overflow: hidden;">${getAvatarHTML(user.avatar)}</span>
        <div class="admin-user-balance-info">
          <span style="font-weight: 700;">${user.name} ${isSelf ? '<span style="font-size: 0.75rem; color: #a78bfa; font-weight: 500;">(אני)</span>' : ''}</span>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">${user.role === 'admin' ? 'הורה (מנהל)' : 'ילד / משתתף'}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap: 8px;">
        <button type="button" class="btn btn-secondary btn-edit-profile" style="padding: 6px 12px; font-size: 0.75rem;">✏️ ערוך</button>
        <button type="button" class="btn btn-primary btn-delete-profile" style="padding: 6px 12px; font-size: 0.75rem; background: var(--accent-pink);" ${isSelf ? 'disabled title="אינך יכול למחוק את עצמך"' : ''}>🗑️ מחק</button>
      </div>
    `;
    
    // Add Event Listeners dynamically
    item.querySelector('.btn-edit-profile').addEventListener('click', () => {
      triggerEditProfile(user.id);
    });
    
    if (!isSelf) {
      item.querySelector('.btn-delete-profile').addEventListener('click', () => {
        triggerDeleteProfile(user.id);
      });
    }
    
    elAdminProfilesList.appendChild(item);
  });
}

function triggerEditProfile(userId) {
  const user = state.users.find(u => u.id === userId);
  if (!user) return;

  // Prefill form in modal
  document.getElementById('admin-edit-profile-id').value = user.id;
  document.getElementById('admin-edit-profile-name').value = user.name;
  document.getElementById('admin-edit-profile-avatar').value = user.avatar;
  document.getElementById('admin-edit-profile-role').value = user.role;
  document.getElementById('admin-edit-profile-color').value = user.color || '#8b5cf6';
  selectAvatarOption('admin-edit', user.avatar);

  // Open modal
  elEditProfileOverlay.classList.add('active');
}

async function triggerDeleteProfile(userId) {
  if (userId === state.currentUser.id) {
    showToast('אינך יכול למחוק את הפרופיל של עצמך תוך כדי עבודה!', 'warning');
    return;
  }

  const user = state.users.find(u => u.id === userId);
  if (!user) return;

  const otherUsers = state.users.filter(u => u.id !== userId);
  const fallbackUser = otherUsers.find(u => u.role === 'admin') || otherUsers[0];
  const fallbackName = fallbackUser ? fallbackUser.name : 'מישהו אחר';

  const confirmDelete = confirm(`האם אתה בטוח שברצונך למחוק את הפרופיל של ${user.name}? כל המשימות הפתוחות שהיו משויכות אליו יועברו ל-${fallbackName}.`);
  if (!confirmDelete) return;

  // Reassign tasks locally & on Firestore
  const taskUpdatePromises = [];
  if (fallbackUser) {
    state.tasks.forEach(t => {
      if (t.assignedTo === userId) {
        t.assignedTo = fallbackUser.id;
        taskUpdatePromises.push(db.collection('tasks').doc(t.id).set(t));
      }
    });
  }

  // Delete the user from state via mock db helper
  await db.collection('users').doc(userId).delete();
  if (taskUpdatePromises.length > 0) {
    try {
      await Promise.all(taskUpdatePromises);
    } catch (e) {
      console.error("Failed to update reassigned tasks on Firestore:", e);
    }
  }

  // Save state (tasks change)
  saveState();

  localStorage.setItem('household_pending_toast', JSON.stringify({
    message: `הפרופיל של ${user.name} נמחק בהצלחה.`,
    type: 'success'
  }));
  window.location.reload();
}

function payoutUser(userId) {
  if (state.currentUser.role !== 'admin') {
    showToast('רק הורים מורשים לבצע תשלום (איפוס יתרה)!', 'warning');
    return;
  }

  const user = state.users.find(u => u.id === userId);
  if (user && user.balance > 0) {
    const paidAmount = user.balance;
    user.balance = 0;
    
    // If we paid out the current user, sync the context
    if (state.currentUser.id === userId) {
      state.currentUser.balance = 0;
    }

    try {
      db.collection('users').doc(user.id).set(user);
    } catch (err) {
      console.error("Firebase payout failed:", err);
    }

    saveState();
    updateProfileUI();
    renderDashboard();
    renderTasks();
    renderAdminPanel();
    
    showToast(`שולם ₪${paidAmount} ל-${user.name}! היתרה אופסה.`, 'success');
  }
}

// Background task reminder checker
function checkTaskReminders() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentDay = String(now.getDate()).padStart(2, '0');
  const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
  
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHour}:${currentMinute}`;
  
  const currentDateTimeStr = `${todayStr}T${currentTimeStr}`;
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  state.tasks.forEach(task => {
    if (task.status === 'completed' || isTaskCompletedToday(task)) return;

    let isMatch = false;

    // Check reminder date/time first if it has a custom reminder
    if (task.hasReminder && task.reminderDateTime) {
      isMatch = task.reminderDateTime.startsWith(currentDateTimeStr);
    } else {
      // Fallback to default scheduling match
      if (task.type === 'one-off') {
        isMatch = (task.dueDate === todayStr) && (task.time === currentTimeStr);
      } else if (task.type === 'recurring') {
        if (task.recurrence === 'daily') {
          isMatch = (task.time === currentTimeStr);
        } else if (task.recurrence === 'weekly') {
          isMatch = (task.dayOfWeek === currentDayOfWeek) && (task.time === currentTimeStr);
        }
      }
    }

    if (isMatch) {
      const triggerKey = `${task.id}-${todayStr}-${currentTimeStr}`;
      if (!triggeredReminderTimes[triggerKey]) {
        triggeredReminderTimes[triggerKey] = true;
        
        // Trigger browser notification if allowed
        let hasNotificationPermission = false;
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            hasNotificationPermission = true;
          }
        } catch (e) {
          console.warn('Failed to check Notification permission:', e);
        }

        if (hasNotificationPermission) {
          try {
            new Notification(`CleanHome: תזכורת למשימה`, {
              body: `הגיע הזמן לבצע: ${task.title} (${task.time || ''})${task.reward > 0 ? ` - תגמול: ₪${task.reward}` : ''}`,
              icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏡</text></svg>'
            });
          } catch (e) {
            console.error('Failed to trigger notification:', e);
          }
        }

        // Always trigger toast UI in case window is focused
        showToast(`תזכורת: הגיע הזמן לבצע את המשימה "${task.title}"!`, 'info');
      }
    }
  });
}

// Task board logic additions
window.startTask = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task && task.status === 'new') {
    task.status = 'in-progress';
    
    // Log starting in history
    state.history.push({
      id: `hist-${Date.now()}`,
      taskId: task.id,
      title: task.title,
      action: 'in-progress',
      reward: task.reward,
      stars: task.stars || 0,
      completedBy: state.currentUser.id,
      completedDate: formatDateString(new Date())
    });
    
    saveState();
    renderTasks();
    renderCalendar();
    showToast(`התחלת לעבוד על המשימה: ${task.title}! בהצלחה!`, 'success');
  }
};

window.claimTask = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.assignedTo = state.currentUser.id;
    task.status = 'in-progress';
    
    // Log starting in history
    state.history.push({
      id: `hist-${Date.now()}`,
      taskId: task.id,
      title: task.title,
      action: 'in-progress',
      reward: task.reward,
      stars: task.stars || 0,
      completedBy: state.currentUser.id,
      completedDate: formatDateString(new Date())
    });
    
    saveState();
    renderTasks();
    renderCalendar();
    showToast(`שייכת את המשימה "${task.title}" לעצמך והתחלת לעבוד עליה!`, 'success');
  }
};

window.triggerEditTask = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('admin-edit-task-id').value = task.id;
  document.getElementById('admin-edit-task-title').value = task.title;
  document.getElementById('admin-edit-task-desc').value = task.description || '';
  
  const selectAssignee = document.getElementById('admin-edit-task-assignee');
  selectAssignee.innerHTML = '<option value="" disabled>בחר בן משפחה...</option>';
  state.users.forEach(u => {
    selectAssignee.innerHTML += `<option value="${u.id}">${u.name} (${u.role === 'admin' ? 'הורה' : 'ילד'})</option>`;
  });
  selectAssignee.value = task.assignedTo || '';

  document.getElementById('admin-edit-task-status').value = task.status;

  const paymentType = task.reward > 0 ? 'paid' : 'volunteer';
  document.getElementById('admin-edit-task-payment-type').value = paymentType;
  document.getElementById('admin-edit-task-reward').value = task.reward || 0;
  window.setStarRatingValue('edit-star-rating', 'admin-edit-task-reward-stars', task.stars || 1);
  document.getElementById('edit-reward-amount-group').style.display = paymentType === 'paid' ? 'block' : 'none';
  document.getElementById('edit-reward-stars-group').style.display = paymentType === 'volunteer' ? 'block' : 'none';

  const isRecurring = task.type === 'recurring';
  const hasReminder = !!task.hasReminder;
  
  document.getElementById('admin-edit-task-is-recurring').checked = isRecurring;
  document.getElementById('admin-edit-task-has-reminder').checked = hasReminder;

  document.getElementById('edit-recurring-config-group').style.display = isRecurring ? 'block' : 'none';
  if (isRecurring) {
    document.getElementById('admin-edit-task-weekly-day').value = task.dayOfWeek !== null ? task.dayOfWeek : '0';
    const [recHour, recMin] = (task.time || '09:00').split(':');
    document.getElementById('admin-edit-task-recurring-hour').value = recHour || '09';
    document.getElementById('admin-edit-task-recurring-minute').value = recMin || '00';
  }

  document.getElementById('edit-reminder-config-group').style.display = hasReminder ? 'block' : 'none';
  if (hasReminder) {
    if (task.reminderDateTime) {
      const [remDate, remTime] = task.reminderDateTime.split('T');
      document.getElementById('admin-edit-task-reminder-date').value = remDate || '';
      const [remHour, remMin] = (remTime || '12:00').split(':');
      document.getElementById('admin-edit-task-reminder-hour').value = remHour || '12';
      document.getElementById('admin-edit-task-reminder-minute').value = remMin || '00';
    } else {
      document.getElementById('admin-edit-task-reminder-date').value = '';
      document.getElementById('admin-edit-task-reminder-hour').value = '12';
      document.getElementById('admin-edit-task-reminder-minute').value = '00';
    }
  } else {
    document.getElementById('admin-edit-task-reminder-date').value = '';
    document.getElementById('admin-edit-task-reminder-hour').value = '12';
    document.getElementById('admin-edit-task-reminder-minute').value = '00';
  }

  elEditTaskOverlay.classList.add('active');
};

async function saveTaskEdit(e) {
  e.preventDefault();
  const id = document.getElementById('admin-edit-task-id').value;
  const title = document.getElementById('admin-edit-task-title').value.trim();
  const description = document.getElementById('admin-edit-task-desc').value.trim();
  const assignedTo = document.getElementById('admin-edit-task-assignee').value;

  if (!assignedTo) {
    showToast('נא לבחור בן משפחה לביצוע המשימה', 'warning');
    return;
  }
  const status = document.getElementById('admin-edit-task-status').value;
  const paymentType = document.getElementById('admin-edit-task-payment-type').value;
  const rewardInput = document.getElementById('admin-edit-task-reward').value;
  const reward = paymentType === 'paid' && rewardInput ? parseFloat(rewardInput) : 0;
  
  const starsInput = document.getElementById('admin-edit-task-reward-stars').value;
  const stars = paymentType === 'volunteer' && starsInput ? parseInt(starsInput) : 0;
  
  const isRecurring = document.getElementById('admin-edit-task-is-recurring').checked;
  const hasReminder = document.getElementById('admin-edit-task-has-reminder').checked;
  
  let dayOfWeek = null;
  let dueDate = '';
  let time = '09:00';
  let reminderDateTime = null;
  
  if (isRecurring) {
    const recHour = document.getElementById('admin-edit-task-recurring-hour').value || '09';
    const recMin = document.getElementById('admin-edit-task-recurring-minute').value || '00';
    time = `${recHour}:${recMin}`;
    dayOfWeek = parseInt(document.getElementById('admin-edit-task-weekly-day').value);
  }
  
  if (hasReminder) {
    const remDate = document.getElementById('admin-edit-task-reminder-date').value;
    const remHour = document.getElementById('admin-edit-task-reminder-hour').value || '12';
    const remMin = document.getElementById('admin-edit-task-reminder-minute').value || '00';
    
    if (remDate) {
      reminderDateTime = `${remDate}T${remHour}:${remMin}`;
      dueDate = remDate;
      if (!isRecurring) {
        time = `${remHour}:${remMin}`;
      }
    } else {
      reminderDateTime = null;
      dueDate = '';
      if (!isRecurring) time = '';
    }
  } else if (!isRecurring) {
    dueDate = '';
    time = '';
  }

  const task = state.tasks.find(t => t.id === id);
  if (task) {
    const oldStatus = task.status;
    
    task.title = title;
    task.description = description;
    task.assignedTo = assignedTo;
    task.type = isRecurring ? 'recurring' : 'one-off';
    task.recurrence = isRecurring ? 'weekly' : null;
    task.reward = reward;
    task.stars = stars;
    task.dueDate = dueDate;
    task.time = time;
    task.dayOfWeek = dayOfWeek;
    task.hasReminder = hasReminder;
    task.reminderDateTime = reminderDateTime;
    task.status = status;

    const promises = [];
    let userToUpdate = null;

    if (status === 'completed' && oldStatus !== 'completed') {
      const todayStr = formatDateString(new Date());
      task.completedBy = state.currentUser.id;
      task.completedDate = todayStr;

      const historyId = `${state.groupId}-hist-${Date.now()}`;
      promises.push(db.collection('history').doc(historyId).set({
        id: historyId,
        groupId: state.groupId,
        taskId: id,
        title: title,
        action: 'completed',
        reward: reward,
        stars: stars,
        completedBy: assignedTo !== 'all' ? assignedTo : state.currentUser.id,
        completedDate: todayStr,
        timestamp: new Date().toISOString()
      }));

      if (reward > 0) {
        const creditUser = assignedTo !== 'all' ? assignedTo : state.currentUser.id;
        userToUpdate = state.users.find(u => u.id === creditUser);
        if (userToUpdate) {
          userToUpdate.balance += reward;
          if (state.currentUser.id === creditUser) {
            state.currentUser.balance = userToUpdate.balance;
          }
        }
      } else if (stars > 0) {
        const creditUser = assignedTo !== 'all' ? assignedTo : state.currentUser.id;
        userToUpdate = state.users.find(u => u.id === creditUser);
        if (userToUpdate) {
          userToUpdate.stars = (userToUpdate.stars || 0) + stars;
          if (state.currentUser.id === creditUser) {
            state.currentUser.stars = userToUpdate.stars;
          }
        }
      }
    } else if (status !== 'completed' && oldStatus === 'completed') {
      task.completedBy = null;
      task.completedDate = null;
    }

    promises.push(db.collection('tasks').doc(id).set(task));
    if (userToUpdate) {
      promises.push(db.collection('users').doc(userToUpdate.id).set(userToUpdate));
    }

    try {
      await Promise.all(promises);
    } catch (err) {
      console.error("Firebase saveTaskEdit failed:", err);
    }

    saveState();
    elEditTaskOverlay.classList.remove('active');
    
    localStorage.setItem('household_pending_toast', JSON.stringify({
      message: `המשימה "${title}" עודכנה בהצלחה!`,
      type: 'success'
    }));
    window.location.reload();
  }
}

async function deleteTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const confirmDelete = confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`);
  if (!confirmDelete) return;
  
  const historyId = `${state.groupId}-hist-${Date.now()}`;
  try {
    await db.collection('tasks').doc(taskId).delete();
    await db.collection('history').doc(historyId).set({
      id: historyId,
      groupId: state.groupId,
      taskId: taskId,
      title: task.title,
      action: 'deleted',
      reward: 0,
      completedBy: state.currentUser.id,
      completedDate: formatDateString(new Date()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Firebase deleteTask failed:", err);
  }
  
  saveState();
  elEditTaskOverlay.classList.remove('active');
  
  localStorage.setItem('household_pending_toast', JSON.stringify({
    message: 'המשימה נמחקה בהצלחה!',
    type: 'success'
  }));
  window.location.reload();
}

// Task sorting drag and drop logic
window.dragTask = function(event, taskId) {
  event.dataTransfer.setData('text/plain', taskId);
  event.currentTarget.classList.add('dragging');
};

window.dragEndTask = function(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.task-card').forEach(card => card.classList.remove('drag-over'));
};

window.dragOverTaskCard = function(event, taskId) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
};

window.dragLeaveTaskCard = function(event, taskId) {
  event.currentTarget.classList.remove('drag-over');
};

window.dropTaskOnCard = async function(event, targetTaskId) {
  event.preventDefault();
  event.stopPropagation();
  
  const draggedTaskId = event.dataTransfer.getData('text/plain');
  if (!draggedTaskId || draggedTaskId === targetTaskId) return;
  
  const fromIndex = state.tasks.findIndex(t => t.id === draggedTaskId);
  const toIndex = state.tasks.findIndex(t => t.id === targetTaskId);
  
  if (fromIndex === -1 || toIndex === -1) return;
  
  const [movedTask] = state.tasks.splice(fromIndex, 1);
  state.tasks.splice(toIndex, 0, movedTask);
  
  // Update order properties based on new array indices
  const promises = state.tasks.map((t, idx) => {
    t.order = idx;
    t.groupId = state.groupId;
    return db.collection('tasks').doc(t.id).set(t);
  });
  
  try {
    await Promise.all(promises);
  } catch (err) {
    console.error("Firebase dropTaskOnCard failed:", err);
  }
  
  saveState();
  renderTasks();
  
  showToast('סדר המשימות עודכן בהצלחה!', 'success');
};

function initStarRatingSelectors() {
  setupStarRating('create-star-rating', 'admin-reward-stars');
  setupStarRating('edit-star-rating', 'admin-edit-task-reward-stars');
}

function setupStarRating(containerId, hiddenInputId) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!container || !hiddenInput) return;

  const stars = container.querySelectorAll('span');
  
  const updateStars = (val) => {
    stars.forEach(star => {
      const starVal = parseInt(star.getAttribute('data-value'));
      if (starVal <= val) {
        star.textContent = '⭐';
      } else {
        star.textContent = '☆';
      }
    });
  };

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'));
      hiddenInput.value = val;
      updateStars(val);
    });

    star.addEventListener('mouseover', () => {
      const val = parseInt(star.getAttribute('data-value'));
      updateStars(val);
    });
  });

  container.addEventListener('mouseleave', () => {
    const currentVal = parseInt(hiddenInput.value) || 1;
    updateStars(currentVal);
  });
}

window.setStarRatingValue = function(containerId, hiddenInputId, val) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (container && hiddenInput) {
    hiddenInput.value = val;
    const stars = container.querySelectorAll('span');
    stars.forEach(star => {
      const starVal = parseInt(star.getAttribute('data-value'));
      if (starVal <= val) {
        star.textContent = '⭐';
      } else {
        star.textContent = '☆';
      }
    });
  }
};

function initThemeSelector() {
  const savedTheme = localStorage.getItem('household_color_theme') || 'midnight';
  applyTheme(savedTheme);

  const themeDots = document.querySelectorAll('.theme-dot');
  themeDots.forEach(dot => {
    // Highlight active dot
    if (dot.getAttribute('data-theme') === savedTheme) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }

    dot.addEventListener('click', () => {
      const themeName = dot.getAttribute('data-theme');
      localStorage.setItem('household_color_theme', themeName);
      applyTheme(themeName);

      // Update active state of dots
      themeDots.forEach(d => {
        if (d.getAttribute('data-theme') === themeName) {
          d.classList.add('active');
        } else {
          d.classList.remove('active');
        }
      });
    });
  });
}

function applyTheme(themeName) {
  // Remove all theme classes first
  document.body.classList.remove('theme-midnight', 'theme-emerald', 'theme-ocean', 'theme-sunset', 'theme-cyberpunk');
  // Add selected theme class
  document.body.classList.add(`theme-${themeName}`);
}

// Start application
window.onload = initApp;
