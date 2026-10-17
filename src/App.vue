<template>
  <div class="app-root">
    <!-- Top Navigation Bar (When logged in) -->
    <header v-if="store.currentUser" class="app-navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="nav-brand" @click="store.navigate('board')">
          <div class="brand-logo">Hr</div>
          <span class="brand-name">Holdr<span class="brand-dot">.</span></span>
        </div>

        <!-- Links -->
        <nav class="nav-links">
          <button
            :class="['nav-link', store.view === 'board' && 'active']"
            @click="store.navigate('board')"
          >
            <ClipboardList :size="16" />
            Job Board
          </button>
          
          <button
            v-if="store.isClient"
            :class="['nav-link', store.view === 'createJob' && 'active']"
            @click="store.navigate('createJob')"
          >
            <Plus :size="16" />
            Post a Job
          </button>

          <button
            :class="['nav-link', store.view === 'wallet' && 'active']"
            @click="store.navigate('wallet')"
          >
            <Wallet :size="16" />
            Wallet
          </button>
        </nav>

        <!-- Right Side: User Controls -->
        <div class="nav-user">
          <button
            class="role-switch-btn"
            @click="store.switchUser"
            :title="`Switch role to ${store.isClient ? 'Freelancer' : 'Client'}`"
          >
            <span class="role-icon">
              <Building2 v-if="store.isClient" :size="15" />
              <Laptop v-else :size="15" />
              {{ store.isClient ? 'Client' : 'Freelancer' }}
            </span>
            <span class="switch-hint">
              <Repeat2 :size="14" />
              Switch
            </span>
          </button>

          <div class="user-pill" @click="store.navigate('wallet')">
            {{ store.currentUser.full_name.charAt(0) }}
            <span class="user-name">{{ store.currentUser.full_name }}</span>
          </div>

          <button class="btn btn-ghost btn-sm logout-btn" @click="store.logout" title="Sign Out">
            <LogOut :size="16" />
            Logout
          </button>
        </div>
      </div>
    </header>
    <div v-if="store.toast.visible" class="global-toast">
  {{ store.toast.message }}
</div>

    <!-- Main Content Area -->
    <main class="app-main">
      <div class="main-container">
        <transition name="fade" mode="out-in">
          <AuthView v-if="store.view === 'auth'" />
          <JobBoard v-else-if="store.view === 'board'" />
          <CreateJob v-else-if="store.view === 'createJob'" />
          <JobDetail v-else-if="store.view === 'jobDetail'" />
          <PayNow v-else-if="store.view === 'payNow'" />
          <SubmitWork v-else-if="store.view === 'submitWork'" />
          
          <WalletView v-else-if="store.view === 'wallet'" />
          <div v-else class="empty-state">
            <h3>Page Not Found</h3>
            <button class="btn btn-primary mt-4" @click="store.navigate('board')">
              Go to Job Board
              <ArrowRight :size="16" />
            </button>
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer v-if="store.currentUser" class="app-footer">
      <div class="footer-container">
        <div class="footer-info">
          <span><ShieldCheck :size="15" /> 256-bit Bank Grade Vault Escrow</span>
          <span><Zap :size="15" /> Instant Settlement via Kora Rails</span>
          <span><Scale :size="15" /> Automated Milestone Arbitration</span>
        </div>
        <div class="footer-copy">
          © 2026 Holdr Escrow Infrastructure · Powered by Kora rails
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { store } from './store.js'
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Laptop,
  LogOut,
  Plus,
  Repeat2,
  Scale,
  ShieldCheck,
  Wallet,
  Zap,
} from 'lucide-vue-next'
import AuthView from './components/AuthView.vue'
import JobBoard from './components/JobBoard.vue'
import CreateJob from './components/CreateJob.vue'
import JobDetail from './components/JobDetail.vue'
import PayNow from './components/PayNow.vue'
import SubmitWork from './components/SubmitWork.vue'
import WalletView from './components/WalletView.vue'
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 23, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: -0.04em;
}
.brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.brand-dot {
  color: var(--accent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.role-icon,
.switch-hint,
.logout-btn,
.footer-info span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}
.nav-link.active {
  color: var(--text-primary);
  background: var(--bg-card);
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s;
}
.role-switch-btn:hover {
  background: var(--bg-card);
  border-color: var(--accent);
}
.switch-hint {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.75rem;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 99px;
  transition: background 0.2s;
}
.user-pill:hover {
  background: var(--bg-surface);
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}
.user-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.logout-btn {
  font-size: 0.85rem;
  padding: 6px 10px;
}

.app-main {
  flex: 1;
  padding: 32px 20px 60px;
}
.main-container {
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  padding: 24px 20px;
  margin-top: auto;
}
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
}
.footer-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 12px;
  }
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: space-around;
  }
  .user-name {
    display: none;
  }
}
</style>
