export default function Home() {
  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <p>Welcome back! Please login to your account.</p>

        <form>
          <div className="form-group">
            <label htmlFor="email">Email or Username</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email or username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </main>
  );
}