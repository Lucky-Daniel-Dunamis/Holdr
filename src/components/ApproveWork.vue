<template>
  <div class="approve-work">
    <button class="btn btn-ghost btn-sm back-btn" @click="store.navigate('jobDetail', { jobId: store.selectedJobId })">← Back to Job</button>

    <div class="aw-container">
      <div class="aw-header">
        <div class="aw-icon">⚖️</div>
        <h1>Review &amp; Approve Work</h1>
        <p class="text-muted">Carefully review the submitted deliverable before releasing escrow funds.</p>
      </div>

      <div class="card">
        <!-- Milestone & Payout info -->
        <div class="summary-box">
          <div class="sb-item">
            <span class="text-muted text-sm">Job</span>
            <span class="font-bold text-sm">{{ job?.title }}</span>
          </div>
          <div class="sb-item">
            <span class="text-muted text-sm">Freelancer</span>
            <span class="font-bold text-sm">{{ store.getFreelancerName(job?.freelancerId) }}</span>
          </div>
          <div class="sb-item">
            <span class="text-muted text-sm">Milestone</span>
            <span class="font-bold text-sm">{{ milestone?.title }}</span>
          </div>
          <div class="sb-item total-row">
            <span class="text-muted text-sm">Release Payout</span>
            <span class="font-bold text-lg text-success">{{ store.formatCurrency(milestone?.amount, job?.currency) }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Deliverable content -->
        <div class="deliverable-section">
          <h3 class="section-title">Submitted Deliverable</h3>
          
          <div class="field-label">Freelancer Note</div>
          <div class="note-card">
            {{ milestone?.note || 'No description provided.' }}
          </div>

          <div v-if="milestone?.fileOrLink" class="link-card">
            <span class="link-icon">🔗</span>
            <div class="link-details">
              <span class="link-label">Deliverable URL / File</span>
              <a :href="milestone.fileOrLink" target="_blank" rel="noopener noreferrer" class="link-url">
                {{ milestone.fileOrLink }} ↗
              </a>
            </div>
          </div>

          <div v-if="milestone?.submittedAt" class="submission-meta text-muted text-sm">
            <span>Submitted {{ fmtDate(milestone.submittedAt) }}</span>
            <span v-if="milestone.autoReleaseAt"> · Auto-releases on {{ fmtDate(milestone.autoReleaseAt) }}</span>
          </div>
        </div>

        <!-- Warning banner -->
        <div class="warning-banner">
          <span class="warn-icon">⚠️</span>
          <div>
            <strong>Irreversible Action:</strong>
            <p>This releases <strong>{{ store.formatCurrency(milestone?.amount, job?.currency) }}</strong> from escrow directly to the freelancer's payout account immediately and cannot be undone.</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-stack">
          <button
            id="approve-release-btn"
            class="btn btn-success btn-lg btn-full"
            :disabled="loading"
            @click="approve"
          >
            <span v-if="loading && actionType === 'approve'" class="spinner"></span>
            {{ loading && actionType === 'approve' ? 'Releasing Funds…' : `Approve & Release ${store.formatCurrency(milestone?.amount, job?.currency)}` }}
          </button>

          <button
            id="request-changes-btn"
            class="btn btn-ghost btn-full"
            :disabled="loading"
            @click="requestChanges"
          >
            <span v-if="loading && actionType === 'changes'" class="spinner"></span>
            {{ loading && actionType === 'changes' ? 'Resetting…' : '🔄 Request Changes (Reset to Funded)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'

const job = computed(() => store.selectedJob)
const milestone = computed(() => store.selectedMilestone)

const loading = ref(false)
const actionType = ref('')

function fmtDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function approve() {
  actionType.value = 'approve'
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    store.approveMilestone(job.value.id, milestone.value.id)
    store.navigate('jobDetail', { jobId: job.value.id })
  } finally {
    loading.value = false
  }
}

async function requestChanges() {
  actionType.value = 'changes'
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 400))
    store.requestChanges(job.value.id, milestone.value.id)
    store.navigate('jobDetail', { jobId: job.value.id })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.approve-work { animation: fadeIn 0.3s ease; }
.back-btn { margin-bottom: 20px; }
.aw-container { max-width: 580px; margin: 0 auto; }

.aw-header { text-align: center; margin-bottom: 24px; }
.aw-icon { font-size: 2.5rem; margin-bottom: 12px; }
.aw-header h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }

.summary-box { display: flex; flex-direction: column; gap: 10px; }
.sb-item { display: flex; justify-content: space-between; align-items: center; }
.total-row { padding-top: 8px; border-top: 1px dashed var(--border); }

.deliverable-section { margin-bottom: 20px; }
.section-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; }
.field-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }

.note-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 0.95rem;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-top: 12px;
}
.link-icon { font-size: 1.4rem; }
.link-details { display: flex; flex-direction: column; overflow: hidden; }
.link-label { font-size: 0.75rem; color: var(--text-muted); }
.link-url {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.link-url:hover { text-decoration: underline; }

.submission-meta { margin-top: 10px; font-size: 0.82rem; }

.warning-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin-bottom: 24px;
}
.warn-icon { font-size: 1.4rem; }
.warning-banner strong { color: var(--danger); font-size: 0.9rem; }
.warning-banner p { margin: 4px 0 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }

.actions-stack { display: flex; flex-direction: column; gap: 12px; }
</style>
