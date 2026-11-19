import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  { name: "firstName", label: "First name", type: "text" },
  { name: "lastName", label: "Last name", type: "text" },
  { name: "email", label: "Email address", type: "email" },
  { name: "phone", label: "Phone number", type: "tel" },
  { name: "clinic", label: "Clinic / healthcare facility", type: "text" },
  { name: "role", label: "Role", type: "text" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm password", type: "password" },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  function handleChange(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Account creation is connected when the backend auth contract is available.
    navigate("/login");
  }

  return (
    <main className="register-page">
      <section className="register-brand">
        <h1>
          Stock<span>Guard</span>
        </h1>
        <p>Safe Stock. Healthy Communities.</p>
        <h2>Smarter healthcare inventory management.</h2>
        <p>
          Support healthcare facilities as they manage medicine inventory and
          supply.
        </p>
      </section>
      <section className="register-panel">
        <h2>Create your account</h2>
        <p>Enter your details to get started.</p>
        <form className="register-form" onSubmit={handleSubmit}>
          {fields.map(({ name, label, type }) => (
            <label key={name} htmlFor={name}>
              {label}
              <input
                id={name}
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                required
              />
            </label>
          ))}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit">
            Create account
          </button>
        </form>
        <p className="register-login">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
