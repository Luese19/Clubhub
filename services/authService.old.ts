import type { User, UserRole } from '../types';

const USER_STORAGE_KEY = 'clubhub_users';
const SESSION_STORAGE_KEY = 'clubhub_session';

type StoredUser = User & { passwordHash: string };

// Helper to get users from localStorage
const getUsers = (): StoredUser[] => {
    const usersJson = localStorage.getItem(USER_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

// Simple pseudo-hashing for demonstration. Do NOT use in production.
const pseudoHash = (password: string): string => {
    return `hashed_${password}_secret`;
};

export const authService = {
    signUp: (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    return reject(new Error("An account with this email already exists."));
                }

                // First user to sign up is admin, others are students with no org
                const role: UserRole = users.length === 0 ? 'admin' : 'student';
                
                const newUser: StoredUser = {
                    email,
                    passwordHash: pseudoHash(password),
                    role,
                    organizationId: null, // New users are not in an org by default
                };

                saveUsers([...users, newUser]);
                
                const user: User = { email, role, organizationId: null };
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));

                resolve(user);
            }, 1000);
        });
    },

    signIn: (email: string, password: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (user && user.passwordHash === pseudoHash(password)) {
                    const sessionUser: User = { email: user.email, role: user.role, organizationId: user.organizationId };
                    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
                    resolve(sessionUser);
                } else {
                    reject(new Error("Invalid email or password."));
                }
            }, 1000);
        });
    },

    signOut: (): void => {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    },

    getCurrentUser: (): User | null => {
        const sessionJson = localStorage.getItem(SESSION_STORAGE_KEY);
        return sessionJson ? JSON.parse(sessionJson) : null;
    },

    getUsersByOrg: (organizationId: string): Promise<User[]> => {
        return new Promise((resolve) => {
            const allUsers = getUsers();
            const orgUsers = allUsers
                .filter(u => u.organizationId === organizationId)
                .map(({ email, role, organizationId }) => ({ email, role, organizationId }));
            resolve(orgUsers);
        });
    },

    assignUserToOrg: (email: string, organizationId: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            if(users[userIndex].organizationId) {
                return reject(new Error('User is already in an organization.'));
            }

            users[userIndex].organizationId = organizationId;
            saveUsers(users);
            resolve(users[userIndex]);
        });
    },

    removeUserFromOrg: (email: string, organizationId: string): Promise<void> => {
         return new Promise((resolve, reject) => {
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.organizationId === organizationId);
            if (userIndex === -1) {
                return reject(new Error('User not found in this organization.'));
            }
            
            // We just remove them from the org, don't delete the user
            users[userIndex].organizationId = null; 
            // If they were an admin of that org, demote them to student
            if(users[userIndex].role === 'admin') {
                users[userIndex].role = 'student';
            }

            saveUsers(users);
            resolve();
        });
    },

    makeUserOrgAdmin: (email: string, organizationId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
            if (userIndex === -1) {
                return reject(new Error('User not found.'));
            }
            users[userIndex].role = 'admin';
            users[userIndex].organizationId = organizationId;
            saveUsers(users);
            resolve();
        });
    }
};