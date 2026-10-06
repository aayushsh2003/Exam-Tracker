import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  getDocs, 
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import { ExamItem, MilestoneAction, UserProfile } from '../types';
import { parseAndValidateExamJson, buildCategorizedExamJson } from '../utils/exportUtils';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return code === 'permission-denied' || msg.toLowerCase().includes('permission');
}

/**
 * Tests connection to Firestore
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
      return false;
    }
    return true;
  }
}

/**
 * Quick permission test for a given user path
 */
export async function testUserPermissions(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'user_trackers', userId);
    await getDoc(userRef);
    return true;
  } catch (error) {
    if (isPermissionError(error)) {
      return false;
    }
    return true;
  }
}

export interface FirestoreTrackerPayload {
  userId: string;
  updatedAt: any;
  examsCount: number;
  milestonesCount: number;
  categorizedSummary: {
    completedAnnounced: number;
    completedAwaited: number;
    upcomingActive: number;
    awaitingDate: number;
  };
  exams: ExamItem[];
  milestones: MilestoneAction[];
  profile?: Partial<UserProfile>;
}

/**
 * Saves or updates user profile in Firestore
 */
export async function saveUserProfile(
  userId: string, 
  profile: Partial<UserProfile>
): Promise<{ success: boolean; message: string; permissionDenied?: boolean }> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profile,
      uid: userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Also cache within user tracker master document
    const trackerRef = doc(db, 'user_trackers', userId);
    await setDoc(trackerRef, {
      profile: {
        ...profile,
        uid: userId,
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true, message: 'Profile updated in Cloud Firestore.' };
  } catch (error: any) {
    const permDenied = isPermissionError(error);
    if (permDenied) {
      try {
        handleFirestoreError(error, OperationType.WRITE, path);
      } catch {}
    }
    return { 
      success: false, 
      permissionDenied: permDenied,
      message: error?.message || 'Failed to save profile to Firestore.' 
    };
  }
}

/**
 * Fetches user profile from Firestore
 */
export async function fetchUserProfile(userId: string): Promise<{
  profile: UserProfile | null;
  permissionDenied?: boolean;
}> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { profile: snap.data() as UserProfile };
    }

    // Try fallback from user tracker doc
    const trackerRef = doc(db, 'user_trackers', userId);
    const trackerSnap = await getDoc(trackerRef);
    if (trackerSnap.exists()) {
      const data = trackerSnap.data();
      if (data.profile) {
        return { profile: data.profile as UserProfile };
      }
    }
    return { profile: null };
  } catch (error: any) {
    const permDenied = isPermissionError(error);
    if (permDenied) {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {}
    }
    return { profile: null, permissionDenied: permDenied };
  }
}

/**
 * Moves & saves all user tracker records to Firestore under user document
 * and individual exam records in subcollection for granular Firestore queries.
 */
export async function saveUserTrackerData(
  userId: string,
  exams: ExamItem[],
  milestones: MilestoneAction[] = [],
  profile?: Partial<UserProfile>
): Promise<{ success: boolean; message: string; examsCount: number; permissionDenied?: boolean }> {
  const pathForSummary = `user_trackers/${userId}`;
  try {
    const categorized = buildCategorizedExamJson(exams);
    const summaryRef = doc(db, 'user_trackers', userId);

    const payload: FirestoreTrackerPayload = {
      userId,
      updatedAt: serverTimestamp(),
      examsCount: exams.length,
      milestonesCount: milestones.length,
      categorizedSummary: {
        completedAnnounced: categorized.completedAnnounced.length,
        completedAwaited: categorized.completedAwaited.length,
        upcomingActive: categorized.upcomingActive.length,
        awaitingDate: categorized.awaitingDate.length,
      },
      exams,
      milestones,
      ...(profile ? { profile } : {})
    };

    // Save master document cleanly (overwriting stale lists)
    await setDoc(summaryRef, payload);

    // Sync subcollection: delete old docs that no longer exist, update active docs
    const batch = writeBatch(db);
    const userExamsCol = collection(db, 'user_trackers', userId, 'exams');
    const existingSnap = await getDocs(userExamsCol);
    const currentExamIds = new Set(exams.map(e => String(e.id)));

    existingSnap.forEach((docSnap) => {
      if (!currentExamIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    exams.forEach((exam) => {
      const examDocRef = doc(userExamsCol, String(exam.id));
      batch.set(examDocRef, {
        ...exam,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();

    return {
      success: true,
      message: `Successfully synchronized ${exams.length} examinations and ${milestones.length} milestones to Cloud Firestore.`,
      examsCount: exams.length,
    };
  } catch (error: any) {
    const permDenied = isPermissionError(error);
    if (permDenied) {
      try {
        handleFirestoreError(error, OperationType.WRITE, pathForSummary);
      } catch {}
    }
    return {
      success: false,
      permissionDenied: permDenied,
      message: error?.message || 'Failed to move tracker data to Firestore.',
      examsCount: 0,
    };
  }
}

/**
 * Completely purges and clears a user's cloud records (master doc + subcollection)
 */
export async function clearUserTrackerData(userId: string): Promise<boolean> {
  try {
    const summaryRef = doc(db, 'user_trackers', userId);
    await setDoc(summaryRef, {
      userId,
      updatedAt: serverTimestamp(),
      examsCount: 0,
      milestonesCount: 0,
      categorizedSummary: {
        completedAnnounced: 0,
        completedAwaited: 0,
        upcomingActive: 0,
        awaitingDate: 0,
      },
      exams: [],
      milestones: [],
    });

    const userExamsCol = collection(db, 'user_trackers', userId, 'exams');
    const existingSnap = await getDocs(userExamsCol);
    const batch = writeBatch(db);
    existingSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    return true;
  } catch (e) {
    console.error('Error clearing tracker data:', e);
    return false;
  }
}

/**
 * Loads exam tracker data from Firestore for a given user.
 */
export async function fetchUserTrackerData(userId: string): Promise<{
  success: boolean;
  exams?: ExamItem[];
  milestones?: MilestoneAction[];
  profile?: UserProfile;
  permissionDenied?: boolean;
  error?: string;
}> {
  const path = `user_trackers/${userId}`;
  try {
    const summaryRef = doc(db, 'user_trackers', userId);
    const snap = await getDoc(summaryRef);

    if (snap.exists()) {
      const data = snap.data() as FirestoreTrackerPayload;
      return {
        success: true,
        exams: Array.isArray(data.exams) ? data.exams : [],
        milestones: Array.isArray(data.milestones) ? data.milestones : [],
        profile: data.profile as UserProfile | undefined,
      };
    }

    return {
      success: false,
      error: 'No cloud tracker records found for this account yet.',
    };
  } catch (error: any) {
    const permDenied = isPermissionError(error);
    if (permDenied) {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {}
    }
    return {
      success: false,
      permissionDenied: permDenied,
      error: error?.message || 'Error fetching data from Firestore.',
    };
  }
}

/**
 * Deletes a single exam from the user's Firestore subcollection
 */
export async function deleteUserExamFromFirestore(userId: string, examId: string): Promise<boolean> {
  const path = `user_trackers/${userId}/exams/${examId}`;
  try {
    const examDocRef = doc(db, 'user_trackers', userId, 'exams', examId);
    await deleteDoc(examDocRef);
    return true;
  } catch (e) {
    if (isPermissionError(e)) {
      try {
        handleFirestoreError(e, OperationType.DELETE, path);
      } catch {}
    }
    return false;
  }
}

/**
 * Imports a JSON string, validates it, and writes directly into user's Firestore account
 */
export async function importJsonDirectlyToFirestore(
  userId: string,
  rawJsonString: string
): Promise<{
  success: boolean;
  exams?: ExamItem[];
  milestones?: MilestoneAction[];
  error?: string;
  count?: number;
  permissionDenied?: boolean;
}> {
  const parsed = parseAndValidateExamJson(rawJsonString);
  if (!parsed.success || !parsed.exams) {
    return {
      success: false,
      error: parsed.error || 'Invalid JSON format.',
    };
  }

  const saveRes = await saveUserTrackerData(userId, parsed.exams, parsed.milestones || []);
  if (!saveRes.success) {
    return {
      success: false,
      permissionDenied: saveRes.permissionDenied,
      error: saveRes.message,
    };
  }

  return {
    success: true,
    exams: parsed.exams,
    milestones: parsed.milestones,
    count: parsed.exams.length,
  };
}
