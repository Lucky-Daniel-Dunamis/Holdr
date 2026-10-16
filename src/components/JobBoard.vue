<template>
  <div class="board">
    <div class="board-header">
      <div>
        <h1 class="board-title">Job Board</h1>
        <p class="text-muted">{{ filteredJobs.length }} job{{ filteredJobs.length !== 1 ? 's' : '' }} available</p>
      </div>
      <button v-if="store.isClient" id="post-job-btn" class="btn btn-primary" @click="store.navigate('createJob')">
        + Post a Job
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="search-wrap">
        <Search class="search-icon" :size="16" :stroke-width="2" />
        <input
          id="board-search"
          v-model="search"
          type="text"
          class="form-input search-input"
          placeholder="Search jobs or freelancers…"
        />
      </div>
      <select id="board-currency" v-model="filterCurrency" class="form-select filter-select">
        <option value="all">All currencies</option>
        <option value="NGN">NGN (₦)</option>
        <option value="USD">USD ($)</option>
        <option value="GHS">GHS (GH₵)</option>
      </select>
      <input v-model="priceMin" type="number" class="form-input price-input" placeholder="Min price" min="0" />
      <input v-model="priceMax" type="number" class="form-input price-input" placeholder="Max price" min="0" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="jobs-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton" style="height:20px;width:60%;margin-bottom:14px"></div>
        <div class="skeleton" style="height:14px;width:90%;margin-bottom:8px"></div>
        <div class="skeleton" style="height:14px;width:70%;margin-bottom:24px"></div>
        <div class="skeleton" style="height:32px;width:35%"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="fetchError" class="empty-state">
      <AlertTriangle class="empty-icon" :size="48" />
      <h3>Something went wrong</h3>
      <p class="text-muted">{{ fetchError }}</p>
      <button class="btn btn-primary mt-4" @click="retry">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredJobs.length === 0" class="empty-state">
      <ClipboardList class="empty-icon" :size="48" />
      <h3>No matching jobs</h3>
      <p class="text-muted">
        Try adjusting your filters
      </p>
      <button v-if="store.isClient && !(search || priceMin || priceMax)" class="btn btn-primary mt-4" @click="store.navigate('createJob')">
        Post a Job
      </button>
    </div>

    <!-- Job cards -->
    <div v-else class="jobs-grid">
      <div
        v-for="job in filteredJobs"
        :key="job.id"
        class="job-card"
        @click="store.navigate('jobDetail', { jobId: job.id })"
      >
        <div class="job-card-top">
          <span :class="['badge', 'badge-' + job.status]">{{ job.status.replace('_', ' ') }}</span>
          <span class="currency-pill">{{ job.currency }}</span>
        </div>
        <h3 class="job-card-title">{{ job.title }}</h3>
        <p class="job-card-desc">{{ job.description }}</p>
        <div class="job-card-meta">
          <div class="meta-stat">
            <span class="meta-key">Total</span>
            <span class="meta-val">{{ store.formatCurrency(job.total_amount, job.currency) }}</span>
          </div>
          <div class="meta-stat">
            <span class="meta-key">Milestones</span>
            <span class="meta-val">{{ job.milestones.length }}</span>
          </div>
        </div>
        <div class="job-card-footer">
          <div class="avatar-row">
            <span class="text-sm text-muted">{{ job.freelancer_id ? 'Freelancer joined' : 'Open for freelancers' }}</span>
          </div>
          <span class="card-cta">
            View <ArrowRight :size="14" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted  } from 'vue'

import { store } from '../store.js'
onMounted(() => {
  store.fetchJobs()
})

const search = ref('')
const filterCurrency = ref('all')
const priceMin = ref('')
const priceMax = ref('')
const loading = ref(false)
const fetchError = ref('')

function retry() { fetchError.value = ''; loading.value = false }

const filteredJobs = computed(() => {
  let jobs = store.jobs.filter(j => j.status !== 'cancelled')
  if (search.value) {
    const q = search.value.toLowerCase()
    jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    )
  }
  if (filterCurrency.value !== 'all') jobs = jobs.filter(j => j.currency === filterCurrency.value)
  if (priceMin.value) jobs = jobs.filter(j => j.total_amount >= Number(priceMin.value))
  if (priceMax.value) jobs = jobs.filter(j => j.total_amount <= Number(priceMax.value))
  return jobs
})
</script>

<script>
import { Search, AlertTriangle, ClipboardList, ArrowRight } from 'lucide-vue-next'
</script>

<style scoped>
.board { animation: fadeIn 0.3s ease; }
.board-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.board-title { font-size: 1.9rem; font-weight: 900; margin-bottom: 4px; }

.filters-row { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 220px; }
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.search-input { padding-left: 36px; }
.filter-select { width: 160px; }
.price-input { width: 130px; }

.jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px; }

.skeleton-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 22px;
}

.job-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 18px;
  cursor: pointer; transition: all 0.25s ease;
  display: flex; flex-direction: column; gap: 12px;
}
.job-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(99,102,241,0.18);
}
.job-card-top { display: flex; align-items: center; justify-content: space-between; }
.currency-pill {
  font-size: 0.7rem; font-weight: 700; color: var(--text-muted);
  background: var(--bg-surface); padding: 2px 8px; border-radius: 4px;
}
.job-card-title { font-size: 1.05rem; font-weight: 800; line-height: 1.3; }
.job-card-desc {
  font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.job-card-meta {
  display: flex; gap: 20px; padding: 10px 0;
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.meta-stat { display: flex; flex-direction: column; gap: 2px; }
.meta-key { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-muted); }
.meta-val { font-size: 1rem; font-weight: 800; }
.job-card-footer { display: flex; align-items: center; justify-content: space-between; }
.avatar-row { display: flex; align-items: center; gap: 7px; }
.avatar-xs {
  width: 26px; height: 26px; background: linear-gradient(135deg, var(--accent), #a855f7);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; color: white; flex-shrink: 0;
}
.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-light);
}

.empty-state { text-align: center; padding: 80px 20px; }
.empty-icon {
  color: var(--accent);
  margin-bottom: 16px;
}
.empty-state h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
</style>
