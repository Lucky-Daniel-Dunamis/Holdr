<template>
  <div class="pay-now">
    <button class="btn btn-ghost btn-sm back-btn" @click="store.navigate('jobDetail', { jobId: store.selectedJobId })">← Back</button>

    <!-- SUMMARY -->
    <div v-if="step === 'summary' && job" class="pay-wrap">
      <div class="pay-header">
        <div class="pay-icon-wrap">🔒</div>
        <h1>Secure Payment</h1>
        <p class="text-muted">Your money is held safely in escrow — never touches the freelancer until you approve.</p>
      </div>
      <div class="card pay-card">
        <h3 class="section-title">Payment Summary</h3>
        <div class="job-block">
          <div class="job-block-title">{{ job.title }}</div>
          <div class="text-muted text-sm">{{ job.milestones.length }} milestone{{ job.milestones.length !== 1 ? 's' : '' }}</div>
        </div>
        <div class="ms-summary-list">
          <div v-for="(m, i) in job.milestones" :key="m.id" class="ms-summary-row">
            <span class="text-muted text-sm">{{ i + 1 }}. {{ m.title }}</span>
            <span class="font-bold text-sm">{{ store.formatCurrency(m.amount, job.currency) }}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="total-line">
          <span class="font-bold">Total</span>
          <span class="pay-total">{{ store.formatCurrency(job.total, job.currency) }}</span>
        </div>
        <div class="guarantee-list">
          <div class="guarantee-item"><span>🔒</span><span>Money goes into escrow — not the freelancer's pocket</span></div>
          <div class="guarantee-item"><span>✅</span><span>Each milestone releases <em>only</em> after your approval</span></div>
          <div class="guarantee-item"><span>⏱️</span><span>Auto-releases after {{ job.autoReleaseDays }} days if you don't respond</span></div>
        </div>
        <button id="continue-checkout-btn" class="btn btn-primary btn-lg btn-full" @click="step = 'checkout'">
          Continue to Checkout
        </button>
      </div>
    </div>

    <!-- CHECKOUT -->
    <div v-if="step === 'checkout' && job" class="pay-wrap">
      <div class="pay-header">
        <div class="pay-icon-wrap">💳</div>
        <h1>Kora Checkout</h1>
        <p class="text-muted">Secure payment powered by Kora Pay</p>
      </div>
      <div class="card pay-card">
        <div class="amount-banner">
          <span class="text-muted text-sm">Paying into escrow</span>
          <span class="banner-amount">{{ store.formatCurrency(job.total, job.currency) }}</span>
        </div>

        <!-- Method tabs -->
        <div class="method-tabs">
          <button :class="['method-btn', method === 'card' && 'active']" @click="method = 'card'">💳 Card</button>
          <button :class="['method-btn', method === 'bank' && 'active']" @click="method = 'bank'">🏦 Bank Transfer</button>
          <button :class="['method-btn', method === 'ussd' && 'active']" @click="method = 'ussd'">📱 USSD</button>
        </div>

        <!-- Card -->
        <div v-if="method === 'card'" class="checkout-form">
          <div class="form-group">
            <label class="form-label">Cardholder Name</label>
            <input v-model="card.name" type="text" class="form-input" placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label class="form-label">Card Number</label>
            <input v-model="card.number" type="text" class="form-input" placeholder="0000  0000  0000  0000" maxlength="19" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Expiry</label>
              <input v-model="card.expiry" type="text" class="form-input" placeholder="MM/YY" maxlength="5" />
            </div>
            <div class="form-group">
              <label class="form-label">CVV</label>
              <input v-model="card.cvv" type="password" class="form-input" placeholder="•••" maxlength="4" />
            </div>
          </div>
        </div>

        <!-- Bank transfer -->
        <div v-if="method === 'bank'" class="info-block">
          <div class="info-row"><span class="text-muted text-sm">Bank Name</span><span class="font-bold text-sm">Kora Escrow Bank</span></div>
          <div class="info-row"><span class="text-muted text-sm">Account Number</span><span class="font-bold text-sm mono">0123456789</span></div>
          <div class="info-row"><span class="text-muted text-sm">Account Name</span><span class="font-bold text-sm">Kora Escrow Reserve</span></div>
          <div class="info-row"><span class="text-muted text-sm">Amount</span><span class="font-bold text-sm text-accent">{{ store.formatCurrency(job.total, job.currency) }}</span></div>
          <p class="text-muted text-sm" style="margin-top:10px">Transfer the exact amount shown. Your escrow activates after bank confirmation.</p>
        </div>

        <!-- USSD -->
        <div v-if="method === 'ussd'" class="ussd-block">
          <div class="ussd-code">*737*000*{{ ussdCode }}#</div>
          <p class="text-muted text-sm">Dial this code on your registered mobile number to pay</p>
        </div>

        <button
          id="pay-btn"
          class="btn btn-primary btn-lg btn-full"
          :disabled="processing"
          @click="processPayment"
        >
          <span v-if="processing" class="spinner"></span>
          {{ processing ? 'Processing…' : `Pay ${store.formatCurrency(job.total, job.currency)}` }}
        </button>
        <div class="secured-note">🔐 SSL encrypted · Powered by Kora Pay</div>
      </div>
    </div>

    <!-- CONFIRMING (polling) -->
    <div v-if="step === 'confirming'" class="status-screen">
      <div class="pulse-wrap">
        <div class="pulse-ring"></div>
        <div class="status-big-icon">⏳</div>
      </div>
      <h2>Confirming Payment</h2>
      <p class="text-muted">Verifying your payment with Kora… please don't close this page.</p>
      <div class="poll-dots"><span></span><span></span><span></span></div>
    </div>

    <!-- CONFIRMED -->
    <div v-if="step === 'confirmed'" class="status-screen">
      <div class="success-badge">✅</div>
      <h2>Payment Confirmed!</h2>
      <p class="text-muted">{{ store.formatCurrency(job?.total, job?.currency) }} is now held in escrow. The freelancer can begin work on the first milestone.</p>
      <button class="btn btn-primary btn-lg" style="margin-top:28px" @click="store.navigate('jobDetail', { jobId: store.selectedJobId })">
        View Job →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'

const job = computed(() => store.selectedJob)
const step = ref('summary')   // summary | checkout | confirming | confirmed
const processing = ref(false)
const method = ref('card')
const card = ref({ name: '', number: '', expiry: '', cvv: '' })
const ussdCode = Math.floor(1000 + Math.random() * 9000)

async function processPayment() {
  processing.value = true
  await new Promise(r => setTimeout(r, 2000))   // simulate Kora checkout
  step.value = 'confirming'
  processing.value = false
  // Poll simulation — don't mark paid from redirect alone
  await new Promise(r => setTimeout(r, 3000))
  store.confirmPayment(store.selectedJobId)
  step.value = 'confirmed'
}
</script>

<style scoped>
.pay-now { max-width: 520px; margin: 0 auto; animation: fadeIn 0.3s ease; }
.back-btn { margin-bottom: 20px; }
.pay-wrap { }

.pay-header { text-align: center; margin-bottom: 28px; }
.pay-icon-wrap { font-size: 2.5rem; margin-bottom: 14px; }
.pay-header h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }

.pay-card { }
.section-title { font-size: 1rem; font-weight: 800; margin-bottom: 16px; }
.job-block { margin-bottom: 14px; }
.job-block-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
.ms-summary-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ms-summary-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.total-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pay-total { font-size: 1.6rem; font-weight: 900; color: var(--accent-light); }

.guarantee-list { display: flex; flex-direction: column; gap: 10px; background: var(--bg-surface); border-radius: var(--radius-md); padding: 16px; margin-bottom: 22px; }
.guarantee-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

/* Checkout */
.amount-banner {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.3);
  border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 22px;
}
.banner-amount { font-size: 1.4rem; font-weight: 900; color: var(--accent-light); }

.method-tabs { display: flex; gap: 8px; margin-bottom: 22px; }
.method-btn {
  flex: 1; padding: 9px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: transparent; color: var(--text-secondary);
  font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.method-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
.method-btn.active { border-color: var(--accent); color: var(--accent-light); background: var(--accent-glow); }

.checkout-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 22px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.info-block { background: var(--bg-surface); border-radius: var(--radius-md); padding: 18px; margin-bottom: 22px; display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.mono { font-family: monospace; letter-spacing: 1px; }

.ussd-block { text-align: center; padding: 24px 0; margin-bottom: 22px; }
.ussd-code { font-size: 2rem; font-weight: 900; color: var(--accent-light); font-family: monospace; margin-bottom: 12px; }

.secured-note { text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 12px; }

/* Status screens */
.status-screen {
  text-align: center; padding: 80px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  animation: fadeIn 0.4s ease;
}
.pulse-wrap { position: relative; width: 80px; height: 80px; margin-bottom: 8px; }
.pulse-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 3px solid var(--accent);
  animation: kpulse 1.4s ease-in-out infinite;
}
@keyframes kpulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
.status-big-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 2.5rem; }
.status-screen h2 { font-size: 1.6rem; font-weight: 900; }
.success-badge { font-size: 4rem; animation: popIn 0.4s ease; }
@keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }

.poll-dots { display: flex; gap: 6px; margin-top: 4px; }
.poll-dots span {
  width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
  animation: blink 1.2s infinite;
}
.poll-dots span:nth-child(2) { animation-delay: 0.2s; }
.poll-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%,80%,100% { opacity: 0.3; } 40% { opacity: 1; } }
</style>
