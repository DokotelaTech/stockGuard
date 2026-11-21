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
import { Eye, EyeOff } from "lucide-react";

import { auth, db } from "../../firebase.js";

// Place your image at frontend/public/stockguard-logo.jpg or update this path
const LOGO_SRC = "/stockguard-logo.jpeg";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
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
    setResetMessage("");

    try {
      setLoading(true);

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
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
      setResetMessage("");
      setError("Enter your email address first.");
      return;
    }

    try {
      setResetLoading(true);
      setError("");
      setResetMessage("");

      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase());
      setResetMessage("Password reset instructions sent to your email.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        "Unable to send password reset email. Please check your email address."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .sg-lg-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg, #f3f4f6);
          font-family: inherit;
        }

        .sg-lg-frame {
          width: 100%;
          max-width: 1160px;
          min-height: 720px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          background: var(--surface, #ffffff);
          border-radius: 30px;
          padding: 1.35rem;
          box-shadow: 0 28px 70px -24px rgba(0, 0, 0, 0.16);
          border: 1px solid var(--border, #e5e7eb);
        }

        /* Larger Dark Left Panel */
        .sg-lg-visual {
          position: relative;
          border-radius: 22px;
          background: #07090d;
          padding: 3.25rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          color: #ffffff;
        }

        .sg-lg-beams {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 60%;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 0 1.5rem;
          pointer-events: none;
          mask-image: linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%);
        }

        .sg-lg-beams span {
          flex: 1;
          border-radius: 10px 10px 0 0;
          background: linear-gradient(
            to top,
            #ffffff 0%,
            var(--primary, var(--accent, #2563eb)) 50%,
            transparent 100%
          );
        }

        .sg-lg-beams span:nth-child(1) { height: 64%; opacity: 0.55; }
        .sg-lg-beams span:nth-child(2) { height: 90%; opacity: 0.92; }
        .sg-lg-beams span:nth-child(3) { height: 76%; opacity: 0.75; }
        .sg-lg-beams span:nth-child(4) { height: 96%; opacity: 0.85; }
        .sg-lg-beams span:nth-child(5) { height: 54%; opacity: 0.45; }
        .sg-lg-beams span:nth-child(6) { height: 36%; opacity: 0.25; }

        .sg-lg-visual h2 {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: clamp(2.15rem, 3.1vw, 2.95rem);
          font-weight: 600;
          line-height: 1.16;
          letter-spacing: -0.025em;
          color: #ffffff;
          max-width: 14ch;
        }

        .sg-lg-visual-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Larger Right Form Panel */
        .sg-lg-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 3.5rem;
        }

        .sg-lg-form-box {
          width: 100%;
          max-width: 430px;
        }

        .sg-lg-logo {
          width: 124px;
          height: 124px;
          object-fit: contain;
          display: block;
          margin: 0 auto 1rem;
          background: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }

        .sg-lg-title,
        .sg-lg-subtitle {
          text-align: start;
        }

        .sg-lg-title {
          margin: 0 0 0.45rem;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--text, #111827);
        }

        .sg-lg-subtitle {
          margin: 0 0 1.65rem;
          font-size: 0.98rem;
          color: var(--text-muted, #6b7280);
        }

        .sg-lg-divider {
          height: 1px;
          background: var(--border, #e5e7eb);
          border: none;
          margin: 0 0 1.75rem;
        }

        .sg-lg-form {
          display: grid;
          gap: 1.3rem;
        }

        .sg-lg-field label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted, #4b5563);
          margin-bottom: 0.5rem;
        }

        .sg-lg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sg-lg-input-wrap input {
          width: 100%;
          height: 52px;
          padding: 0 2.85rem 0 1.05rem;
          border-radius: 12px;
          border: 1.5px solid var(--border, #d1d5db);
          background: var(--surface, #ffffff);
          color: var(--text, #111827);
          font-size: 1rem;
          font-weight: 500;
          transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }

        .sg-lg-input-wrap input:focus {
          outline: none;
          border-color: var(--primary, var(--accent, #2563eb));
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, var(--accent, #2563eb)) 16%, transparent);
        }

        .sg-lg-eye {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          padding: 0.3rem;
          color: var(--text-muted, #6b7280);
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .sg-lg-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-muted, #6b7280);
        }

        .sg-lg-check {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .sg-lg-check input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary, var(--accent, #2563eb));
        }

        .sg-lg-forgot {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--primary, var(--accent, #2563eb));
          cursor: pointer;
        }

        .sg-lg-forgot:hover:not(:disabled) {
          text-decoration: underline;
        }

        .sg-lg-msg {
          margin: 0;
          font-size: 0.88rem;
          padding: 0.7rem 0.9rem;
          border-radius: 10px;
        }

        .sg-lg-msg.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .sg-lg-msg.success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .sg-lg-submit {
          width: 100%;
          height: 52px;
          margin-top: 0.35rem;
          border: none;
          border-radius: 12px;
          background: var(--primary, var(--accent, #2563eb));
          color: var(--primary-contrast, #ffffff);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.16s ease, transform 0.12s ease;
        }

        .sg-lg-submit:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
        }

        .sg-lg-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .sg-lg-footer {
          margin: 1.4rem 0 0;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted, #6b7280);
        }

        .sg-lg-footer a {
          margin-left: 0.35rem;
          font-weight: 700;
          color: var(--text, #111827);
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .sg-lg-page {
            padding: 1rem;
          }
          .sg-lg-frame {
            grid-template-columns: 1fr;
            min-height: auto;
            max-width: 520px;
          }
          .sg-lg-visual {
            display: none;
          }
          .sg-lg-form-side {
            padding: 2rem 1.25rem;
          }
        }
      `}</style>

      <main className="sg-lg-page auth-page">
        <div className="sg-lg-frame">
          {/* Left Dark Rounded Card */}
          <section className="sg-lg-visual">
            <h2>Safe Stock. Healthy Communities.</h2>

            <div className="sg-lg-beams" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="sg-lg-visual-footer">
              <span>StockGuard</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </section>

          {/* Right Form Panel with Your Logo Image */}
          <section className="sg-lg-form-side">
            <div className="sg-lg-form-box">
              <img
                src={LOGO_SRC}
                alt="StockGuard logo"
                className="sg-lg-logo"
              />

              <h1 className="sg-lg-title">Sign In</h1>
              <p className="sg-lg-subtitle">
                Welcome to StockGuard — Let&apos;s get started
              </p>

              <hr className="sg-lg-divider" />

              <form className="sg-lg-form" onSubmit={handleSubmit}>
                <div className="sg-lg-field">
                  <label htmlFor="email">Your email</label>
                  <div className="sg-lg-input-wrap">
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

                <div className="sg-lg-field">
                  <label htmlFor="password">Password</label>
                  <div className="sg-lg-input-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="sg-lg-eye"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="sg-lg-meta">
                  <label className="sg-lg-check">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="sg-lg-forgot"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending…" : "Forgot password?"}
                  </button>
                </div>

                {error && (
                  <p className="sg-lg-msg error" role="alert">
                    {error}
                  </p>
                )}

                {resetMessage && (
                  <p className="sg-lg-msg success" role="status">
                    {resetMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="button button-primary sg-lg-submit"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <p className="sg-lg-footer">
                Don&apos;t have an account?
                <Link to="/register">Create Account</Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}