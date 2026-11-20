import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../../firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";

import {
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

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

            // 1. Create Firebase Authentication account

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email.trim().toLowerCase(),
                formData.password
            );

            const user = userCredential.user;

            // 2. Update Firebase display name

            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            // 3. Save additional user information in Firestore

            await setDoc(doc(db, "users", user.uid), {

                uid: user.uid,

                firstName: formData.firstName.trim(),

                lastName: formData.lastName.trim(),

                email: formData.email.trim().toLowerCase(),

                phone: formData.phone.trim(),

                clinic: formData.clinic.trim(),

                role: formData.role,

                createdAt: serverTimestamp()

            });

            // Firebase keeps the newly created user signed in, so go straight
            // to the app instead of asking them to sign in a second time.
            navigate("/dashboard", { replace: true });

        } catch (error) {

            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                setError("This email is already registered.");
            }
            else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            }
            else if (error.code === "auth/weak-password") {
                setError("Your password is too weak.");
            }
            else if (error.code === "permission-denied") {
                setError("Unable to save your profile. Please check your Firestore permissions.");
            }
            else {
                setError("Registration failed. Please try again.");
            }

        } finally {

            setLoading(false);

        }

    }

    return (

        <main className="register-page">

            {/* LEFT SECTION */}

            <section className="register-brand">

                <h1>
                    Stock<span>Guard</span>
                </h1>

                <p>Safe Stock. Healthy Communities.</p>

                <h2>Smarter healthcare inventory management.</h2>

                <p>
                    Support healthcare facilities as they manage
                    medicine inventory and supply.
                </p>

            </section>


            {/* RIGHT SECTION */}

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


                    {/* USER ROLE */}

                    <label htmlFor="role">

                        Your Role

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

                    </label>


                    {/* PASSWORD */}

                    <label htmlFor="password">

                        Password

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </label>


                    {/* CONFIRM PASSWORD */}

                    <label htmlFor="confirmPassword">

                        Confirm password

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                    </label>


                    {/* ERROR MESSAGE */}

                    {error && (

                        <p className="form-error" role="alert">
                            {error}
                        </p>

                    )}


                    {/* SUBMIT */}

                    <button
                        className="button button-primary"
                        type="submit"
                        disabled={loading}
                    >

                        {loading ? "Creating account..." : "Create account"}

                    </button>

                </form>


                <p className="register-login">

                    Already have an account?

                    <Link to="/login"> Sign in</Link>

                </p>

            </section>

        </main>

    );

}
