import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(formData);
    };

    const inputStyle = {
        width: '100%',
        padding: '14px',
        border: '1px solid #dce3e8',
        borderRadius: '8px',
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginTop: '8px'
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

                <h1 style={{
                    fontSize: '36px',
                    marginBottom: '10px'
                }}>
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
                    fontSize: '36px',
                    lineHeight: '1.3',
                    marginBottom: '20px'
                }}>
                    Welcome Back!
                    <br />
                    Your healthcare supply chain starts here.
                </h2>

                <p style={{
                    color: '#cbd5e1',
                    fontSize: '16px',
                    lineHeight: '1.8',
                    maxWidth: '450px'
                }}>
                    Manage medicine inventory, monitor stock levels
                    and prevent medicine shortages with intelligent
                    healthcare inventory management.
                </p>

                <div style={{
                    marginTop: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                }}>

                    <p>✓ Monitor medicine inventory in real time</p>

                    <p>✓ Predict medicine shortages using AI</p>

                    <p>✓ Track medicine batches securely</p>

                    <p>✓ Redistribute medicines between clinics</p>

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
                padding: '60px 80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box'
            }}>

                <h2 style={{
                    color: '#0f172a',
                    fontSize: '30px',
                    marginBottom: '10px'
                }}>
                    Sign in to StockGuard
                </h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '40px'
                }}>
                    Enter your account details to access your dashboard.
                </p>


                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <div style={{ marginBottom: '25px' }}>

                        <label style={labelStyle}>
                            Email Address
                        </label>

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


                    {/* PASSWORD */}

                    <div style={{ marginBottom: '20px' }}>

                        <label style={labelStyle}>
                            Password
                        </label>

                        <input
                            style={inputStyle}
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* REMEMBER ME + FORGOT PASSWORD */}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        fontSize: '13px'
                    }}>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            color: '#475569'
                        }}>

                            <input type="checkbox" />

                            Remember me

                        </label>

                        <span style={{
                            color: '#059669',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Forgot Password?
                        </span>

                    </div>


                    {/* LOGIN BUTTON */}

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
                            cursor: 'pointer'
                        }}
                    >
                        Sign In 
                    </button>

                </form>


                {/* SIGNUP LINK */}

                <p style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#64748b',
                    marginTop: '30px'
                }}>

                    Don't have an account?

                    <Link to="/signup" style={{
                        color: '#059669',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '5px'
                    }}>
                        Create Account
                    </Link>

                </p>

            </div>

        </div>
    );
}
