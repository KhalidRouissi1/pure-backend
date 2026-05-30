# App Development Plan
### React Native Expo App

---

## Step 1 — Profile Section

Add a Profile Screen for each user role. Every profile includes viewing personal info, editing it, and logging out.

**Roles:** Admin, Manager, User

**Features:**
- Display avatar, full name, and role badge
- Show role-specific info fields
- Edit profile info (role-based fields)
- Some fields are visible but locked (e.g. role, ID)
- Save changes and sync with backend
- Logout with confirmation → clears session → redirects to Login
for 
**Screens needed:**
- Profile Router — detects role and loads the right screen
- Admin Profile Screen
- Manager Profile Screen
- User Profile Screen

**Components needed:**
- Profile Header — avatar, name, role badge
- Info Row — single labeled field
- Edit Info Modal — slide-up form for editing
- Logout Button — confirm then logout
