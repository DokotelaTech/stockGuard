import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        clinic: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        console.log(formData);
    };

    const inputStyle = {
        width: '100%',
        padding: '13px',
        border: '1px solid #dce3e8',
        borderRadius: '8px',
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '7px'
    };

    const labelStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: '#334155'
    };

    return (
        <div className="auth-layout" style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f8fafc'
        }}>

            {/* LEFT SIDE */}
            <div className="auth-brand" style={{
                width: '50%',
                backgroundColor: '#0f172a',
                color: 'white',
                padding: '60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}>

                <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>
                    Stock<span style={{ color: '#10b981' }}>Guard</span>
                </h1>

                <p style={{
                    color: '#94a3b8',
                    fontSize: '15px',
                    marginBottom: '50px'
                }}>
                    Safe Stock. Healthy Communities.
                </p>

                <h2 style={{
                    fontSize: '34px',
                    lineHeight: '1.3',
                    marginBottom: '20px'
                }}>
                    Welcome to smarter healthcare inventory management.
                </h2>

                <p style={{
                    color: '#cbd5e1',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    maxWidth: '450px'
                }}>
                    Join StockGuard and help healthcare facilities
                    prevent medicine shortages, reduce expiry waste
                    and improve medicine distribution.
                </p>

                <div style={{
                    marginTop: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                }}>

                    <p>✓ AI-powered medicine demand forecasting</p>
                    <p>✓ Smart medicine redistribution</p>
                    <p>✓ Secure blockchain batch verification</p>

                </div>

                <p style={{
                    color: '#64748b',
                    fontSize: '12px',
                    marginTop: '70px'
                }}>
                    © 2026 StockGuard. All rights reserved.
                </p>

            </div>


            {/* RIGHT SIDE */}
            <div className="auth-panel" style={{
                width: '50%',
                padding: '45px 70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}>

                <h2 style={{
                    color: '#0f172a',
                    fontSize: '28px',
                    marginBottom: '8px'
                }}>
                    Create your account
                </h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '25px'
                }}>
                    Enter your details to get started with StockGuard.
                </p>


                <form onSubmit={handleSubmit}>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '18px'
                    }}>

                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input
                                style={inputStyle}
                                type="text"
                                name="name"
                                placeholder="Enter first name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Surname</label>
                            <input
                                style={inputStyle}
                                type="text"
                                name="surname"
                                placeholder="Enter surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            style={inputStyle}
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Phone Number</label>
                        <input
                            style={inputStyle}
                            type="tel"
                            name="phone"
                            placeholder="+27 00 000 0000"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Clinic / Healthcare Facility</label>
                        <input
                            style={inputStyle}
                            type="text"
                            name="clinic"
                            placeholder="Enter clinic name"
                            value={formData.clinic}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Your Role</label>
                        <select
                            style={inputStyle}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select your role</option>
                            <option value="clinic_admin">Clinic Administrator</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="stock_manager">Stock Manager</option>
                            <option value="healthcare_worker">Healthcare Worker</option>
                            <option value="warehouse_manager">Warehouse Manager</option>
                        </select>
                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div style={{ marginTop: '18px' }}>
                        <label style={labelStyle}>Confirm Password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '25px'
                        }}
                    >
                        Create Account 
                    </button>

                </form>

                <p style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#64748b',
                    marginTop: '20px'
                }}>
                    Already have an account?
                    <Link to="/login" style={{
                        color: '#059669',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '5px'
                    }}>
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}
