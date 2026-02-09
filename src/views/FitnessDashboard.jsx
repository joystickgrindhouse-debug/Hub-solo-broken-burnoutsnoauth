import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function getBmiCategory(bmi) {
  if (!bmi) return { label: "Unknown", color: "#666" };
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal", color: "#22c55e" };
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
}

function getBmiNeedleAngle(bmi) {
  if (!bmi) return -90;
  const clamped = Math.min(Math.max(bmi, 15), 40);
  return ((clamped - 15) / 25) * 180 - 90;
}

export default function FitnessDashboard({ user, userProfile }) {
  const navigate = useNavigate();
  const t = useTheme();
  const isPro = userProfile?.subscriptionStatus === "active";

  const age = userProfile?.age || "—";
  const gender = userProfile?.gender || "—";
  const height = userProfile?.height || "—";
  const weight = userProfile?.weight ? `${userProfile.weight} lbs` : "—";
  const bmi = userProfile?.bmi || null;
  const fitnessLevel = userProfile?.fitnessLevel || "—";
  const goals = userProfile?.goals || "—";
  const workoutFrequency = userProfile?.workoutFrequency || "—";
  const reason = userProfile?.reason || "—";
  const injuries = userProfile?.injuries || "None";
  const totalReps = userProfile?.totalReps || 0;
  const totalMiles = userProfile?.totalMiles || 0;
  const ticketBalance = userProfile?.ticketBalance || 0;
  const currentStreak = userProfile?.currentStreak || 0;

  const bmiCat = getBmiCategory(bmi);
  const needleAngle = getBmiNeedleAngle(bmi);

  const [aiPlanExpanded, setAiPlanExpanded] = useState(false);

  const statCards = [
    { icon: "💪", value: totalReps.toLocaleString(), label: "Total Reps" },
    { icon: "🏃", value: totalMiles.toFixed(1), label: "Miles Run" },
    { icon: "🔥", value: currentStreak, label: "Day Streak" },
    { icon: "🎟️", value: ticketBalance, label: "Tickets" },
  ];

  const biometrics = [
    { label: "Age", value: age },
    { label: "Gender", value: gender },
    { label: "Height", value: height },
    { label: "Weight", value: weight },
    { label: "Fitness Level", value: fitnessLevel },
    { label: "Workout Days/Week", value: workoutFrequency },
    { label: "Injuries", value: injuries },
  ];

  const s = {
    page: {
      padding: "16px 12px",
      minHeight: "100vh",
      maxWidth: "700px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    dot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: t.dot,
      boxShadow: `0 0 18px ${t.dotShadow}`,
    },
    title: {
      fontSize: "13px",
      fontWeight: 800,
      color: t.accent,
      margin: 0,
      fontFamily: "'Press Start 2P', cursive",
      textShadow: `0 0 10px ${t.shadowMd}`,
    },
    editBtn: {
      background: "transparent",
      border: `1px solid ${t.shadowSm}`,
      color: t.accent,
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "9px",
      fontFamily: "'Press Start 2P', cursive",
      cursor: "pointer",
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "8px",
      marginBottom: "20px",
    },
    statCard: {
      background: t.shadowXxs,
      border: `1px solid ${t.shadowXs}`,
      borderRadius: "12px",
      padding: "12px 6px",
      textAlign: "center",
    },
    statIcon: {
      fontSize: "20px",
      marginBottom: "4px",
    },
    statValue: {
      color: t.accent,
      fontSize: "16px",
      fontWeight: "bold",
      fontFamily: "'Press Start 2P', cursive",
      textShadow: `0 0 8px ${t.shadowMd}`,
    },
    statLabel: {
      color: "rgba(255,255,255,0.5)",
      fontSize: "9px",
      marginTop: "4px",
      letterSpacing: "0.5px",
    },
    bmiSection: {
      background: t.shadowXxs,
      border: `1px solid ${t.shadowXs}`,
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
      textAlign: "center",
    },
    sectionTitle: {
      color: t.accent,
      fontSize: "10px",
      fontFamily: "'Press Start 2P', cursive",
      letterSpacing: "1px",
      marginBottom: "12px",
      textShadow: `0 0 6px ${t.shadowSm}`,
    },
    bmiGauge: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    },
    bmiCategory: {
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "'Press Start 2P', cursive",
      letterSpacing: "1px",
    },
    gridTwo: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "16px",
    },
    card: {
      background: t.shadowXxs,
      border: `1px solid ${t.shadowXs}`,
      borderRadius: "16px",
      padding: "16px",
    },
    bioList: {
      display: "flex",
      flexDirection: "column",
      gap: "0",
    },
    bioRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    bioLabel: {
      color: "rgba(255,255,255,0.4)",
      fontSize: "10px",
      letterSpacing: "0.5px",
    },
    bioValue: {
      color: "#fff",
      fontSize: "12px",
      fontWeight: "bold",
      textAlign: "right",
    },
    objectiveItem: {
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    objLabel: {
      color: "rgba(255,255,255,0.4)",
      fontSize: "9px",
      letterSpacing: "1px",
      marginBottom: "6px",
    },
    objBadge: {
      display: "inline-block",
      background: t.shadowXs,
      border: `1px solid ${t.shadowSm}`,
      padding: "4px 10px",
      borderRadius: "6px",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "bold",
    },
    aiSection: {
      background: t.shadowXxs,
      border: `1px solid ${t.shadowXs}`,
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "16px",
    },
    proBadge: {
      background: `linear-gradient(135deg, ${t.accent}, ${t.shadowMd})`,
      color: "#fff",
      padding: "3px 8px",
      borderRadius: "4px",
      fontSize: "8px",
      fontWeight: "bold",
      fontFamily: "'Press Start 2P', cursive",
      letterSpacing: "1px",
    },
    aiDesc: {
      color: "rgba(255,255,255,0.7)",
      fontSize: "13px",
      lineHeight: "1.6",
      marginBottom: "16px",
    },
    aiActions: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    aiBtn: {
      background: `linear-gradient(135deg, ${t.accent}, ${t.shadowMd})`,
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "11px",
      fontFamily: "'Press Start 2P', cursive",
      cursor: "pointer",
      boxShadow: `0 2px 10px ${t.shadowSm}`,
    },
    aiBtnOutline: {
      background: "transparent",
      color: t.accent,
      border: `1px solid ${t.shadowSm}`,
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "11px",
      fontFamily: "'Press Start 2P', cursive",
      cursor: "pointer",
    },
    aiPlanDetails: {
      marginTop: "16px",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "8px",
      padding: "12px",
      border: `1px solid ${t.shadowXs}`,
    },
    aiPlanRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      color: "rgba(255,255,255,0.7)",
      fontSize: "12px",
    },
    lockedOverlay: {
      textAlign: "center",
      padding: "20px 10px",
      background: "rgba(0,0,0,0.3)",
      borderRadius: "12px",
      border: `1px dashed ${t.shadowSm}`,
    },
    lockIcon: {
      fontSize: "36px",
      marginBottom: "12px",
    },
    lockText: {
      color: "rgba(255,255,255,0.5)",
      fontSize: "13px",
      lineHeight: "1.6",
      marginBottom: "16px",
      maxWidth: "300px",
      margin: "0 auto 16px",
    },
    unlockBtn: {
      background: `linear-gradient(135deg, ${t.accent}, ${t.shadowMd})`,
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "11px",
      fontFamily: "'Press Start 2P', cursive",
      cursor: "pointer",
      boxShadow: `0 2px 15px ${t.shadowSm}`,
      letterSpacing: "1px",
    },
    emptyState: {
      textAlign: "center",
      padding: "30px 20px",
      background: t.shadowXxs,
      border: `1px dashed ${t.shadowXs}`,
      borderRadius: "16px",
    },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.dot} />
          <h1 style={s.title}>FITNESS DASHBOARD</h1>
        </div>
        <button onClick={() => navigate("/profile")} style={s.editBtn}>EDIT PROFILE</button>
      </div>

      <div style={s.statsRow}>
        {statCards.map((c, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statIcon}>{c.icon}</div>
            <div style={s.statValue}>{c.value}</div>
            <div style={s.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={s.bmiSection}>
        <div style={s.sectionTitle}>BMI ANALYSIS</div>
        <div style={s.bmiGauge}>
          <svg viewBox="0 0 200 110" style={{ width: "100%", maxWidth: "240px" }}>
            <defs>
              <linearGradient id="bmiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="30%" stopColor="#22c55e" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#bmiGrad)" strokeWidth="12" strokeLinecap="round" />
            <line
              x1="100" y1="100"
              x2={100 + 55 * Math.cos((needleAngle * Math.PI) / 180)}
              y2={100 + 55 * Math.sin((needleAngle * Math.PI) / 180)}
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="5" fill={t.accent} />
            <text x="100" y="80" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="bold" fontFamily="'Press Start 2P', cursive">
              {bmi ? bmi : "—"}
            </text>
          </svg>
          <div style={{ ...s.bmiCategory, color: bmiCat.color }}>{bmiCat.label}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.5rem", marginTop: "4px", fontStyle: "italic", textAlign: "center", maxWidth: "200px" }}>BMI is a general estimate and does not account for muscle mass or body composition</div>
        </div>
      </div>

      <div style={s.gridTwo}>
        <div style={s.card}>
          <div style={s.sectionTitle}>BIOMETRICS</div>
          <div style={s.bioList}>
            {biometrics.map((b, i) => (
              <div key={i} style={s.bioRow}>
                <span style={s.bioLabel}>{b.label}</span>
                <span style={s.bioValue}>{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>OBJECTIVES</div>
          <div style={s.objectiveItem}>
            <div style={s.objLabel}>PRIMARY GOAL</div>
            <div style={s.objBadge}>{goals}</div>
          </div>
          <div style={s.objectiveItem}>
            <div style={s.objLabel}>MOTIVATION</div>
            <div style={s.objBadge}>{reason}</div>
          </div>
          <div style={{ ...s.objectiveItem, borderBottom: "none" }}>
            <div style={s.objLabel}>FITNESS LEVEL</div>
            <div style={s.objBadge}>{fitnessLevel}</div>
          </div>
        </div>
      </div>

      <div style={s.aiSection}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={s.sectionTitle}>AI TRAINING PLAN</div>
          {isPro && <span style={s.proBadge}>PRO</span>}
        </div>

        {isPro ? (
          <div>
            <p style={s.aiDesc}>
              Your personalized training plan is generated based on your biometrics, goals, and progress. 
              Ask your AI Coach to build or update your plan anytime.
            </p>
            <div style={s.aiActions}>
              <button onClick={() => navigate("/profile")} style={s.aiBtn}>
                Ask Coach for Plan
              </button>
              <button onClick={() => setAiPlanExpanded(!aiPlanExpanded)} style={s.aiBtnOutline}>
                {aiPlanExpanded ? "Hide Details" : "View Details"}
              </button>
            </div>
            {aiPlanExpanded && (
              <div style={s.aiPlanDetails}>
                <div style={s.aiPlanRow}>
                  <span>Custom Workout Builder</span>
                  <span style={{ color: "#22c55e" }}>Active</span>
                </div>
                <div style={s.aiPlanRow}>
                  <span>Personalized Meal Plans</span>
                  <span style={{ color: "#22c55e" }}>Active</span>
                </div>
                <div style={s.aiPlanRow}>
                  <span>Goal Tracking & Analytics</span>
                  <span style={{ color: "#22c55e" }}>Active</span>
                </div>
                <div style={s.aiPlanRow}>
                  <span>Injury Prevention Guidance</span>
                  <span style={{ color: "#22c55e" }}>Active</span>
                </div>
                <div style={{ ...s.aiPlanRow, borderBottom: "none" }}>
                  <span>Progress Reports</span>
                  <span style={{ color: "#22c55e" }}>Active</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={s.lockedOverlay}>
            <div style={s.lockIcon}>🔒</div>
            <p style={s.lockText}>
              Unlock your personalized AI training plan, custom meal plans, goal tracking, and advanced analytics.
            </p>
            <button onClick={() => navigate("/subscription")} style={s.unlockBtn}>
              UNLOCK WITH PRO
            </button>
          </div>
        )}
      </div>

      {(!userProfile?.bmi && !userProfile?.goals) && (
        <div style={s.emptyState}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>📊</div>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "16px" }}>
            Complete your Biometric Intake with the AI Coach to populate your dashboard.
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
            Type <span style={{ color: t.accent, fontFamily: "'Press Start 2P', cursive", fontSize: "10px" }}>/tour</span> in the chat to restart the intake process.
          </p>
        </div>
      )}
    </div>
  );
}
