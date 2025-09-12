import React, { useState } from "react";
import z from "zod";
import { supabase } from "../lib/supabase";

const schema = z.object({
  password: z
    .string()
    .trim()
    .min(8, "Please enter at least 8 characters.")
    .max(64, "Please enter fewer than 64 characters."),
});

export default function ForgetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Validate with Zod
      const result = schema.safeParse({ password });

      if (!result.success) {
        setError(result.error.issues[0].message);
        return; // Stop execution if validation fails
      }

      setError(""); // Clear previous errors

      // Call Supabase API inside try/catch
      const { _, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error(" Supabase Error:", error.message);
        alert(" Failed to update password: " + error.message);
        return;
      }

      // If success
      alert("✅ Password successfully updated!");

      // Reset form
      setPassword("");
      setShowPassword(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("⚠️ Something went wrong. Please try again.");
    }
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "24px",
          borderRadius: "12px",
          width: "320px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        {/* Label */}
        <label
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "black",
          }}
        >
          Enter New Password
        </label>

        {/* Input */}
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />

        {/* Toggle Show/Hide Password */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "12px",
            gap: "6px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
            style={{ cursor: "pointer" }}
          />
          Show Password
        </label>

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: "red",
              fontSize: "12px",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
