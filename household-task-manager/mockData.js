// Mock data for the Household Task Manager
// Exposed globally via window.householdMockData to allow loading file:// directly without CORS issues.

window.householdMockData = {
  users: [
    { id: 'user-mom', name: 'אמא', role: 'admin', avatar: '👩‍🦰', color: '#ec4899', balance: 0, stars: 0 },
    { id: 'user-dad', name: 'אבא', role: 'admin', avatar: '👨‍🦱', color: '#3b82f6', balance: 0, stars: 0 },
    { id: 'user-emma', name: 'אמה', role: 'member', avatar: '👧', color: '#10b981', balance: 45, stars: 12 },
    { id: 'user-liam', name: 'ליאם', role: 'member', avatar: '👦', color: '#f59e0b', balance: 20, stars: 5 }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'לתכנן את התפריט השבועי (דוגמה)',
      description: 'לבחור ארוחות לכל השבוע ולהכין רשימת קניות מרוכזת.',
      assignedTo: 'user-mom',
      type: 'recurring',
      recurrence: 'weekly',
      reward: 0,
      stars: 2,
      dueDate: '',
      dayOfWeek: 0, // Sunday
      status: 'pending',
      completedBy: null,
      completedDate: null
    },
    {
      id: 'task-2',
      title: 'לשטוף את הרכב המשפחתי (דוגמה)',
      description: 'שטיפה יסודית של הרכב מבחוץ ומבפנים, כולל שאיבת אבק.',
      assignedTo: 'user-dad',
      type: 'one-off',
      recurrence: null,
      reward: 35,
      stars: 0,
      dueDate: '',
      dayOfWeek: null,
      status: 'pending',
      completedBy: null,
      completedDate: null
    },
    {
      id: 'task-3',
      title: 'לסדר את החדר (דוגמה)',
      description: 'לסדר צעצועים, לסדר את המיטה ולשאוב אבק מהשטיח.',
      assignedTo: 'user-emma',
      type: 'recurring',
      recurrence: 'weekly',
      reward: 0,
      stars: 2,
      dueDate: '',
      dayOfWeek: 5, // Friday
      status: 'pending',
      completedBy: null,
      completedDate: null
    },
    {
      id: 'task-4',
      title: 'להוריד את הכלב לטיול (דוגמה)',
      description: 'טיול של 15 דקות לפחות בשעות אחר הצהריים.',
      assignedTo: 'user-liam',
      type: 'recurring',
      recurrence: 'daily',
      reward: 10,
      stars: 0,
      dayOfWeek: null,
      status: 'pending',
      completedBy: null,
      completedDate: null
    }
  ],
  history: [
    {
      id: 'hist-1',
      title: 'לזרוק את הזבל',
      reward: 5,
      completedBy: 'user-liam',
      completedDate: '2026-06-03'
    },
    {
      id: 'hist-2',
      title: 'לנקות אבק בסלון',
      reward: 15,
      completedBy: 'user-emma',
      completedDate: '2026-06-03'
    },
    {
      id: 'hist-3',
      title: 'להוריד את הכלב לטיול',
      reward: 10,
      completedBy: 'user-emma',
      completedDate: '2026-06-04'
    },
    {
      id: 'hist-4',
      title: 'לשטוף כלים',
      reward: 5,
      completedBy: 'user-liam',
      completedDate: '2026-06-04'
    }
  ]
};
