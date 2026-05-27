import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    // Frontend placeholder until backend reset-password endpoint is added.
    setMessage(`If an account exists for ${email}, a reset link will be sent.`);
  };

  return (
    <>
      <header>
        <h1>Forgot Password</h1>
        <p>Enter your email to receive password reset instructions.</p>
        <small>{message}</small>
      </header>
      <section className="card">
        <h2>Reset Password</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleSubmit} disabled={!email.trim()}>Send Reset Link</button>
        <p><Link to="/auth/login">Back to Login</Link></p>
      </section>
    </>
  );
}
