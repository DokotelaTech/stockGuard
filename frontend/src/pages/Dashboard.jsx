import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { auth, db } from "../firebase.js";

import { onAuthStateChanged } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import {
    Activity,
    ArrowRight,
    Boxes,
    Pill,
    ShieldCheck
} from "lucide-react";

import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import ExpiryAlerts from "../components/dashboard/ExpiryAlerts";
import ForecastCard from "../components/dashboard/ForecastCard";
import StockChart from "../components/dashboard/StockChart";
import StockSummary from "../components/dashboard/StockSummary";
import formatDate from "../utils/formatDate";


export default function Dashboard() {

    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // GET LOGGED-IN USER DETAILS

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (!user) {

                navigate("/login", { replace: true });

                return;

            }

            try {

                const userRef = doc(db, "users", user.uid);

                const userSnapshot = await getDoc(userRef);

                if (!userSnapshot.exists()) {

                    setError("User profile not found.");

                    return;

                }

                const data = userSnapshot.data();

                setUserData(data);

            } catch (err) {

                console.error("Dashboard error:", err);

                setError("Unable to load your account information.");

            } finally {

                setLoading(false);

            }

        });

        return () => unsubscribe();

    }, [navigate]);


    // LOADING STATE

    if (loading) {

        return <div style={{ padding: "30px" }}>Loading your dashboard...</div>;

    }


    // ERROR STATE

    if (error) {

        return <div style={{ padding: "30px", color: "#dc2626" }}>{error}</div>;

    }


    if (!userData) {

        return null;

    }


    return (

        <>

            {/* PAGE HEADER */}

            <PageHeader
                title={`Welcome, ${userData.firstName}!`}
                description={`Overview of your clinic inventory · ${formatDate(new Date())}`}
            />


            {/* USER INFORMATION */}

            <section style={{
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                marginBottom: "25px"
            }}>

                <h2 style={{
                    fontSize: "18px",
                    color: "#0f172a",
                    marginBottom: "15px"
                }}>

                    Your Account Information

                </h2>

                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "30px"
                }}>

                    <div>
                        <small>Full Name</small>
                        <p>{userData.firstName} {userData.lastName}</p>
                    </div>

                    <div>
                        <small>Email Address</small>
                        <p>{userData.email}</p>
                    </div>

                    <div>
                        <small>Phone Number</small>
                        <p>{userData.phone}</p>
                    </div>

                    <div>
                        <small>Clinic</small>
                        <p>{userData.clinic}</p>
                    </div>

                    <div>
                        <small>Role</small>
                        <p>{userData.role?.replaceAll("_", " ")}</p>
                    </div>

                </div>

            </section>


            {/* STOCK SUMMARY */}

            <StockSummary />


            {/* DASHBOARD CONTENT */}

            <section className="dashboard-grid">

                <StockChart />

                <ExpiryAlerts />

                <ForecastCard />


                {/* RECENT ACTIVITY */}

                <article className="card activity-card">

                    <div className="card-heading">

                        <div>
                            <Activity size={19} className="heading-icon blue-text" />

                            <div>
                                <h2>Recent Activity</h2>
                                <p>Latest updates from your clinic</p>
                            </div>
                        </div>

                    </div>

                    <EmptyState>
                        Recent activity will appear here when data is available.
                    </EmptyState>

                </article>


                {/* MEDICINE INVENTORY */}

                <article className="card medicine-card">

                    <div className="card-heading">

                        <div>
                            <Boxes size={19} className="heading-icon blue-text" />

                            <div>
                                <h2>Medicine Inventory</h2>
                                <p>Quick view of clinic stock</p>
                            </div>
                        </div>

                        <Link className="text-link" to="/inventory">

                            View inventory <ArrowRight size={14} />

                        </Link>

                    </div>

                    <EmptyState>

                        <Pill size={21} />

                        Inventory details will appear here when data is available.

                    </EmptyState>

                </article>


                {/* STOCKGUARD PROMO */}

                <article className="promo-card">

                    <div className="promo-brand">

                        <ShieldCheck size={22} />

                        Stock<span>Guard</span>

                    </div>

                    <h2>
                        Smarter decisions.
                        <br />
                        Healthier tomorrow.
                    </h2>

                    <p>
                        Manage stock, monitor batches, and support clinic teams.
                    </p>

                    <Link to="/blockchain" className="button button-primary">

                        Explore traceability <ArrowRight size={15} />

                    </Link>

                </article>

            </section>

        </>

    );

}
