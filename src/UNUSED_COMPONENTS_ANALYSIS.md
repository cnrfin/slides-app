# Unused Components Analysis

## 🗑️ Components That Can Be DELETED

### 1. **Definitely Unused Components**

#### Dashboard Components:
- **`DashboardLayout.tsx`** - Imported in AppRouter but NEVER USED (uses MinimalDashboardLayout instead)
- **`DashboardHome.tsx`** - Imported in AppRouter but NEVER USED (uses MinimalDashboardHome instead)

#### Addon Page Variants:
- **`AddonsPageComplex.tsx`** - Not imported anywhere
- **`AddonsPageSimple.tsx`** - Not imported anywhere

#### Template Components:
- **`TemplateDemo.tsx`** - Not imported in any main files
- **`TemplateDesigner.tsx`** - Not imported in any main files

#### Other Unused:
- **`DataKeyHelper.tsx`** - Not imported anywhere

### 2. **Backup/Old Files (Definitely Delete)**
```
components/canvas/TableCellEditor.tsx.backup
components/canvas/TextEditor.tsx.backup
components/ui/BlurTestButton.tsx.backup
components/ui/DragBar.old.tsx
config/blur.config.ts.backup
types/glur.d.ts.backup
utils/blur-performance-test.ts.backup
utils/glur-filter.ts.backup
api/auth/google-one-tap.example.ts
```

### 3. **Test Files in src (Should be in test folder)**
```
src/test-ai-generation-flow.js
src/test-prompt-tracking.js
```

## ⚠️ Components That Need Verification

### Potentially Unused (Need to check if imported elsewhere):

1. **`AuthButton.tsx`** - Not in AppRouter, check if used in other components
2. **`GoogleOneTap.tsx`** - Not in AppRouter, might be used elsewhere
3. **`SessionDebugger.tsx`** - Likely a debug component, check if needed
4. **`AuthGuard.tsx`** - Imported but might not be actively used (using ProtectedRoute instead)

## ✅ Components ACTIVELY IN USE

### Dashboard (Actually Used):
- MinimalDashboardLayout
- MinimalDashboardHome
- Sidebar (in dashboard folder)
- HistorySidebar
- LessonsPage
- StudentsPage
- SettingsPage
- BillingPage
- CoursesPage
- AnalyticsPage
- TutorialsPage
- AddonsPage (the main one, not Complex/Simple variants)

### Auth Components:
- LoginPage
- AuthCallback
- GoogleDriveCallback
- UserMenu

## 📊 Summary Statistics

- **15+ files** can be safely deleted
- **2 major unused components** (DashboardLayout, DashboardHome)
- **9+ backup files** taking up space
- **Potential savings**: ~500+ lines of code

## 🎯 Recommended Actions

1. **Immediate Deletions** (Safe):
   - All `.backup` files
   - All `.old` files
   - `DashboardLayout.tsx` and `DashboardHome.tsx`
   - `AddonsPageComplex.tsx` and `AddonsPageSimple.tsx`
   - Test files in src root

2. **After Verification**:
   - Check if AuthButton, GoogleOneTap are imported in any component
   - Remove TemplateDemo and TemplateDesigner if not needed

3. **Clean up imports**:
   - Remove unused imports from AppRouter.tsx (DashboardLayout, DashboardHome)

## 💡 Quick Cleanup Commands

```bash
# Remove backup files
rm src/components/canvas/*.backup
rm src/components/ui/*.backup
rm src/components/ui/*.old.tsx
rm src/config/*.backup
rm src/types/*.backup
rm src/utils/*.backup

# Remove unused dashboard components
rm src/components/dashboard/DashboardLayout.tsx
rm src/components/dashboard/DashboardHome.tsx

# Remove unused addon variants
rm src/components/dashboard/AddonsPageComplex.tsx
rm src/components/dashboard/AddonsPageSimple.tsx

# Move test files to proper location or delete
rm src/test-*.js
```
