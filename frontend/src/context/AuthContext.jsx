import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            },
            (error) => {
                console.error("Authentication state error:", error);
                setUser(null);
                setLoading(false);
            },
        );

        return unsubscribe;

    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                authLoading: loading,
                signOut: () => firebaseSignOut(auth),
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
}
