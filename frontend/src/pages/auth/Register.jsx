import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { auth, db } from "../../firebase.js";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  clinic: "",
  role: "",
  password: "",
  confirmPassword: "",
};

const fields = [
  { name: "firstName", label: "First name", type: "text", placeholder: "Jane" },
  { name: "lastName", label: "Last name", type: "text", placeholder: "Doe" },
  {
    name: "email",
    label: "Email address",
    type: "email",
    placeholder: "name@clinic.org",
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    placeholder: "+27 00 000 0000",
  },
  {
    name: "clinic",
    label: "Clinic / healthcare facility",
    type: "text",
    placeholder: "Central Health Clinic",
  },
];

const highlights = [
  "Real-time clinic stock visibility",
  "AI-powered demand & expiry alerts",
  "Verified blockchain batch traceability",
];

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password,
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        clinic: formData.clinic.trim(),
        role: formData.role,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Your password is too weak.");
      } else if (err.code === "permission-denied") {
        setError(
          "Unable to save your profile. Please check your Firestore permissions.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

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

        <h2>Smarter healthcare inventory management.</h2>

        <p className="auth-brand-lead">
          Support healthcare facilities as they manage medicine inventory,
          prevent stockouts, and protect patient care.
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
        <div className="auth-card wide">
          <h2>Create your account</h2>
          <p className="auth-card-subtitle">
            Enter your details to get started with StockGuard.
          </p>

          <form className="auth-form two-col" onSubmit={handleSubmit}>
            {fields.map(({ name, label, type, placeholder }) => (
              <div className="auth-field" key={name}>
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="auth-field">
              <label htmlFor="role">Your Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select your role</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="stock_manager">Stock Manager</option>
                <option value="clinic_admin">Clinic Administrator</option>
                <option value="healthcare_worker">Healthcare Worker</option>
                <option value="warehouse_manager">Warehouse Manager</option>
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <p className="form-error full-span" role="alert">
                {error}
              </p>
            )}

            <button
              className="button button-primary auth-submit full-span"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
              {!loading && <ArrowRight size={17} strokeWidth={2.2} />}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
