<template>
  <div class="create-job">
    <div class="page-header">
      <button class="btn btn-ghost btn-sm" @click="store.navigate('board')">← Back</button>
      <div>
        <h1>Post a Job</h1>
        <p class="text-muted">Break the project into milestones. Clients pay upfront into escrow.</p>
      </div>
    </div>

    <div class="create-layout">
      <!-- Main form -->
      <div class="create-main">
        <div v-if="error" class="alert alert-error mb-20">⚠️ {{ error }}</div>

        <!-- Job details -->
        <div class="card section-card">
          <h3 class="section-title">Job Details</h3>
          <div class="form-stack">
            <div class="form-group">
              <label class="form-label">Job Title</label>
              <input id="job-title" v-model="form.title" type="text" class="form-input" placeholder="e.g. Fintech Mobile App Redesign" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="job-desc" v-model="form.description" class="form-textarea" rows="4" placeholder="Describe the scope of work…"></textarea>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Currency</label>
                <select id="job-currency" v-model="form.currency" class="form-select">
                  <option value="NGN">🇳🇬 Naira (₦)</option>
                  <option value="USD">🇺🇸 Dollar ($)</option>
                  <option value="GHS">🇬🇭 Cedi (GH₵)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Auto-release (days)</label>
                <input id="job-autorelease" v-model.number="form.autoReleaseDays" type="number" class="form-input" min="1" max="90" />
                <span class="form-hint">Work auto-approves after this many days</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Milestone builder -->
        <div class="card section-card">
          <div class="section-header-row">
            <h3 class="section-title" style="margin-bottom:0">Milestones</h3>
            <button type="button" class="btn btn-ghost btn-sm" @click="addMilestone">+ Add milestone</button>
          </div>
          <p class="text-muted text-sm" style="margin: 8px 0 20px">Each milestone is a stage with its own payout. Amounts must add up to the job total.</p>

          <div class="milestones-builder">
            <transition-group name="list">
              <div v-for="(m, idx) in milestones" :key="m.id" class="ms-row">
                <div class="ms-num">{{ idx + 1 }}</div>
                <div class="ms-fields">
                  <input
                    v-model="m.title"
                    type="text"
                    class="form-input"
                    :placeholder="`Milestone ${idx + 1} title`"
                  />
                  <div class="amount-field">
                    <span class="curr-sym">{{ currSym }}</span>
                    <input
                      v-model="m.amount"
                      type="number"
                      class="form-input amount-inp"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-del"
                  :disabled="milestones.length <= 1"
                  @click="removeMilestone(m.id)"
                >✕</button>
              </div>
            </transition-group>
          </div>

          <!-- Validation hint -->
          <div v-if="milestones.length > 0 && totalAmount > 0" class="total-row">
            <span class="text-muted text-sm">Milestone total</span>
            <span class="total-chip" :class="{ valid: totalAmount > 0 }">{{ currSym }}{{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Sidebar summary -->
      <div class="create-sidebar">
        <div class="card summary-sticky">
          <h3 class="section-title">Summary</h3>

          <div class="summary-list">
            <div v-for="(m, idx) in milestones" :key="m.id" class="summary-item">
              <span class="text-muted text-sm ellipsis">{{ m.title || `Milestone ${idx + 1}` }}</span>
              <span class="text-sm font-bold nowrap">{{ currSym }}{{ Number(m.amount || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="summary-total-row">
            <span class="font-bold">Total</span>
            <span class="summary-total-val">{{ currSym }}{{ totalAmount.toLocaleString() }}</span>
          </div>

          <div class="escrow-note">
            <span>🔒</span>
            <span>Client pays this into escrow upfront. Each milestone releases on approval only.</span>
          </div>

          <button
            id="publish-job-btn"
            class="btn btn-primary btn-full"
            :disabled="!canPublish || loading"
            @click="submit"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Publishing…' : 'Publish Job' }}
          </button>

          <p v-if="!canPublish && attemptedPublish" class="form-error mt-4">
            Fill all fields and ensure milestone amounts are above zero.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store } from '../store.js'

const loading = ref(false)
const error = ref('')
const attemptedPublish = ref(false)

const form = reactive({ title: '', description: '', currency: 'NGN', autoReleaseDays: 7 })
const milestones = ref([{ id: 1, title: '', amount: '' }])
let nextId = 2

const currSym = computed(() => ({ NGN: '₦', USD: '$', GHS: 'GH₵' }[form.currency] || ''))

function addMilestone() { milestones.value.push({ id: nextId++, title: '', amount: '' }) }
function removeMilestone(id) { if (milestones.value.length > 1) milestones.value = milestones.value.filter(m => m.id !== id) }

const totalAmount = computed(() => milestones.value.reduce((s, m) => s + (Number(m.amount) || 0), 0))

const canPublish = computed(() => {
  if (!form.title.trim() || !form.description.trim()) return false
  if (milestones.value.some(m => !m.title.trim() || !m.amount || Number(m.amount) <= 0)) return false
  if (totalAmount.value <= 0) return false
  return true
})

async function submit() {
  attemptedPublish.value = true
  error.value = ''
  if (!canPublish.value) return
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    const job = store.createJob({
      title: form.title,
      description: form.description,
      currency: form.currency,
      autoReleaseDays: form.autoReleaseDays,
      total: totalAmount.value,
      milestones: milestones.value.map(m => ({ title: m.title, amount: Number(m.amount) })),
    })
    store.navigate('jobDetail', { jobId: job.id })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-job { animation: fadeIn 0.3s ease; }
.page-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
.page-header h1 { font-size: 1.7rem; font-weight: 900; margin-bottom: 4px; }

.create-layout { display: grid; grid-template-columns: 1fr 320px; gap: 22px; align-items: start; }
.create-main { display: flex; flex-direction: column; gap: 18px; }

.section-card { }
.section-title { font-size: 1rem; font-weight: 800; margin-bottom: 20px; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; }
.form-stack { display: flex; flex-direction: column; gap: 18px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.milestones-builder { display: flex; flex-direction: column; gap: 10px; }
.ms-row { display: flex; align-items: center; gap: 10px; }
.ms-num {
  width: 28px; height: 28px; flex-shrink: 0;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 800; color: var(--text-muted);
}
.ms-fields { display: flex; gap: 8px; flex: 1; }
.amount-field { position: relative; width: 150px; flex-shrink: 0; }
.curr-sym {
  position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
  color: var(--text-secondary); font-weight: 700; font-size: 0.9rem; pointer-events: none;
}
.amount-inp { padding-left: 26px; }
.btn-del {
  width: 28px; height: 28px; border: none; background: var(--danger-bg); color: var(--danger);
  border-radius: 6px; cursor: pointer; font-size: 0.7rem; flex-shrink: 0; transition: all 0.15s;
}
.btn-del:hover:not(:disabled) { background: var(--danger); color: white; }
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }

.total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
.total-chip { font-weight: 800; font-size: 0.95rem; color: var(--accent-light); }

/* Sidebar */
.create-sidebar { position: sticky; top: 88px; }
.summary-sticky { }
.summary-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.summary-item { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.nowrap { white-space: nowrap; }
.summary-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 1rem; }
.summary-total-val { font-size: 1.4rem; font-weight: 900; color: var(--accent-light); }
.escrow-note {
  display: flex; gap: 8px; align-items: flex-start;
  background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.25);
  border-radius: var(--radius-sm); padding: 10px 12px;
  font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;
}
.mb-20 { margin-bottom: 20px; }
.mt-4 { margin-top: 12px; }

.alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.875rem; display: flex; align-items: center; gap: 8px; }
.alert-error { background: var(--danger-bg); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); }

/* transitions */
.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }

@media (max-width: 768px) {
  .create-layout { grid-template-columns: 1fr; }
  .create-sidebar { position: static; }
  .form-row-2 { grid-template-columns: 1fr; }
}
</style>
