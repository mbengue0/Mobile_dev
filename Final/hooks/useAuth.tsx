import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    student_id: string | null;
    role: 'student' | 'admin' | 'super_admin';
    wallet_balance: number;
    push_token?: string | null;
    notifications_enabled?: boolean;
    last_notification_at?: string | null;
    created_at: string;
    institution_id?: string; // Multi-tenant support
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName: string, studentId: string, inviteCode?: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Ghost session detected - profile missing
                if (error.code === 'PGRST116') {
                    console.warn('Ghost session detected - profile missing. Waiting for backend trigger...');
                    // Legacy client-side healing removed as it conflicts with Multi-Tenant constraints.
                    // The backend trigger `handle_new_user` is the single source of truth.

                    // Optional: Retry once after small delay in case trigger is slow?
                    await new Promise(r => setTimeout(r, 2000));
                    const retry = await supabase.from('profiles').select('*').eq('id', userId).single();
                    if (retry.data) return retry.data as Profile;

                    console.log('Profile still missing - logging out');
                    await signOut();
                    return null;
                }
                console.error('Profile fetch error:', error);
                return null;
            }

            return data as Profile;
        } catch (err) {
            console.error('Profile fetch exception:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const prof = await fetchProfile(user.id);
            setProfile(prof);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (!error && data.user) {
            const prof = await fetchProfile(data.user.id);
            setProfile(prof);
        }

        return { error };
    };

    const signUp = async (email: string, password: string, fullName: string, studentId: string, inviteCode?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    student_id: studentId,
                    invite_code: inviteCode, // Pass to DB Trigger for Institution assignment
                },
            },
        });

        if (!error && data.user) {
            // Wait a bit for trigger to create profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            const prof = await fetchProfile(data.user.id);
            setProfile(prof);
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.clear();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(prof => {
                    setProfile(prof);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const prof = await fetchProfile(session.user.id);
                    setProfile(prof);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                loading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
