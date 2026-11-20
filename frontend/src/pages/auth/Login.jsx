import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    signOut
} from "firebase/auth";

import {
    doc,
    getDoc
} from "firebase/firestore";

export default function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [rememberMe, setRememberMe] = useState(false);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const [resetLoading, setResetLoading] = useState(false);


    // HANDLE INPUT CHANGES

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };


    // HANDLE LOGIN

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            setLoading(true);

            // 1. Set login persistence

            await setPersistence(
                auth,
                rememberMe
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );


            // 2. Authenticate user with Firebase

            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email.trim().toLowerCase(),
                formData.password
            );

            const user = userCredential.user;


            // 3. Retrieve user information from Firestore

            const userRef = doc(db, "users", user.uid);

            const userSnapshot = await getDoc(userRef);


            // 4. Check if user profile exists

            if (!userSnapshot.exists()) {

                await signOut(auth);

                setError("Your user profile could not be found.");

                return;

            }


            const userData = userSnapshot.data();


            // Any successfully authenticated account can use the MVP.

            navigate("/dashboard", {
                replace: true,
                state: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        clinic: userData.clinic,
                        role: userData.role
                    }
                }
            });


        } catch (error) {

            console.error("Login error:", error);

            if (error.code === "auth/invalid-credential") {

                setError("Incorrect email or password.");

            }
            else if (error.code === "auth/user-not-found") {

                setError("No account found with this email.");

            }
            else if (error.code === "auth/wrong-password") {

                setError("Incorrect password.");

            }
            else if (error.code === "auth/invalid-email") {

                setError("Please enter a valid email address.");

            }
            else if (error.code === "auth/too-many-requests") {

                setError("Too many attempts. Please try again later.");

            }
            else {

                setError("Login failed. Please try again.");

            }

        } finally {

            setLoading(false);

        }

    };


    // FORGOT PASSWORD

    const handleForgotPassword = async () => {

        if (!formData.email.trim()) {

            setError("Enter your email address first.");

            return;

        }

        try {

            setResetLoading(true);

            setError("");

            await sendPasswordResetEmail(
                auth,
                formData.email.trim().toLowerCase()
            );

            alert("Password reset instructions have been sent to your email.");

        } catch (error) {

            console.error("Password reset error:", error);

            setError("Unable to send password reset email. Please check your email address.");

        } finally {

            setResetLoading(false);

        }

    };


    // INPUT STYLING

    const inputStyle = {

        width: "100%",
        padding: "14px",
        border: "1px solid #dce3e8",
        borderRadius: "8px",
        outline: "none",
        fontSize: "14px",
        boxSizing: "border-box",
        marginTop: "8px",

    };


    const labelStyle = {

        fontSize: "13px",
        fontWeight: "600",
        color: "#334155",

    };


    return (

        <div
            className="auth-layout"
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "Arial, sans-serif",
                backgroundColor: "#f8fafc",
            }}
        >

            {/* LEFT SIDE */}

            <div
                className="auth-brand"
                style={{
                    width: "50%",
                    backgroundColor: "#0f172a",
                    color: "white",
                    padding: "60px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                }}
            >

                <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>

                    Stock<span style={{ color: "#10b981" }}>Guard</span>

                </h1>

                <p style={{
                    color: "#94a3b8",
                    fontSize: "15px",
                    marginBottom: "50px"
                }}>

                    Safe Stock. Healthy Communities.

                </p>

                <h2 style={{
                    fontSize: "36px",
                    lineHeight: "1.3",
                    marginBottom: "20px"
                }}>

                    Welcome Back!
                    <br />
                    Your healthcare supply chain starts here.

                </h2>

                <p style={{
                    color: "#cbd5e1",
                    fontSize: "16px",
                    lineHeight: "1.8",
                    maxWidth: "450px"
                }}>

                    Manage medicine inventory, monitor stock levels
                    and prevent medicine shortages with intelligent
                    healthcare inventory management.

                </p>

                <div style={{
                    marginTop: "40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px"
                }}>

                    <p>✓ Monitor medicine inventory in real time</p>

                    <p>✓ Predict medicine shortages using AI</p>

                    <p>✓ Track medicine batches securely</p>

                    <p>✓ Redistribute medicines between clinics</p>

                </div>

                <p style={{
                    color: "#64748b",
                    fontSize: "12px",
                    marginTop: "70px"
                }}>

                    © {new Date().getFullYear()} StockGuard. All rights reserved.

                </p>

            </div>


            {/* RIGHT SIDE */}

            <div
                className="auth-panel"
                style={{
                    width: "50%",
                    padding: "60px 80px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    boxSizing: "border-box",
                }}
            >

                <h2 style={{
                    color: "#0f172a",
                    fontSize: "30px",
                    marginBottom: "10px"
                }}>

                    Sign in to StockGuard

                </h2>

                <p style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginBottom: "40px"
                }}>

                    Enter your account details to access your dashboard.

                </p>


                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <div style={{ marginBottom: "25px" }}>

                        <label style={labelStyle} htmlFor="email">

                            Email Address

                        </label>

                        <input
                            id="email"
                            style={inputStyle}
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div style={{ marginBottom: "20px" }}>

                        <label style={labelStyle} htmlFor="password">

                            Password

                        </label>

                        <input
                            id="password"
                            style={inputStyle}
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    {/* REMEMBER ME + FORGOT PASSWORD */}

                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                        fontSize: "13px"
                    }}>

                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            color: "#475569"
                        }}>

                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />

                            Remember me

                        </label>


                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={resetLoading}
                            style={{
                                color: "#059669",
                                fontWeight: "600",
                                cursor: "pointer",
                                border: "none",
                                background: "none",
                                fontSize: "13px"
                            }}
                        >

                            {resetLoading ? "Sending..." : "Forgot Password?"}

                        </button>

                    </div>


                    {/* ERROR MESSAGE */}

                    {error && (

                        <p
                            role="alert"
                            style={{
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                                padding: "12px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                marginBottom: "20px"
                            }}
                        >

                            {error}

                        </p>

                    )}


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "15px",
                            backgroundColor: loading ? "#6ee7b7" : "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "15px",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >

                        {loading ? "Signing in..." : "Sign In →"}

                    </button>

                </form>


                {/* SIGNUP LINK */}

                <p style={{
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#64748b",
                    marginTop: "30px"
                }}>

                    Don't have an account?

                    <Link
                        to="/register"
                        style={{
                            color: "#059669",
                            fontWeight: "bold",
                            marginLeft: "5px",
                            textDecoration: "none"
                        }}
                    >

                        Create Account

                    </Link>

                </p>

            </div>

        </div>

    );

}
