<template>
  <div class="pay-now">
    <button
      class="btn btn-ghost btn-sm back-btn"
      @click="store.navigate('jobDetail', { jobId: store.selectedJobId })"
    >
      <ArrowLeft :size="15" />
      Back
    </button>

    <!-- SUMMARY -->
    <div v-if="step === 'summary' && job" class="pay-wrap">
      <div class="pay-header">
        <div class="pay-icon-wrap">
          <ShieldCheck :size="38" :stroke-width="1.8" />
        </div>
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
          <span class="pay-total">{{ store.formatCurrency(job.total_amount, job.currency) }}</span>
        </div>
        <div class="guarantee-list">
          <div class="guarantee-item">
            <ShieldCheck :size="16" />
            <span>Money goes into escrow — not the freelancer's pocket</span>
          </div>

          <div class="guarantee-item">
            <CheckCircle2 :size="16" />
            <span>Each milestone releases <em>only</em> after your approval</span>
          </div>

          <div class="guarantee-item">
            <Clock3 :size="16" />
            <span>Auto-releases after {{ job.autoReleaseDays }} days if you don't respond</span>
          </div>
        </div>
       <button id="continue-checkout-btn" class="btn btn-primary btn-lg btn-full" :disabled="loading" @click="startPayment">
  <span v-if="loading" class="spinner"></span>
  {{ loading ? 'Starting checkout…' : 'Continue to Kora Checkout' }}
</button>
<p v-if="error" class="text-sm" style="color: var(--danger); margin-top: 10px; text-align: center;">{{ error }}</p>
      </div>
    </div>

    <!-- CHECKOUT -->

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from 'lucide-vue-next'
import { store } from '../store.js'
</script>

<style scoped>
.pay-now {
  max-width: 480px;
}

.back-btn { margin-bottom: 20px; }
.pay-wrap { }

.pay-header { margin-bottom: 22px; }
.pay-icon-wrap {
  display: flex;
  justify-content: center;
  color: var(--accent-light);
  margin-bottom: 14px;
}
.pay-header h1 { font-size: 1.6rem; font-weight: 900; margin-bottom: 8px; }

.pay-card { padding: 20px; }
.section-title { font-size: 1rem; font-weight: 800; margin-bottom: 16px; }
.job-block { margin-bottom: 14px; }
.job-block-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }
.ms-summary-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.ms-summary-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.total-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.pay-total { font-size: 1.6rem; font-weight: 900; color: var(--accent-light); }

.guarantee-list { display: flex; flex-direction: column; gap: 8px; padding: 13px; margin-bottom: 18px; }
.guarantee-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
.guarantee-item svg { flex: 0 0 auto; color: var(--accent-light); margin-top: 1px; }

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
