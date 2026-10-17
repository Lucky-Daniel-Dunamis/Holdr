<template>
  <div v-if="job" class="job-detail">
    <!-- Confirm dialog -->
    <transition name="fade">
      <div v-if="showConfirm" class="overlay" @click.self="showConfirm = false">
        <div class="confirm-box">
          <div class="confirm-emoji">💸</div>
          <h3>Confirm Payout</h3>
          <p>This will immediately release <strong>{{ store.formatCurrency(confirmMilestone?.amount, job.currency) }}</strong> to the freelancer. This cannot be undone.</p>
          <div class="confirm-btns">
            <button class="btn btn-ghost" @click="showConfirm = false">Cancel</button>
            <button class="btn btn-success" :disabled="approving" @click="doApprove">
              <span v-if="approving" class="spinner"></span>
              {{ approving ? 'Processing…' : 'Yes, Pay Out' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <button class="btn btn-ghost btn-sm back-btn" @click="store.navigate('board')">← Job Board</button>

    <!-- Header card -->
    <div class="card job-header-card">
      <div class="header-top">
        <div class="header-info">
          <span :class="['badge', 'badge-' + job.status]">{{ job.status.replace('_',' ') }}</span>
          <h1 class="job-title-h">{{ job.title }}</h1>
          <p class="job-desc-p text-muted">{{ job.description }}</p>
        </div>
        <div class="header-amount">
          <div class="amount-label text-muted">Total Value</div>
          <div class="amount-big">{{ store.formatCurrency(job.total_amount, job.currency) }}</div>
          <div class="text-muted text-sm">Auto-release: {{ job.auto_release_days }}d</div>
        </div>
      </div>

      <!-- Parties -->
      <div class="parties-strip">
        <div class="party">
          <div class="party-role text-muted">Freelancer</div>
          <div class="party-name">{{ job.freelancer_id ? 'Freelancer Joined' : 'Awaiting Freelancers' }}</div>
        </div>
        <div class="party-arrow">⇄</div>
        <div class="party">
          <div class="party-role text-muted">Client</div>
          <div class="party-name">{{ isJobClient ? 'You' : 'Client' }}</div>
        </div>
      </div>

      <div v-if="canFreelancerJoin" class="pay-cta">
        <div class="pay-cta-text">
          <span>🤝</span>
          <span>Join this job to start working on it</span>
        </div>
        <button class="btn btn-primary btn-lg" :disabled="joining" @click="doJoin">
  <span v-if="joining" class="spinner"></span>
  {{ joining ? (slowNotice ? 'Waking up the server…' : 'Joining…') : 'Join Job' }}
</button>
      </div>
      <!-- Client CTA: Accept & Pay -->
      <div v-if="canClientPay" class="pay-cta">
        <div class="pay-cta-text">
          <span>🔒</span>
          <span>Your payment is held in escrow — only released when you approve each milestone</span>
        </div>
        <button id="accept-pay-btn" class="btn btn-primary btn-lg" @click="store.navigate('payNow', { jobId: job.id })">
          Accept &amp; Pay {{ store.formatCurrency(job.total_amount, job.currency) }}
        </button>
      </div>
    </div>

    <!-- Milestones -->
    <div class="card">
      <h2 class="section-h">Milestones</h2>
      <div class="milestones-list">
        <div v-for="(m, idx) in job.milestones" :key="m.id" class="ms-detail-row">
          <div class="ms-idx">{{ idx + 1 }}</div>
          <div class="ms-body">
            <div class="ms-header-row">
              <div>
                <div class="ms-title">{{ m.title }}</div>
                <div class="ms-amount">{{ store.formatCurrency(m.amount, job.currency) }}</div>
              </div>
              <span :class="['badge', msBadge(m.status)]">{{ m.status }}</span>
            </div>

            <!-- Submission preview (client only) -->
            <div v-if="m.status === 'submitted' && isJobClient" class="submission-peek">
              <div class="peek-label text-muted">Note from freelancer</div>
              <div class="peek-text">{{ m.note || '—' }}</div>
            </div>

            <!-- Paid -->
            <div v-if="m.status === 'paid'" class="paid-tag"> Paid out to freelancer</div>

            <!-- Actions -->
            <div class="ms-actions">
              <!-- Freelancer: submit work -->
              <button
                  v-if="isJobFreelancer && (m.status === 'pending' || m.status === 'funded')"
                class="btn btn-primary btn-sm"
                @click="store.navigate('submitWork', { jobId: job.id, milestoneId: m.id })"
              > Submit Work</button>

              <!-- Client: review/approve/request changes -->
              <template v-if="isJobClient && m.status === 'submitted'">
                <button class="btn btn-outline btn-sm" @click="store.navigate('approveWork', { jobId: job.id, milestoneId: m.id })">🔍 Review Deliverable</button>
                <button class="btn btn-success btn-sm" @click="openConfirm(m)">✅ Approve & Release</button>
                <button class="btn btn-ghost btn-sm" @click="doRequestChanges(m)">🔄 Request Changes</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>

  <div v-else class="empty-state">
    <div class="empty-icon">🔍</div>
    <h3>Job not found</h3>
    <button class="btn btn-primary mt-4" @click="store.navigate('board')">Back to Board</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../store.js'

onMounted(() => {
  if (store.selectedJobId) store.fetchJob(store.selectedJobId)
})
const slowNotice = ref(false)
let slowTimer = null

function startSlowTimer() {
  slowNotice.value = false
  slowTimer = setTimeout(() => { slowNotice.value = true }, 3000)
}
function stopSlowTimer() {
  clearTimeout(slowTimer)
  slowNotice.value = false
}
const showConfirm = ref(false)
const confirmMilestone = ref(null)
const approving = ref(false)
const joining = ref(false)
const job = computed(() => store.selectedJob)
const isJobClient = computed(() => job.value?.client_id === store.currentUser?.id)
const isJobFreelancer = computed(() => job.value?.freelancer_id === store.currentUser?.id)
const canClientPay = computed(() =>
    isJobClient.value && job.value?.status === 'open' && !!job.value?.freelancer_id
)
const canFreelancerJoin = computed(() =>
    store.isFreelancer && job.value?.status === 'open' && !job.value?.freelancer_id
)
function msBadge(s) {
  return { pending:'badge-pending', funded:'badge-funded', submitted:'badge-submitted', approved:'badge-approved', paid:'badge-paid' }[s] || 'badge-pending'
}

function countdown(ts) {
  const d = ts - Date.now()
  if (d <= 0) return 'Auto-releasing soon'
  const days = Math.floor(d / 86400000)
  const hrs  = Math.floor((d % 86400000) / 3600000)
  const mins = Math.floor((d % 3600000) / 60000)
  if (days > 0) return `Auto-releases in ${days}d ${hrs}h`
  if (hrs > 0) return `Auto-releases in ${hrs}h ${mins}m`
  return `Auto-releases in ${mins}m`
}
async function doJoin() {
  joining.value = true
  startSlowTimer()
  try {
    await store.joinJob(job.value.id)
    store.showToast('You joined the job!')
  } finally {
    stopSlowTimer()
    joining.value = false
  }
}
  
function fmtDate(ts) {
  return new Date(ts).toLocaleString('en', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

function openConfirm(m) { confirmMilestone.value = m; showConfirm.value = true }

async function doApprove() {
  approving.value = true
  try {
    await store.approveMilestone(job.value.id, confirmMilestone.value.id)
    store.showToast('Milestone approved — payout initiated')
  } finally {
    showConfirm.value = false
    approving.value = false
  }
}

</script>

<style scoped>
.job-detail { display: flex; flex-direction: column; gap: 18px; animation: fadeIn 0.3s ease; }
.back-btn { margin-bottom: 4px; }

.job-header-card { }
.header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
.header-info { flex: 1; }
.job-title-h { font-size: 1.45rem; font-weight: 900; margin: 12px 0 8px; line-height: 1.25; }
.job-desc-p { font-size: 0.9rem; line-height: 1.7; max-width: 580px; }
.header-amount { text-align: right; flex-shrink: 0; }
.amount-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
.amount-big { font-size: 1.65rem; font-weight: 900; color: var(--accent-light); line-height: 1; margin-bottom: 6px; }

.parties-strip { display: flex; align-items: center; gap: 18px; padding: 18px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 18px; }
.party { }
.party-role { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.party-name { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.84rem; }
.party-arrow { color: var(--text-muted); font-size: 1.3rem; }
.avatar-sm {
  width: 30px; height: 30px; background: linear-gradient(135deg, var(--accent), #a855f7);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 800; color: white; flex-shrink: 0;
}

.pay-cta {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: linear-gradient(135deg, var(--accent-glow), rgba(168,85,247,0.08));
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: var(--radius-md); padding: 18px 20px;
}
.pay-cta-text { display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); flex: 1; line-height: 1.5; }

.section-h { font-size: 0.98rem; font-weight: 800; margin-bottom: 18px; }
.milestones-list { display: flex; flex-direction: column; }
.ms-detail-row { display: flex; gap: 14px; padding: 18px 0; border-bottom: 1px solid var(--border); }
.ms-detail-row:last-child { border-bottom: none; }
.ms-idx {
  width: 34px; height: 34px; flex-shrink: 0; margin-top: 2px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: var(--text-muted);
}
.ms-body { flex: 1; }
.ms-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.ms-title { font-size: 0.88rem; font-weight: 700; margin-bottom: 3px; }
.ms-amount { font-size: 0.95rem; font-weight: 900; }

.countdown-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--warning-bg); border: 1px solid rgba(245,158,11,0.3);
  color: var(--warning); padding: 5px 10px; border-radius: 100px;
  font-size: 0.78rem; font-weight: 700; margin: 8px 0;
}

.submission-peek {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 12px; margin: 8px 0;
}
.peek-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.peek-text { font-size: 0.875rem; line-height: 1.6; margin-bottom: 6px; }
.peek-link { font-size: 0.8rem; color: var(--accent-light); word-break: break-all; text-decoration: none; }
.peek-link:hover { text-decoration: underline; }

.paid-tag { font-size: 0.85rem; color: var(--success); font-weight: 600; margin-top: 6px; }
.ms-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }

/* Transactions */
.tx-list { display: flex; flex-direction: column; }
.tx-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.tx-row:last-child { border-bottom: none; }
.tx-icon { width: 38px; height: 38px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.tx-escrow { background: var(--accent-glow); }
.tx-payout { background: var(--success-bg); }
.tx-payment { background: var(--info-bg); }
.tx-info { flex: 1; }
.tx-desc { font-size: 0.875rem; font-weight: 500; margin-bottom: 2px; }
.tx-amount { font-weight: 800; font-size: 0.9rem; white-space: nowrap; }

/* Overlay */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.72);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.confirm-box {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 40px; max-width: 400px; width: 90%;
  text-align: center; animation: fadeIn 0.2s ease;
}
.confirm-emoji { font-size: 2.4rem; margin-bottom: 14px; }
.confirm-box h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 10px; }
.confirm-box p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 28px; }
.confirm-btns { display: flex; gap: 12px; justify-content: center; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon { font-size: 3rem; margin-bottom: 14px; }
.empty-state h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.mt-4 { margin-top: 16px; }

@media (max-width: 640px) {
  .header-top { flex-direction: column; }
  .header-amount { text-align: left; }
  .pay-cta { flex-direction: column; align-items: flex-start; }
}
</style>

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
  gap: 14px;
}

.skeleton-card {
  padding: 16px;
  border-radius: var(--radius-md);
}

.job-card {
  padding: 15px;
  border-radius: var(--radius-md);
  gap: 9px;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 26px rgba(99, 102, 241, 0.16);
}

.job-card-title {
  font-size: 0.98rem;
  line-height: 1.3;
}

.job-card-desc {
  font-size: 0.8rem;
  line-height: 1.45;
}

.job-card-meta {
  gap: 16px;
  padding: 8px 0;
}

.meta-key {
  font-size: 0.64rem;
}

.meta-val {
  font-size: 0.92rem;
}

.job-card-footer {
  min-height: 24px;
}

.card-cta {
  font-size: 0.76rem;
}
