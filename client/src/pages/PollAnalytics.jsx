import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function PollAnalytics() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/polls/${id}`)
      .then((res) => setPoll(res.data));
    socket.emit("joinPoll", id);
    socket.on("pollUpdated", (updated) => setPoll(updated));
    return () => socket.off("pollUpdated");
  }, [id]);

  if (!poll) return <div style={styles.loader}>Synchronizing Data...</div>;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const sorted = [...poll.options].sort((a, b) => b.votes - a.votes);
  const top = sorted[0];
  const least = sorted[sorted.length - 1];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>System Analytics</h1>
          <div style={styles.liveBadge}>LIVE FEED</div>
        </div>

        <div style={styles.metricsRow}>
          <div style={styles.metricBox}>
            <p style={styles.mLabel}>Total Votes</p>
            <p style={styles.mVal}>{totalVotes}</p>
          </div>
          <div style={styles.metricBox}>
            <p style={styles.mLabel}>Current Leader</p>
            <p style={{ ...styles.mVal, color: "#00ABE4" }}>
              {top.votes > 0 ? top.text : "Pending..."}
            </p>
          </div>
        </div>

        <div style={styles.chartArea}>
          <h3 style={styles.sectionHeader}>Data Distribution</h3>
          {poll.options.map((opt, i) => {
            const pct =
              totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
            return (
              <div key={i} style={styles.barGroup}>
                <div style={styles.barInfo}>
                  <span style={styles.optionName}>{opt.text}</span>
                  <span style={styles.optionPct}>{pct}%</span>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.fill, width: `${pct}%` }}></div>
                </div>
                <p style={styles.voteCount}>{opt.votes} votes</p>
              </div>
            );
          })}
        </div>

        <div style={styles.insight}>
          <strong style={{ color: "#003366" }}>Performance Insight:</strong>
          <p style={styles.insightText}>
            The least engaged option is{" "}
            <span style={{ fontWeight: "bold" }}>"{least.text}"</span> with{" "}
            {least.votes} total interactions.
          </p>
        </div>

        <button onClick={() => window.print()} style={styles.printBtn}>
          Export Report
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100vw",
    background: "#E9F1FA",
    backgroundImage:
      "radial-gradient(circle at top left, #FFFFFF 0%, #E9F1FA 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
    fontFamily: '"Inter", sans-serif',
    margin: 0,
  },
  card: {
    background: "white",
    padding: "50px",
    borderRadius: "28px",
    boxShadow: "0 30px 60px rgba(0, 30, 60, 0.15)",
    width: "90%",
    maxWidth: "750px",
    border: "1px solid rgba(0, 171, 228, 0.1)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
  },
  title: { color: "#001E3C", fontSize: "34px", fontWeight: "900", margin: 0 },
  liveBadge: {
    background: "#00ABE4",
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  metricsRow: { display: "flex", gap: "20px", marginBottom: "45px" },
  metricBox: {
    flex: 1,
    background: "#FFFFFF",
    padding: "25px",
    borderRadius: "16px",
    border: "2px solid #E9F1FA",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  },
  mLabel: {
    fontSize: "13px",
    color: "#475569", // Darker Slate
    fontWeight: "800",
    textTransform: "uppercase",
    margin: "0 0 10px 0",
    letterSpacing: "0.5px",
  },
  mVal: { fontSize: "32px", fontWeight: "900", color: "#001E3C", margin: 0 },

  sectionHeader: {
    fontSize: "14px",
    color: "#003366",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "25px",
    borderBottom: "2px solid #E9F1FA",
    paddingBottom: "10px",
  },
  barGroup: { marginBottom: "25px" },
  barInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  optionName: { fontWeight: "700", color: "#1E293B", fontSize: "16px" }, // Darker Text
  optionPct: { fontWeight: "800", color: "#00ABE4", fontSize: "16px" },

  track: {
    height: "12px",
    background: "#E9F1FA",
    borderRadius: "6px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    background: "linear-gradient(90deg, #00ABE4, #0077B6)",
    borderRadius: "6px",
    transition: "width 1.2s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
  },
  voteCount: {
    fontSize: "12px",
    color: "#64748B",
    marginTop: "6px",
    fontWeight: "600",
  },

  insight: {
    marginTop: "40px",
    padding: "20px",
    borderRadius: "12px",
    borderLeft: "6px solid #003366",
    background: "#F8FAFC",
    fontSize: "15px",
    textAlign: "left",
  },
  insightText: { color: "#1E293B", margin: "8px 0 0 0", lineHeight: "1.5" },

  printBtn: {
    marginTop: "30px",
    background: "none",
    border: "2px solid #E9F1FA",
    color: "#64748B",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "0.3s",
  },

  loader: {
    color: "#003366",
    textAlign: "center",
    marginTop: "40vh",
    fontSize: "20px",
    fontWeight: "900",
    fontFamily: '"Inter", sans-serif',
  },
};
