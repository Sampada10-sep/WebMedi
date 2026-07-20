function Dashboard({ onNavigate, onLogout }) {
  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>💊</span>
          <h2>MediReminder</h2>
        </div>

        <nav className="sidebar-menu">
          <button
            className="menu-button active"
            onClick={() => onNavigate("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className="menu-button"
            onClick={() => onNavigate("add-medicine")}
          >
            ➕ Add Medicine
          </button>

          <button
            className="menu-button"
            onClick={() => onNavigate("medicines")}
          >
            💊 My Medicines
          </button>

          <button
            className="menu-button"
            onClick={() => onNavigate("profile")}
          >
            👤 Profile
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, Sampada 👋</h1>
            <p>Manage your medicines and daily reminders.</p>
          </div>

          <div className="user-avatar">S</div>
        </header>

        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">💊</div>
            <div>
              <p>Total Medicines</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div>
              <p>Today's Reminders</p>
              <h2>0</h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div>
              <p>Active Medicines</p>
              <h2>0</h2>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-grid">
            <button
              className="action-card"
              onClick={() => onNavigate("add-medicine")}
            >
              <span>➕</span>
              <div>
                <h3>Add Medicine</h3>
                <p>Create a new medicine reminder.</p>
              </div>
            </button>

            <button
              className="action-card"
              onClick={() => onNavigate("medicines")}
            >
              <span>💊</span>
              <div>
                <h3>My Medicines</h3>
                <p>View, edit and delete medicines.</p>
              </div>
            </button>

            <button
              className="action-card"
              onClick={() => onNavigate("profile")}
            >
              <span>👤</span>
              <div>
                <h3>My Profile</h3>
                <p>View your personal information.</p>
              </div>
            </button>
          </div>
        </section>

        <section className="today-section">
          <div className="section-title">
            <h2>Today's Medicines</h2>

            <button onClick={() => onNavigate("medicines")}>
              View all
            </button>
          </div>

          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No medicines added yet</h3>
            <p>Add your first medicine to start receiving reminders.</p>

            <button onClick={() => onNavigate("add-medicine")}>
              Add Medicine
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;