<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="auth-orb orb-1"></div>
      <div class="auth-orb orb-2"></div>
      <div class="auth-orb orb-3"></div>
    </div>

    <div class="auth-container">
      <div class="auth-brand">
        <div class="auth-logo">Hr</div>
        <h1 class="auth-title">Holdr<span style="color: var(--accent)">.</span></h1>
        <p class="auth-subtitle">Pan-African milestone escrow infrastructure</p>
      </div>

      <div class="auth-card">
        <div class="auth-tabs">
          <button :class="['tab', mode === 'login' && 'active']" @click="switchMode('login')">Sign In</button>
          <button :class="['tab', mode === 'register' && 'active']" @click="switchMode('register')">Create Account</button>
        </div>

        <transition name="fade-slide" mode="out-in">
          <div :key="mode">
            <div v-if="error" class="alert alert-error">⚠️ {{ error }}</div>

            <!-- LOGIN -->
            <form v-if="mode === 'login'" class="auth-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input id="login-email" v-model="lf.email" type="email" class="form-input" placeholder="you@example.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input id="login-password" v-model="lf.password" type="password" class="form-input" placeholder="••••••••" required />
              </div>
              <button id="login-submit" type="submit" class="btn btn-primary btn-lg btn-full" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Signing in…' : 'Sign In' }}
              </button>


            </form>

            <!-- REGISTER -->
            <form v-else class="auth-form" @submit.prevent="handleRegister">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input id="reg-name" v-model="rf.fullName" type="text" class="form-input" placeholder="Jane Doe" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input id="reg-email" v-model="rf.email" type="email" class="form-input" placeholder="you@example.com" required />
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input id="reg-password" v-model="rf.password" type="password" class="form-input" placeholder="Min. 8 characters" required />
                <span class="form-hint">At least 8 characters</span>
              </div>
              <div class="form-group">
                <label class="form-label">I am a…</label>
                <div class="role-picker">
                  <button type="button" :class="['role-opt', rf.role === 'client' && 'active']" @click="rf.role = 'client'">
                    <span class="role-emoji">🏢</span>
                    <div>
                      <div class="role-name">Client</div>
                      <div class="role-desc">I hire freelancers</div>
                    </div>
                  </button>
                  <button type="button" :class="['role-opt', rf.role === 'freelancer' && 'active']" @click="rf.role = 'freelancer'">
                    <span class="role-emoji">💻</span>
                    <div>
                      <div class="role-name">Freelancer</div>
                      <div class="role-desc">I offer services</div>
                    </div>
                  </button>
                </div>
              </div>
              <button id="reg-submit" type="submit" class="btn btn-primary btn-lg btn-full" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Creating account…' : 'Create Account' }}
              </button>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { store } from '../store.js'

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const lf = reactive({ email: '', password: '' })
const rf = reactive({ fullName: '', email: '', password: '', role: 'client' })

function switchMode(m) { mode.value = m; error.value = '' }
const delay = ms => new Promise(r => setTimeout(r, ms))

async function handleLogin() {
  error.value = ''
  if (!lf.email || !lf.password) { error.value = 'Please fill in all fields'; return }
  loading.value = true
  try { await delay(500); store.login(lf.email, lf.password) }
  catch (e) { error.value = e.response?.data?.detail || 'Something went wrong' }
  finally { loading.value = false }
}

async function handleRegister() {
  error.value = ''
  if (!rf.fullName || !rf.email || !rf.password) { error.value = 'Please fill in all fields'; return }
  if (rf.password.length < 8) { error.value = 'Password must be at least 8 characters'; return }
  loading.value = true
  try { await delay(500); store.register({ ...rf }) }
  catch (e) { error.value = e.response?.data?.detail || 'Something went wrong' }
  finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.auth-bg { position: absolute; inset: 0; pointer-events: none; }
.auth-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.12;
}
.orb-1 { width: 600px; height: 600px; background: radial-gradient(#6366f1, transparent); top: -150px; left: -150px; }
.orb-2 { width: 500px; height: 500px; background: radial-gradient(#a855f7, transparent); bottom: -100px; right: -100px; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(#06b6d4, transparent); top: 40%; left: 40%; }

.auth-container { width: 100%; max-width: 440px; padding: 24px; position: relative; z-index: 1; animation: fadeIn 0.4s ease; }

.auth-brand { text-align: center; margin-bottom: 32px; }
.auth-logo {
  width: 60px; height: 60px; margin: 0 auto 16px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 900; color: white;
  box-shadow: 0 8px 32px rgba(99,102,241,0.4);
}
.auth-title {
  font-size: 2rem; font-weight: 900; margin-bottom: 8px;
  background: linear-gradient(135deg, #f0f4ff 30%, #818cf8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.auth-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.auth-tabs { display: flex; background: var(--bg-surface); border-radius: var(--radius-sm); padding: 4px; margin-bottom: 24px; gap: 4px; }
.tab {
  flex: 1; padding: 10px; border: none; background: transparent;
  color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;
  cursor: pointer; border-radius: 6px; transition: all 0.2s; font-family: inherit;
}
.tab.active { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

.auth-form { display: flex; flex-direction: column; gap: 20px; }

.alert {
  padding: 12px 16px; border-radius: var(--radius-sm);
  font-size: 0.875rem; margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.alert-error { background: var(--danger-bg); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); }

.role-picker { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 14px; border-radius: var(--radius-md);
  border: 2px solid var(--border); background: var(--bg-surface);
  cursor: pointer; transition: all 0.2s; text-align: left; font-family: inherit;
}
.role-opt:hover { border-color: var(--border-light); }
.role-opt.active { border-color: var(--accent); background: var(--accent-glow); }
.role-emoji { font-size: 1.4rem; }
.role-name { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
.role-desc { font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px; }

.demo-logins { margin-top: 16px; text-align: center; }
.demo-divider {
  display: flex; align-items: center; text-align: center; margin-bottom: 12px;
  color: var(--text-muted); font-size: 0.72rem; letter-spacing: 0.05em; font-weight: 700;
}
.demo-divider::before, .demo-divider::after {
  content: ''; flex: 1; border-bottom: 1px solid var(--border);
}
.demo-divider span { padding: 0 8px; }
.demo-btns { display: flex; gap: 8px; justify-content: center; }
.demo-btns button { font-size: 0.8rem; padding: 6px 12px; border: 1px solid var(--border); }
.demo-btns button:hover { background: var(--bg-surface); border-color: var(--accent); }

/* transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
