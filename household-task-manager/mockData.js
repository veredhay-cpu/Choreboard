// Mock data for the Household Task Manager
// Exposed globally via window.householdMockData to allow loading file:// directly without CORS issues.

window.householdMockData = {
  users: [
    { id: 'user-mom', name: 'אמא', role: 'admin', avatar: '👩‍🦰', color: '#ec4899', balance: 0, stars: 0 },
    { id: 'user-dad', name: 'אבא', role: 'admin', avatar: '👨‍🦱', color: '#3b82f6', balance: 0, stars: 0 },
    { id: 'user-kid1', name: 'ילד 1', role: 'member', avatar: '👦', color: '#10b981', balance: 0, stars: 0 },
    { id: 'user-kid2', name: 'ילד 2', role: 'member', avatar: '👧', color: '#f59e0b', balance: 0, stars: 0 }
  ],
  tasks: [],
  history: []
};
