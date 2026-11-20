import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { auth, db } from "../../firebase.js";

const highlights = [
  "Monitor medicine inventory in real time",
  "Predict medicine shortages using AI",
  "Track medicine batches securely on-chain",
  "Redistribute medicines between clinics",
];

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

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password,
      );

      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        await signOut(auth);
        setError("Your user profile could not be found.");
        return;
      }

      const userData = userSnapshot.data();

      navigate("/dashboard", {
        replace: true,
        state: {
          user: {
            uid: user.uid,
            email: user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            clinic: userData.clinic,
            role: userData.role,
          },
        },
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    try {
      setResetLoading(true);
      setError("");

      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
      alert("Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        "Unable to send password reset email. Please check your email address.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-brand-logo">
          <span className="brand-mark">
            <ShieldCheck size={28} strokeWidth={2.2} />
          </span>
          <h1>
            Stock<span>Guard</span>
          </h1>
        </div>

        <p className="auth-brand-tagline">Safe Stock. Healthy Communities.</p>

        <h2>
          Welcome Back!
          <br />
          Your healthcare supply chain starts here.
        </h2>

        <p className="auth-brand-lead">
          Manage medicine inventory, monitor stock levels, and prevent medicine
          shortages with intelligent healthcare inventory management.
        </p>

        <ul className="auth-features">
          {highlights.map((text) => (
            <li key={text}>
              <CheckCircle2 size={18} strokeWidth={2} />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p className="auth-copyright">
          © {new Date().getFullYear()} StockGuard. All rights reserved.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>Sign in to StockGuard</h2>
          <p className="auth-card-subtitle">
            Enter your account details to access your dashboard.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={17} strokeWidth={1.9} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@clinic.org"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={17} strokeWidth={1.9} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <div className="auth-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-link-btn"
                onClick={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? "Sending…" : "Forgot Password?"}
              </button>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="button button-primary auth-submit"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight size={17} strokeWidth={2.2} />}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?
            <Link to="/register">Create Account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
