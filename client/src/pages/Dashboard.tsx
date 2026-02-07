import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  LogOut,
  Users,
  Trash2,
  Pencil,
  Loader2,
  Shield,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, ApiError, type UserInfo } from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login');
  };

  const handleFetchUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const data = await authApi.getAllUsers(token);
      setUsers(data || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to load users.');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    setDeletingId(userId);
    try {
      await authApi.deleteUser(userId, token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted.');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete user.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateUsername = async () => {
    if (!token || !newUsername.trim()) return;
    setUpdatingUsername(true);
    try {
      await authApi.updateUsername({ username: newUsername.trim() }, token);
      toast.success('Username updated!');
      setNewUsername('');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update username.');
      }
    } finally {
      setUpdatingUsername(false);
    }
  };

  return (
    <div className="min-h-screen auth-gradient">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                  fill="currentColor"
                  className="text-primary-foreground"
                />
              </svg>
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              Appu
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Welcome */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              You're authenticated. Everything is working.
            </p>
          </div>

          {/* Status card */}
          <div className="auth-card p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  Session Active
                </p>
                <p className="text-xs text-muted-foreground">
                  JWT token stored securely
                </p>
              </div>
            </div>
          </div>

          {/* Admin panel */}
          <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
            <div className="auth-card overflow-hidden">
              <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">
                      Admin Actions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Manage users and settings
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    adminOpen ? 'rotate-180' : ''
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                  {/* Update username */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Pencil className="w-3.5 h-3.5" />
                      Update Username
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New username"
                        className="auth-input flex-1"
                      />
                      <Button
                        onClick={handleUpdateUsername}
                        disabled={updatingUsername || !newUsername.trim()}
                        className="auth-button bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {updatingUsername ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Update'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* User list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        All Users
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchUsers}
                        disabled={loadingUsers}
                        className="text-xs"
                      >
                        {loadingUsers ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : null}
                        Load Users
                      </Button>
                    </div>

                    {users.length > 0 && (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 text-sm"
                          >
                            <div>
                              <span className="font-medium text-foreground">
                                {user.username}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                {user.email}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingId === user.id}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {users.length === 0 && !loadingUsers && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Click "Load Users" to fetch the user list.
                      </p>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
