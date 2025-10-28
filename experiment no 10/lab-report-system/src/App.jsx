import React, { useState, useEffect, useMemo } from 'react';
// -----------------------------------------------------------
// CONSOLIDATED FIREBASE IMPORTS (v9 Modular Style)
// -----------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, doc, addDoc, serverTimestamp, updateDoc, orderBy, where } from 'firebase/firestore';

// Lucide React Icons
import { Loader2, BookOpen, User, ClipboardList, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

// -----------------------------------------------------------
// --- FIREBASE CONFIGURATION & INITIALIZATION (Local Setup) ---
// -----------------------------------------------------------

// 1. YOUR FIREBASE CONFIGURATION (Extracted from your console snippet)
const LOCAL_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOEeQu_rY42kuCilOoVpenw2EBpIHKUns",
  authDomain: "lab-report-system-dd80f.firebaseapp.com",
  projectId: "lab-report-system-dd80f",
  storageBucket: "lab-report-system-dd80f.firebasestorage.app",
  messagingSenderId: "984395414475",
  appId: "1:984395414475:web:3d942c6250af0e5be6544e",
};

// 2. APP GLOBAL VARIABLES
// Since we are running locally, these flags are set to null/default values
const appId = LOCAL_FIREBASE_CONFIG.projectId; // Use Project ID as the app identifier
const firebaseConfig = LOCAL_FIREBASE_CONFIG;
const initialAuthToken = null; // No custom token for local sign-in

// 3. FACULTY ADMIN UID
// Replace 'YOUR_COPIED_UID_HERE' with a real User ID to access the Faculty dashboard
const FACULTY_ADMIN_DEMO_UID = 'YOUR_COPIED_UID_HERE';

// Initialize App and Services
let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  // Note: Removed the unused 'analytics' initialization: const analytics = getAnalytics(app);
}

// --- UTILITY COMPONENTS ---

const Card = ({ children, title, icon: Icon, className = "" }) => (
  <div className={`bg-white shadow-xl rounded-xl p-6 ${className} transition-all duration-300 transform hover:shadow-2xl`}>
    {title && (
      <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
        {Icon && <Icon className="w-5 h-5 text-indigo-600 mr-2" />}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon }) => {
  let baseClasses = "flex items-center justify-center px-4 py-2 font-medium rounded-lg transition duration-150 ease-in-out shadow-md";
  let variantClasses = "";

  switch (variant) {
    case 'primary':
      variantClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50";
      break;
    case 'secondary':
      variantClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50";
      break;
    case 'danger':
      variantClasses = "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50";
      break;
    case 'outline':
      variantClasses = "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50";
      break;
    default:
      variantClasses = "bg-indigo-600 text-white hover:bg-indigo-700";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};


// --- CORE APPLICATION LOGIC AND COMPONENTS ---

/**
 * Component for the Student's report submission form.
 */
const StudentSubmissionForm = ({ userId, userName, onSubmissionSuccess }) => {
  const [report, setReport] = useState({
    studentId: userId,
    studentName: userName,
    experimentName: '',
    dataObservations: '',
    evaluation: {
      marked: false,
      marks: null,
      feedback: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReport(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report.experimentName || !report.dataObservations) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const reportsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'lab_reports');

      await addDoc(reportsCollectionRef, {
        ...report,
        submissionDate: serverTimestamp(),
      });

      // Clear form and show success
      setReport(prev => ({
        ...prev,
        experimentName: '',
        dataObservations: '',
      }));
      setMessage('Report submitted successfully! The faculty will review it shortly.');
      onSubmissionSuccess(); // Switch view if needed
    } catch (error) {
      console.error("Error submitting report: ", error);
      setMessage(`Failed to submit report. Please try again. Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Submit New Lab Report" icon={BookOpen} className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
          <input
            type="text"
            value={userName}
            disabled
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="experimentName" className="block text-sm font-medium text-gray-700 mb-1">Experiment Name <span className="text-red-500">*</span></label>
          <input
            id="experimentName"
            name="experimentName"
            type="text"
            required
            value={report.experimentName}
            onChange={handleChange}
            placeholder="e.g., Calorimetry of unknown metal"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="dataObservations" className="block text-sm font-medium text-gray-700 mb-1">Data & Observations (Include Procedure Summary) <span className="text-red-500">*</span></label>
          <textarea
            id="dataObservations"
            name="dataObservations"
            rows="8"
            required
            value={report.dataObservations}
            onChange={handleChange}
            placeholder="Detail your methodology, collected data, graphs, and interpretation/results here."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {message && (
          <p className={`p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? Loader2 : CheckCircle}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
};

/**
 * Component for a single report item in a list (used by both Student and Faculty).
 */
const ReportListItem = ({ report, onClick, role }) => {
    const isMarked = report.evaluation.marked;

    const date = report.submissionDate?.toDate ? report.submissionDate.toDate().toLocaleDateString() : 'N/A';

    return (
        <div
            className={`flex justify-between items-center p-4 border-b last:border-b-0 cursor-pointer transition duration-150 ease-in-out ${isMarked ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => onClick(report)}
        >
            <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-800 truncate">{report.experimentName}</p>
                <p className="text-sm text-gray-500">
                    {role === 'faculty' && <span className="font-medium text-gray-600">{report.studentName} - </span>}
                    Submitted: {date}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                {isMarked ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Marked ({report.evaluation.marks || 0}/100)
                    </span>
                ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <XCircle className="w-4 h-4 mr-1" /> Pending Review
                    </span>
                )}
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); onClick(report); }}>
                    {role === 'faculty' ? 'Evaluate' : 'View'}
                </Button>
            </div>
        </div>
    );
};

/**
 * Modal/Detail view for Faculty to mark and provide feedback.
 */
const FacultyMarkingView = ({ report, facultyId, onClose, onUpdate }) => {
    const [marks, setMarks] = useState(report.evaluation.marks || '');
    const [feedback, setFeedback] = useState(report.evaluation.feedback || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (marks === '' || isNaN(marks) || marks < 0 || marks > 100) {
            // NOTE: Use a custom UI element instead of alert() in production apps
            console.error("Please enter a valid mark between 0 and 100.");
            return;
        }

        setIsSaving(true);
        try {
            const reportRef = doc(db, 'artifacts', appId, 'public', 'data', 'lab_reports', report.id);
            await updateDoc(reportRef, {
                evaluation: {
                    marked: true,
                    marks: parseInt(marks, 10),
                    feedback: feedback.trim(),
                    facultyId: facultyId,
                    evaluationDate: serverTimestamp(),
                },
            });
            onUpdate();
        } catch (error) {
            console.error("Error updating report: ", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Evaluate Report: {report.experimentName}</h3>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Report Content */}
                    <div className="md:col-span-2 space-y-4">
                        <p className="text-sm font-medium text-indigo-600">Student: {report.studentName}</p>
                        <p className="text-sm text-gray-500 mb-4">Submitted: {report.submissionDate?.toDate().toLocaleString() || 'N/A'}</p>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800">Report Details</h4>
                            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-md border">
                                {report.dataObservations}
                            </pre>
                        </div>
                    </div>

                    {/* Marking Section */}
                    <div className="md:col-span-1 space-y-6 sticky top-0">
                        <Card title="Marking & Feedback" className="p-4 bg-indigo-50 border border-indigo-200">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">Marks (Out of 100) <span className="text-red-500">*</span></label>
                                    <input
                                        id="marks"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value)}
                                        className="w-full p-3 border border-indigo-300 rounded-lg text-2xl font-bold text-center focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                    <textarea
                                        id="feedback"
                                        rows="5"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide constructive feedback here..."
                                        className="w-full p-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    ></textarea>
                                </div>
                            </div>
                        </Card>
                        <Button onClick={handleSave} disabled={isSaving} icon={isSaving ? Loader2 : CheckCircle}>
                            {isSaving ? 'Saving...' : 'Save Evaluation'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

/**
 * Component to display the Evaluation Summary (used by Student to view their own result).
 */
const ReportDetailView = ({ report, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">Report Details: {report.experimentName}</h3>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </div>

                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                        <p><span className="font-semibold">Student:</span> {report.studentName}</p>
                        <p><span className="font-semibold">Submitted:</span> {report.submissionDate?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>

                    <Card title="Submitted Content" className="bg-gray-50 border border-gray-200">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed p-3 bg-white rounded-md border">
                            {report.dataObservations}
                        </pre>
                    </Card>

                    <Card title="Faculty Evaluation" className={`p-4 ${report.evaluation.marked ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        {report.evaluation.marked ? (
                            <div className="space-y-4">
                                <p className="text-3xl font-bold text-green-700">
                                    Score: {report.evaluation.marks} / 100
                                </p>
                                <p className="text-base text-gray-700"><span className="font-semibold">Feedback:</span></p>
                                <p className="whitespace-pre-wrap text-sm italic">{report.evaluation.feedback || 'No detailed feedback provided.'}</p>
                            </div>
                        ) : (
                            <p className="text-lg font-medium text-yellow-700">Awaiting faculty review and marking.</p>
                        )}
                    </Card>
                </div>
            </Card>
        </div>
    );
};


/**
 * Faculty Dashboard: List of all reports and the summary.
 */
const FacultyDashboard = ({ reports, facultyId }) => {
    const [selectedReport, setSelectedReport] = useState(null);

    // Calculate Summary Statistics
    const { averageScore, totalSubmissions, totalMarked } = useMemo(() => {
        const marked = reports.filter(r => r.evaluation.marked && r.evaluation.marks !== null);
        const totalMarks = marked.reduce((sum, r) => sum + (r.evaluation.marks || 0), 0);
        return {
            averageScore: marked.length > 0 ? (totalMarks / marked.length).toFixed(2) : 'N/A',
            totalSubmissions: reports.length,
            totalMarked: marked.length,
        };
    }, [reports]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Faculty Dashboard</h1>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Total Submissions" icon={ClipboardList} className="bg-indigo-50">
                    <p className="text-4xl font-bold text-indigo-700">{totalSubmissions}</p>
                    <p className="text-sm text-gray-600 mt-1">Reports received</p>
                </Card>
                <Card title="Total Marked" icon={CheckCircle} className="bg-green-50">
                    <p className="text-4xl font-bold text-green-700">{totalMarked}</p>
                    <p className="text-sm text-gray-600 mt-1">Reports evaluated</p>
                </Card>
                <Card title="Batch Average Score" icon={TrendingUp} className="bg-yellow-50">
                    <p className="text-4xl font-bold text-yellow-700">{averageScore}</p>
                    <p className="text-sm text-gray-600 mt-1">Based on marked reports</p>
                </Card>
            </div>

            {/* Submissions List */}
            <Card title={`All Lab Report Submissions (${reports.length})`} icon={ClipboardList}>
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                    {reports.length === 0 ? (
                        <p className="p-4 text-gray-500">No reports have been submitted yet.</p>
                    ) : (
                        reports.sort((a, b) => b.submissionDate?.seconds - a.submissionDate?.seconds) // Sort by most recent
                               .map(report => (
                            <ReportListItem
                                key={report.id}
                                report={report}
                                onClick={setSelectedReport}
                                role="faculty"
                            />
                        ))
                    )}
                </div>
            </Card>

            {/* Marking Modal */}
            {selectedReport && (
                <FacultyMarkingView
                    report={selectedReport}
                    facultyId={facultyId}
                    onClose={() => setSelectedReport(null)}
                    onUpdate={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};

/**
 * Student Dashboard: View their own reports and access the submission form.
 */
const StudentDashboard = ({ reports, userId, userName, setView }) => {
    const userReports = reports.filter(r => r.studentId === userId);
    const [selectedReport, setSelectedReport] = useState(null);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Student Portal: {userName}</h1>

            <Button onClick={() => setView('submit')} icon={BookOpen}>
                Submit New Report
            </Button>

            <Card title={`Your Past Submissions (${userReports.length})`} icon={ClipboardList}>
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                    {userReports.length === 0 ? (
                        <p className="p-4 text-gray-500">You have not submitted any reports yet.</p>
                    ) : (
                        userReports.sort((a, b) => b.submissionDate?.seconds - a.submissionDate?.seconds)
                                   .map(report => (
                            <ReportListItem
                                key={report.id}
                                report={report}
                                onClick={setSelectedReport}
                                role="student"
                            />
                        ))
                    )}
                </div>
            </Card>

            {/* View Report Modal */}
            {selectedReport && (
                <ReportDetailView
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
    const [authReady, setAuthReady] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('loading'); // 'loading', 'student', 'faculty'
    const [reports, setReports] = useState([]);
    const [view, setView] = useState('dashboard'); // 'dashboard', 'submit'

    const userId = user?.uid || '';
    const userName = user?.displayName || `User_${userId.substring(0, 8)}` || 'Loading...';

    // 1. Firebase Initialization and Authentication
    useEffect(() => {
        if (!auth) return;

        // Sign in using custom token or anonymously
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase authentication failed:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Simple role check: Is the user the predefined faculty admin?
                const determinedRole = currentUser.uid === FACULTY_ADMIN_DEMO_UID ? 'faculty' : 'student';
                setRole(determinedRole);
                // Default view for faculty is the dashboard, students start on dashboard too
                setView('dashboard');
            } else {
                setRole('student'); // Fallback to student role if unauthenticated for some reason
            }
            setAuthReady(true);
        });

        authenticate();
        return () => unsubscribe();
    }, []);

    // 2. Firestore Real-time Listener for Reports
    useEffect(() => {
        if (!db || !authReady || !userId) return;

        // Define the query for the lab reports collection
        const reportsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'lab_reports');

        let q;
        if (role === 'faculty') {
            // Faculty sees all reports
            q = query(reportsCollectionRef, orderBy('submissionDate', 'desc'));
        } else {
            // Students only see their own reports
            q = query(reportsCollectionRef, where('studentId', '==', userId), orderBy('submissionDate', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(fetchedReports);
        }, (error) => {
            console.error("Error listening to reports: ", error);
        });

        return () => unsubscribe();
    }, [authReady, role, userId]); // Dependencies updated for clarity

    // Render Loading State
    if (!authReady || role === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center text-indigo-600 text-xl">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Loading Application...
                </div>
            </div>
        );
    }

    // --- Main Render based on Role and View ---
    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
            <style>{`
                /* Tailwind styles are primary, but ensure Lucide icons rotate */
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <header className="bg-white shadow-md p-4 rounded-xl mb-8 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-indigo-700 flex items-center">
                    <ClipboardList className="w-6 h-6 mr-2" />
                    Lab Report Evaluation System
                </h1>
                <div className="text-right text-sm">
                    <p className="font-semibold text-gray-800 flex items-center justify-end">
                        <User className="w-4 h-4 mr-1" />
                        Role: <span className={`ml-1 font-bold ${role === 'faculty' ? 'text-red-600' : 'text-indigo-600'}`}>{role.toUpperCase()}</span>
                    </p>
                    <p className="text-gray-500 truncate">Your ID: {userId}</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {role === 'faculty' ? (
                    <FacultyDashboard reports={reports} facultyId={userId} />
                ) : (
                    <>
                        {view === 'dashboard' && (
                            <StudentDashboard
                                reports={reports}
                                userId={userId}
                                userName={userName}
                                setView={setView}
                            />
                        )}
                        {view === 'submit' && (
                            <StudentSubmissionForm
                                userId={userId}
                                userName={userName}
                                onSubmissionSuccess={() => setView('dashboard')}
                            />
                        )}
                        {view === 'submit' && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="secondary" onClick={() => setView('dashboard')}>
                                    Back to Submissions List
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
