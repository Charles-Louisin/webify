import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PermissionTestResult {
  success: boolean;
  results: {
    user: {
      id: Id<"users">;
      role: string;
    };
    basicPermissions?: {
      canViewProfile: boolean;
      canSendMessages: boolean;
      canLikeContent: boolean;
      canCommentContent: boolean;
      canJoinGroups: boolean;
    };
    contentCreationPermissions?: {
      canCreatePost: boolean;
      canCreateProject: boolean;
      canCreateBlog: boolean;
      canManageSkills: boolean;
      hasCertificationBadge: boolean;
    };
    adminPermissions?: {
      canAccessDashboard: boolean;
      canManageUsers: boolean;
      canViewGlobalStats: boolean;
      canModifyAnyContent: boolean;
    };
    practicalTests?: {
      postCreation: { success: boolean; allowed: boolean };
      statsAccess: { success: boolean; allowed: boolean };
      roleModification: { success: boolean; allowed: boolean };
    };
  };
  error?: string;
}

const PermissionTester = ({ userId }: { userId: Id<"users"> }) => {
  const [results, setResults] = useState<PermissionTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"theoretical" | "practical">("theoretical");

  const testUserPermissions = useMutation(api.tests.testUserPermissions);
  const testPermissionsInAction = useMutation(api.tests.testPermissionsInAction);

  const runTests = async () => {
    setLoading(true);
    try {
      const theoreticalResults = await testUserPermissions({ userId });
      const practicalResults = await testPermissionsInAction({ userId });
      
      setResults({
        success: theoreticalResults.success && practicalResults.success,
        results: {
          user: theoreticalResults.results.user,
          ...theoreticalResults.results,
          practicalTests: practicalResults.results.practicalTests,
        },
        error: theoreticalResults.error || practicalResults.error,
      });
    } catch (error) {
      setResults({
        success: false,
        results: { user: { id: userId, role: "unknown" } },
        error: error.message,
      });
    }
    setLoading(false);
  };

  const PermissionIcon = ({ allowed }: { allowed: boolean }) => (
    <span className={`inline-block w-5 h-5 rounded-full ${allowed ? "bg-green-500" : "bg-red-500"}`}>
      {allowed ? "✓" : "✗"}
    </span>
  );

  const TestResult = ({ name, result }: { name: string; result: boolean }) => (
    <div className="flex items-center justify-between p-2 border-b">
      <span>{name}</span>
      <PermissionIcon allowed={result} />
    </div>
  );

  const PracticalTestResult = ({ 
    name, 
    result: { success, allowed } 
  }: { 
    name: string; 
    result: { success: boolean; allowed: boolean }; 
  }) => (
    <div className="flex items-center justify-between p-2 border-b">
      <span>{name}</span>
      <div className="flex gap-2">
        <span className={`text-sm ${success === allowed ? "text-green-500" : "text-red-500"}`}>
          {success === allowed ? "Cohérent" : "Incohérent"}
        </span>
        <PermissionIcon allowed={success} />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Testeur de Permissions</h2>
      
      {!results && (
        <button
          onClick={runTests}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Test en cours..." : "Lancer les tests"}
        </button>
      )}

      {results && (
        <div>
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Utilisateur</h3>
            <p>Role: {results.results.user.role}</p>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab("theoretical")}
              className={`py-2 px-4 rounded ${
                activeTab === "theoretical" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Tests Théoriques
            </button>
            <button
              onClick={() => setActiveTab("practical")}
              className={`py-2 px-4 rounded ${
                activeTab === "practical" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Tests Pratiques
            </button>
          </div>

          {activeTab === "theoretical" && (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Permissions de Base</h3>
                {Object.entries(results.results.basicPermissions || {}).map(([key, value]) => (
                  <TestResult key={key} name={key} result={value} />
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Permissions de Création de Contenu</h3>
                {Object.entries(results.results.contentCreationPermissions || {}).map(([key, value]) => (
                  <TestResult key={key} name={key} result={value} />
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Permissions Administratives</h3>
                {Object.entries(results.results.adminPermissions || {}).map(([key, value]) => (
                  <TestResult key={key} name={key} result={value} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "practical" && (
            <div>
              <h3 className="font-semibold mb-2">Tests Pratiques</h3>
              {Object.entries(results.results.practicalTests || {}).map(([key, value]) => (
                <PracticalTestResult key={key} name={key} result={value} />
              ))}
            </div>
          )}

          {results.error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              Erreur: {results.error}
            </div>
          )}

          <button
            onClick={() => {
              setResults(null);
              setActiveTab("theoretical");
            }}
            className="mt-4 w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};

export default PermissionTester; 