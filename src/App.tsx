import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HomeView 
} from './components/HomeView';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  MasterTrackerView 
} from './components/MasterTrackerView';
import { 
  TimelineView 
} from './components/TimelineView';
import { 
  CalendarView 
} from './components/CalendarView';
import { 
  ActionTrackerView 
} from './components/ActionTrackerView';
import { 
  StageTrackerView 
} from './components/StageTrackerView';
import { 
  ImportantReferencesView 
} from './components/ImportantReferencesView';
import { 
  AIAdvisorModal 
} from './components/AIAdvisorModal';
import { 
  ExamModal 
} from './components/ExamModal';
import { 
  ExamDetailDrawer 
} from './components/ExamDetailDrawer';
import { 
  CompleteExamModal 
} from './components/CompleteExamModal';
import { 
  DataBackupModal 
} from './components/DataBackupModal';
import { 
  FirebaseSyncModal 
} from './components/FirebaseSyncModal';
import { 
  UserProfileModal 
} from './components/UserProfileModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  AuthLandingGate 
} from './components/AuthLandingGate';
import { 
  FirestoreRulesModal 
} from './components/FirestoreRulesModal';
import { 
  INITIAL_EXAMS, 
  INITIAL_MILESTONES, 
  INITIAL_REFERENCES 
} from './data/initialData';
import { 
  ExamItem, 
  MilestoneAction, 
  ImportantReference, 
  ActiveTab,
  UserProfile 
} from './types';
import { 
  exportExamsToCsv, 
  exportAllDataToJson,
  exportCategorizedJson,
  exportExamsOnlyToJson, 
  parseAndValidateExamJson 
} from './utils/exportUtils';
import { User } from 'firebase/auth';
import { 
  loginWithGoogle, 
  loginAsGuest, 
  logoutUser, 
  subscribeToAuth,
  updateUserProfileInAuth 
} from './firebase/authService';
import { 
  saveUserTrackerData, 
  fetchUserTrackerData,
  saveUserProfile,
  fetchUserProfile,
  importJsonDirectlyToFirestore, 
  clearUserTrackerData,
  testConnection 
} from './firebase/firestoreService';
import { initAnalytics, firebaseConfig } from './firebase/config';

// Helper to get storage keys for an active user
const getUserExamStorageKey = (uid: string | null) => uid ? `exams_user_${uid}` : 'exams_user_guest';
const getUserMilestonesStorageKey = (uid: string | null) => uid ? `milestones_user_${uid}` : 'milestones_user_guest';

export default function App() {
  // Current Firebase Auth user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Per-user isolated exams and milestones (empty array by default - NO public data)
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneAction[]>([]);
  const [references] = useState<ImportantReference[]>(INITIAL_REFERENCES);

  // Active view tab (Home is default front door)
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Cloud sync state
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [firestorePermissionDenied, setFirestorePermissionDenied] = useState(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('exams_last_synced_at') || null;
  });

  // Modals & Drawers state
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<ExamItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExamContext, setAiExamContext] = useState<ExamItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [examToComplete, setExamToComplete] = useState<ExamItem | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const prevUidRef = useRef<string | null>(null);
  const loadedUidRef = useRef<string | null>(null);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize analytics & test connection
  useEffect(() => {
    initAnalytics();
    testConnection();
  }, []);

  // PER-USER DATA ISOLATION EFFECT
  // Triggered when authentication status changes (login / switch user / logout)
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      const activeUid = user ? user.uid : null;

      // If user logged out: zero public data, purge memory
      if (!user) {
        loadedUidRef.current = null;
        prevUidRef.current = null;
        setCurrentUser(null);
        setUserProfile(null);
        setExams([]);
        setMilestones([]);
        setIsAuthChecking(false);
        return;
      }

      // If UID changed, immediately wipe memory state from previous account
      if (prevUidRef.current !== activeUid) {
        setExams([]);
        setMilestones([]);
        loadedUidRef.current = null;
      }
      prevUidRef.current = activeUid;
      setCurrentUser(user);

      // Authenticated User Context - Load private data
      const userExamKey = getUserExamStorageKey(user.uid);
      const userMilestoneKey = getUserMilestonesStorageKey(user.uid);

      // 1. Fetch user profile from Firestore
      const profileRes = await fetchUserProfile(user.uid);
      let profile = profileRes.profile;
      if (profileRes.permissionDenied) {
        setFirestorePermissionDenied(true);
      }

      if (!profile) {
        // Check local profile cache first
        const localProfileStr = localStorage.getItem('profile_user_' + user.uid);
        if (localProfileStr) {
          try { profile = JSON.parse(localProfileStr); } catch {}
        }

        if (!profile) {
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Candidate',
            targetCategory: 'Computer Science & IT',
            targetExamYear: '2026–2027',
            bio: 'Tracking competitive recruitment exams and preparation milestones.',
            createdAt: new Date().toISOString(),
            preferences: {
              autoSyncCloud: true,
              notifyUpcomingDeadlines: true,
              defaultView: 'home',
              targetCategory: 'Computer Science & IT',
              targetExamYear: '2026–2027',
            },
          };
        }

        if (!profileRes.permissionDenied) {
          saveUserProfile(user.uid, profile).catch(() => {});
        }
      }
      setUserProfile(profile);
      localStorage.setItem('profile_user_' + user.uid, JSON.stringify(profile));

      // 2. Fetch user's distinct exams and milestones from Cloud Firestore
      const cloudData = await fetchUserTrackerData(user.uid);
      if (cloudData.permissionDenied) {
        setFirestorePermissionDenied(true);
      }

      if (cloudData.success && Array.isArray(cloudData.exams)) {
        // User has explicit cloud records (0 or more)
        setExams(cloudData.exams);
        setMilestones(cloudData.milestones || []);
        localStorage.setItem(userExamKey, JSON.stringify(cloudData.exams));
        if (cloudData.milestones) {
          localStorage.setItem(userMilestoneKey, JSON.stringify(cloudData.milestones));
        }
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncedAt(nowStr);
      } else {
        // BRAND NEW ACCOUNT OR UNINITIALIZED ACCOUNT:
        // Always start 100% clean with 0 exams!
        // Never auto-populate another user's exams or json data!
        setExams([]);
        setMilestones([]);
        localStorage.setItem(userExamKey, JSON.stringify([]));
        localStorage.setItem(userMilestoneKey, JSON.stringify([]));
        
        if (!cloudData.permissionDenied) {
          saveUserTrackerData(user.uid, [], [], profile).catch(() => {});
          const nowStr = new Date().toLocaleTimeString();
          setLastSyncedAt(nowStr);
        }
      }

      loadedUidRef.current = user.uid;
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Save changes to current user's local storage and optionally auto-sync to Firestore
  // CRITICAL SECURITY: Only runs when user is authenticated AND data has loaded for this exact UID
  useEffect(() => {
    if (!currentUser || loadedUidRef.current !== currentUser.uid) {
      return;
    }

    const examKey = getUserExamStorageKey(currentUser.uid);
    localStorage.setItem(examKey, JSON.stringify(exams));

    // Only auto-sync if user is authenticated, autoSync is enabled, AND permissions are not denied
    if (!firestorePermissionDenied && userProfile?.preferences?.autoSyncCloud !== false) {
      const timer = setTimeout(() => {
        saveUserTrackerData(currentUser.uid, exams, milestones).catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [exams, currentUser, userProfile, firestorePermissionDenied]);

  useEffect(() => {
    if (!currentUser || loadedUidRef.current !== currentUser.uid) {
      return;
    }
    const milestoneKey = getUserMilestonesStorageKey(currentUser.uid);
    localStorage.setItem(milestoneKey, JSON.stringify(milestones));
  }, [milestones, currentUser]);

  useEffect(() => {
    if (lastSyncedAt) {
      localStorage.setItem('exams_last_synced_at', lastSyncedAt);
    }
  }, [lastSyncedAt]);

  // Handler to explicitly load the clean 2026 recruitment catalog into the user's workspace on demand
  const handleLoadTemplateCatalog = async () => {
    if (!currentUser) return;
    if (exams.length > 0) {
      const confirmLoad = window.confirm(
        'Loading the 2026 catalog will add the standard 31 recruitment notifications (Banking, ISRO, GATE, PSU Cadres) to your workspace. Continue?'
      );
      if (!confirmLoad) return;
    }
    setExams(INITIAL_EXAMS);
    setMilestones(INITIAL_MILESTONES);
    const userExamKey = getUserExamStorageKey(currentUser.uid);
    const userMilestoneKey = getUserMilestonesStorageKey(currentUser.uid);
    localStorage.setItem(userExamKey, JSON.stringify(INITIAL_EXAMS));
    localStorage.setItem(userMilestoneKey, JSON.stringify(INITIAL_MILESTONES));
    if (!firestorePermissionDenied) {
      await saveUserTrackerData(currentUser.uid, INITIAL_EXAMS, INITIAL_MILESTONES, userProfile || undefined);
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedAt(nowStr);
    }
    showToast('Clean 2026 Recruitment Catalog loaded into your workspace!');
  };

  // Exam CRUD Handlers (Operates on the active user's isolated workspace)
  const handleSaveExam = (exam: ExamItem) => {
    setExams((prev) => {
      const exists = prev.some((e) => e.id === exam.id);
      if (exists) {
        return prev.map((e) => (e.id === exam.id ? exam : e));
      } else {
        return [exam, ...prev];
      }
    });

    if (selectedExam && selectedExam.id === exam.id) {
      setSelectedExam(exam);
    }
    showToast(`Saved details for ${exam.examName}`);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    if (selectedExam?.id === id) {
      setSelectedExam(null);
    }
    showToast('Exam removed from your list');
  };

  const handleUpdateExam = (updated: ExamItem) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedExam && selectedExam.id === updated.id) {
      setSelectedExam(updated);
    }
  };

  // Milestone Handlers
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = (newMilestone: MilestoneAction) => {
    setMilestones((prev) => [newMilestone, ...prev]);
    showToast('New action milestone added to your list');
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast('Milestone removed');
  };

  // Profile Save Handler
  const handleSaveUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!currentUser) {
      // Local profile update
      setUserProfile((prev) => prev ? { ...prev, ...profileUpdates } : {
        uid: 'local',
        email: '',
        displayName: profileUpdates.displayName || 'Candidate',
        ...profileUpdates
      } as UserProfile);
      return;
    }

    const updatedProfile: UserProfile = {
      ...(userProfile || {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Candidate',
      }),
      ...profileUpdates,
      uid: currentUser.uid,
    };

    setUserProfile(updatedProfile);

    // Update Firebase Auth profile
    if (profileUpdates.displayName) {
      await updateUserProfileInAuth(profileUpdates.displayName);
    }

    // Persist to Cloud Firestore
    const res = await saveUserProfile(currentUser.uid, updatedProfile);
    if (res.permissionDenied) {
      setFirestorePermissionDenied(true);
    }
  };

  // Clean & Wipe current user's workspace to 0 exams
  const handleClearWorkspace = async () => {
    if (!currentUser) return;
    const ok = window.confirm(
      'Are you sure you want to clean and wipe all exams from your workspace? Your list will be reset to 0 exams.'
    );
    if (!ok) return;

    setExams([]);
    setMilestones([]);
    const userExamKey = getUserExamStorageKey(currentUser.uid);
    const userMilestoneKey = getUserMilestonesStorageKey(currentUser.uid);
    localStorage.setItem(userExamKey, JSON.stringify([]));
    localStorage.setItem(userMilestoneKey, JSON.stringify([]));

    if (!firestorePermissionDenied) {
      await clearUserTrackerData(currentUser.uid);
      const nowStr = new Date().toLocaleTimeString();
      setLastSyncedAt(nowStr);
    }
    showToast('Workspace cleaned successfully! 0 exams tracked.');
  };

  // Reset current user's workspace
  const handleResetUserData = () => {
    handleClearWorkspace();
  };

  // Backup & Export Handlers
  const handleExportCsv = () => {
    exportExamsToCsv(exams);
    showToast('Exported your exams to CSV');
  };

  const handleExportJson = () => {
    exportCategorizedJson(exams);
    showToast(`Exported ${exams.length} exams in 4-category JSON`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateExamJson(content);
      if (res.success && res.exams) {
        setExams(res.exams);
        if (res.milestones && res.milestones.length > 0) {
          setMilestones(res.milestones);
        }
        showToast(`Successfully imported ${res.exams.length} exams into your account`);
      } else {
        showToast(res.error || 'Invalid JSON format in file');
      }
    };
    reader.onerror = () => {
      showToast('Error reading uploaded JSON file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDirectImportData = (newExams: ExamItem[], newMilestones?: MilestoneAction[]) => {
    setExams(newExams);
    if (newMilestones && newMilestones.length > 0) {
      setMilestones(newMilestones);
    }
  };

  const handleOpenAiForExam = (exam: ExamItem) => {
    setAiExamContext(exam);
    setIsAiModalOpen(true);
  };

  // Firebase integration handlers
  const handleMoveDataToFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      let uid = currentUser?.uid;
      if (!uid) {
        try {
          const guestUser = await loginAsGuest();
          uid = guestUser.uid;
        } catch {
          uid = 'guest-device';
        }
      }

      const res = await saveUserTrackerData(uid, exams, milestones, userProfile || undefined);
      if (res.success) {
        setFirestorePermissionDenied(false);
        const nowStr = new Date().toLocaleTimeString();
        setLastSyncedAt(nowStr);
        showToast(`Moved ${exams.length} exams & ${milestones.length} milestones to Cloud Firestore!`);
      } else {
        if (res.permissionDenied) {
          setFirestorePermissionDenied(true);
          setIsRulesModalOpen(true);
        }
        showToast(res.message || 'Failed to move data to Firestore.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error syncing with Firestore');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleUploadJsonToFirebase = async (file: File) => {
    setIsSyncingFirebase(true);
    try {
      let uid = currentUser?.uid;
      if (!uid) {
        try {
          const guestUser = await loginAsGuest();
          uid = guestUser.uid;
        } catch {
          uid = 'guest-device';
        }
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        const res = await importJsonDirectlyToFirestore(uid!, content);
        setIsSyncingFirebase(false);

        if (res.success && res.exams) {
          setFirestorePermissionDenied(false);
          setExams(res.exams);
          if (res.milestones && res.milestones.length > 0) {
            setMilestones(res.milestones);
          }
          const nowStr = new Date().toLocaleTimeString();
          setLastSyncedAt(nowStr);
          showToast(`Imported ${res.count} exams directly into Cloud Firestore & workspace!`);
        } else {
          if (res.permissionDenied) {
            setFirestorePermissionDenied(true);
            setIsRulesModalOpen(true);
          }
          showToast(res.error || 'Failed to import JSON to Firestore');
        }
      };
      reader.onerror = () => {
        setIsSyncingFirebase(false);
        showToast('Error reading uploaded JSON file');
      };
      reader.readAsText(file);
    } catch (err: any) {
      setIsSyncingFirebase(false);
      showToast(err.message || 'Upload error');
    }
  };

  const handleRulesVerified = () => {
    setFirestorePermissionDenied(false);
    setIsRulesModalOpen(false);
    handleMoveDataToFirebase();
  };

  const handleQuickGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Signed in as ${user.displayName || user.email}`);
    } catch (err: any) {
      showToast(err.message || 'Google sign-in error');
    }
  };

  const handleQuickGuestSignIn = async () => {
    try {
      await loginAsGuest();
      showToast('Logged in as Guest user');
    } catch (err: any) {
      showToast(err.message || 'Guest sign-in error');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      loadedUidRef.current = null;
      prevUidRef.current = null;
      setCurrentUser(null);
      setUserProfile(null);
      setExams([]);
      setMilestones([]);
      showToast('Signed out. Your private workspace is locked.');
    } catch (err: any) {
      showToast(err.message || 'Sign out error');
    }
  };

  // 1. Initial Authentication Check State
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans selection:bg-indigo-600">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-sm text-slate-200 tracking-wider uppercase">
            Verifying Candidate Clearance
          </h3>
          <p className="text-xs font-mono text-slate-400">Loading private recruitment workspace...</p>
        </div>
      </div>
    );
  }

  // 2. PUBLIC GATE: If not authenticated, render the high-security portal gate.
  // ZERO private exam data, candidate details, scorecards, or fees are exposed to public view.
  if (!currentUser) {
    return (
      <AuthLandingGate
        onAuthenticated={() => {}}
        onToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Cloud Firestore Security Rules Alert Banner */}
      {firestorePermissionDenied && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-amber-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
            <span>
              <strong>Action Needed:</strong> Firebase project <code className="font-mono bg-black/20 px-1 py-0.5 rounded font-bold">{firebaseConfig.projectId || 'Active Project'}</code> requires security rules to be published in your Firebase Console. Your workspace is currently saved locally.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-900 font-bold rounded-lg transition-colors cursor-pointer shadow-xs text-[11px]"
            >
              View & Copy Rules
            </button>
            <button
              onClick={() => setFirestorePermissionDenied(false)}
              className="text-white hover:text-amber-200 px-1 cursor-pointer font-bold"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'aiAdvisor') {
            setAiExamContext(null);
            setIsAiModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        exams={exams}
        onAddNewExam={() => {
          setExamToEdit(null);
          setIsExamModalOpen(true);
        }}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onResetData={handleResetUserData}
        onOpenAiAdvisor={() => {
          setAiExamContext(null);
          setIsAiModalOpen(true);
        }}
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        lastSyncedAt={lastSyncedAt}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeView
            exams={exams}
            milestones={milestones}
            setActiveTab={setActiveTab}
            onSelectExam={setSelectedExam}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
            onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onAddNewExam={() => {
              setExamToEdit(null);
              setIsExamModalOpen(true);
            }}
            currentUser={currentUser}
            userProfile={userProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            lastSyncedAt={lastSyncedAt}
            onMoveDataToFirebase={handleMoveDataToFirebase}
            onUploadJsonToFirebase={handleUploadJsonToFirebase}
            isSyncingFirebase={isSyncingFirebase}
            onQuickGoogleSignIn={handleQuickGoogleSignIn}
            onQuickGuestSignIn={handleQuickGuestSignIn}
            onSignOut={handleSignOut}
            onToast={showToast}
            onLoadTemplateCatalog={handleLoadTemplateCatalog}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            exams={exams}
            milestones={milestones}
            onSelectExam={setSelectedExam}
            setActiveTab={setActiveTab}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'master' && (
          <MasterTrackerView
            exams={exams}
            onSelectExam={setSelectedExam}
            onEditExam={(exam) => {
              setExamToEdit(exam);
              setIsExamModalOpen(true);
            }}
            onDeleteExam={handleDeleteExam}
            onAddNewExam={() => {
              setExamToEdit(null);
              setIsExamModalOpen(true);
            }}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
            onLoadTemplateCatalog={handleLoadTemplateCatalog}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            exams={exams}
            onSelectExam={setSelectedExam}
            onOpenAiAdvisorForExam={handleOpenAiForExam}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            exams={exams}
            milestones={milestones}
            onSelectExam={setSelectedExam}
          />
        )}

        {activeTab === 'actions' && (
          <ActionTrackerView
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}

        {activeTab === 'stageTracker' && (
          <StageTrackerView
            exams={exams}
            onUpdateExam={handleUpdateExam}
            onSelectExam={setSelectedExam}
            onOpenCompleteModal={(exam) => {
              setExamToComplete(exam);
              setIsCompleteModalOpen(true);
            }}
          />
        )}

        {activeTab === 'references' && (
          <ImportantReferencesView
            references={references}
            exams={exams}
            onSelectExam={setSelectedExam}
            onOpenAiAdvisor={() => {
              setAiExamContext(null);
              setIsAiModalOpen(true);
            }}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        onSignOut={handleSignOut}
        onOpenAuthModal={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onResetUserData={handleClearWorkspace}
        onClearWorkspace={handleClearWorkspace}
        onLoadTemplateCatalog={handleLoadTemplateCatalog}
        exams={exams}
        milestones={milestones}
        lastSyncedAt={lastSyncedAt}
        onToast={showToast}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onToast={showToast}
      />

      {/* Exam Detail Drawer */}
      <ExamDetailDrawer
        exam={selectedExam}
        onClose={() => setSelectedExam(null)}
        onEdit={(exam) => {
          setSelectedExam(null);
          setExamToEdit(exam);
          setIsExamModalOpen(true);
        }}
        onDelete={handleDeleteExam}
        onOpenAiAdvisor={handleOpenAiForExam}
        onUpdateExam={handleUpdateExam}
        onOpenCompleteModal={(exam) => {
          setExamToComplete(exam);
          setIsCompleteModalOpen(true);
        }}
      />

      {/* Complete Exam Modal */}
      <CompleteExamModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setExamToComplete(null);
        }}
        exam={examToComplete}
        onSaveCompletion={(updated) => {
          handleUpdateExam(updated);
          showToast(`Exam outcome logged for ${updated.examName}`);
        }}
        onSave={(updated) => {
          handleUpdateExam(updated);
          showToast(`Exam outcome logged for ${updated.examName}`);
        }}
      />

      {/* Add / Edit Exam Modal */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setExamToEdit(null);
        }}
        onSave={handleSaveExam}
        examToEdit={examToEdit}
      />

      {/* AI Strategist Modal */}
      <AIAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiExamContext(null);
        }}
        selectedExam={aiExamContext}
        exams={exams}
      />

      {/* Data Backup & JSON Management Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        exams={exams}
        milestones={milestones}
        onImportData={handleDirectImportData}
        onResetData={handleResetUserData}
        onToast={showToast}
      />

      {/* Firebase Firestore Sync Modal */}
      <FirebaseSyncModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        currentUser={currentUser}
        exams={exams}
        milestones={milestones}
        onDataLoadedFromCloud={handleDirectImportData}
        onToast={showToast}
        lastSyncedAt={lastSyncedAt}
        setLastSyncedAt={setLastSyncedAt}
      />

      {/* Firestore Security Rules Helper Modal */}
      <FirestoreRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        currentUser={currentUser}
        onRulesVerified={handleRulesVerified}
        onToast={showToast}
      />
    </div>
  );
}
