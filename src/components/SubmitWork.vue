<template>
  <div class="submit-work">
    <button class="btn btn-ghost btn-sm back-btn" @click="store.navigate('jobDetail', { jobId: store.selectedJobId })">← Back</button>

    <div class="sw-container">
      <div class="sw-header">
        <div class="sw-icon">📤</div>
        <h1>Submit Work</h1>
        <p class="text-muted">{{ milestone?.title }}</p>
      </div>

      <div class="card">
        <!-- Context -->
        <div class="context-rows">
          <div class="ctx-row">
            <span class="text-muted text-sm">Job</span>
            <span class="font-bold text-sm">{{ job?.title }}</span>
          </div>
          <div class="ctx-row">
            <span class="text-muted text-sm">Milestone</span>
            <span class="font-bold text-sm">{{ milestone?.title }}</span>
          </div>
          <div class="ctx-row">
            <span class="text-muted text-sm">Payout on approval</span>
            <span class="font-bold text-sm text-success">{{ store.formatCurrency(milestone?.amount, job?.currency) }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div v-if="error" class="alert alert-error mb-16">⚠️ {{ error }}</div>

        <div class="form-stack">
          <div class="form-group">
            <label class="form-label">Work Summary / Note <span class="required">*</span></label>
            <textarea
              id="submit-note"
              v-model="form.note"
              class="form-textarea"
              rows="5"
              placeholder="Describe what you completed in this milestone…"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">File or Link <span class="optional">(optional)</span></label>
            <input
              id="submit-link"
              v-model="form.fileOrLink"
              type="text"
              class="form-input"
              placeholder="https://drive.google.com/… or https://github.com/…"
            />
            <span class="form-hint">Google Drive, GitHub, Figma, Loom, etc.</span>
          </div>

          <div class="auto-note">
            <span>⏱️</span>
            <span>The client has <strong>{{ job?.auto_release_days }} days</strong> to review. If they don't respond, payment auto-releases to you.</span>
          </div>

          <button
            id="submit-work-btn"
            class="btn btn-primary btn-lg btn-full"
            :disabled="loading"
            @click="submit"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Submitting…' : 'Submit Work' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { store } from '../store.js'

const job = computed(() => store.selectedJob)
const milestone = computed(() => store.selectedMilestone)
const loading = ref(false)
const error = ref('')
const form = reactive({ note: '', fileOrLink: '' })

async function submit() {
  error.value = ''
  if (!form.note.trim()) { error.value = 'Please add a note describing your work'; return }
  loading.value = true
  try {
    await store.submitMilestone(job.value.id, milestone.value.id)
    store.navigate('jobDetail', { jobId: job.value.id })
  } catch (e) {
    error.value = e.response?.data?.detail || 'Could not submit work'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.submit-work { animation: fadeIn 0.3s ease; }
.back-btn { margin-bottom: 20px; }
.sw-container { max-width: 540px; margin: 0 auto; }

.sw-header { text-align: center; margin-bottom: 28px; }
.sw-icon { font-size: 2.5rem; margin-bottom: 14px; }
.sw-header h1 { font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }

.context-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
.ctx-row { display: flex; justify-content: space-between; align-items: center; }

.form-stack { display: flex; flex-direction: column; gap: 20px; }

.auto-note {
  display: flex; gap: 8px; align-items: flex-start;
  background: var(--warning-bg); border: 1px solid rgba(245,158,11,0.3);
  border-radius: var(--radius-sm); padding: 12px 14px;
  font-size: 0.85rem; color: var(--warning); line-height: 1.5;
}

.alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.875rem; display: flex; align-items: center; gap: 8px; }
.alert-error { background: var(--danger-bg); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); }
.mb-16 { margin-bottom: 16px; }
.required { color: var(--danger); }
.optional { color: var(--text-muted); font-size: 0.8em; font-weight: 400; text-transform: none; }
</style>
