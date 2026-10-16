import { reactive } from 'vue'
import { login as apiLogin, register as apiRegister, listJobs, createJob as apiCreateJob, getJob, joinJob,
  approveMilestone as apiApproveMilestone, fundJob } from './api.js'

function uid() { return crypto.randomUUID() }

function load() {
  try { const r = localStorage.getItem('kora_v1'); return r ? JSON.parse(r) : null } catch { return null }
}

const saved = load()


export const store = reactive({
  view: saved?.view || (saved?.currentUser ? 'board' : 'auth'),
  currentUser: JSON.parse(localStorage.getItem('holdr_user') || 'null'),
  selectedJobId: saved?.selectedJobId || null,
  selectedMilestoneId: saved?.selectedMilestoneId || null,
  jobs: [],

  get selectedJob() { return this.jobs.find(j => j.id === this.selectedJobId) || null },
  get selectedMilestone() {
    if (!this.selectedJob || !this.selectedMilestoneId) return null
    return this.selectedJob.milestones.find(m => m.id === this.selectedMilestoneId) || null
  },
  get isClient() { return this.currentUser?.role === 'client' },
  get isFreelancer() { return this.currentUser?.role === 'freelancer' },

  async login(email, password) {
    const data = await apiLogin(email, password)
    localStorage.setItem('holdr_token', data.access_token)
    localStorage.setItem('holdr_user', JSON.stringify(data.user))
    this.currentUser = data.user
    this.view = 'board'
    this.save()
    return data.user
  },

  save() {
    try {
      localStorage.setItem('kora_v1', JSON.stringify({
        view: this.view, selectedJobId: this.selectedJobId, selectedMilestoneId: this.selectedMilestoneId,
      }))
    } catch {}
  },

  navigate(view, params = {}) {
    this.view = view
    if ('jobId' in params) this.selectedJobId = params.jobId
    if ('milestoneId' in params) this.selectedMilestoneId = params.milestoneId
    window.scrollTo(0, 0)
    this.save()
  },

  async fetchJobs() {
    this.jobs = await listJobs()
  },
  async register({ fullName, email, password, role }) {
    const data = await apiRegister({ full_name: fullName, email, password, role })
    localStorage.setItem('holdr_token', data.access_token)
    localStorage.setItem('holdr_user', JSON.stringify(data.user))
    this.currentUser = data.user
    this.view = 'board'
    this.save()
    return data.user
  },

  logout() { this.currentUser = null; this.view = 'auth'; this.save() },

  async createJob(payload) {
    const job = await apiCreateJob(payload)
    this.jobs.unshift(job)
    return job
  },

  async fundJob(jobId) {
    return await fundJob(jobId)
  },

  submitMilestone(jobId, milestoneId, { note, fileOrLink }) {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return
    const m = job.milestones.find(m => m.id === milestoneId)
    if (!m) return
    m.status = 'submitted'; m.note = note; m.fileOrLink = fileOrLink
    m.submittedAt = Date.now()
    m.autoReleaseAt = Date.now() + (job.autoReleaseDays * 24 * 60 * 60 * 1000)
    this.save()
  },

  async fetchJob(jobId) {
    const job = await getJob(jobId)
    const idx = this.jobs.findIndex(j => j.id === jobId)
    if (idx !== -1) this.jobs[idx] = job
    else this.jobs.push(job)
    return job
  },

  async joinJob(jobId) {
    const job = await joinJob(jobId)
    const idx = this.jobs.findIndex(j => j.id === jobId)
    if (idx !== -1) this.jobs[idx] = job
    return job
  },

  async approveMilestone(jobId, milestoneId) {
    await apiApproveMilestone(jobId, milestoneId)
    await this.fetchJob(jobId)
  },

  requestChanges(jobId, milestoneId) {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return
    const m = job.milestones.find(m => m.id === milestoneId)
    if (!m) return
    m.status = 'funded'; m.note = null; m.fileOrLink = null; m.submittedAt = null; m.autoReleaseAt = null
    this.save()
  },

  updateBankDetails(bankDetails) {
    const i = this.users.findIndex(u => u.id === this.currentUser.id)
    if (i !== -1) {
      this.users[i].wallet.bankDetails = { ...bankDetails }
      this.currentUser = { ...this.users[i] }
      this.save()
    }
  },

  formatCurrency(amount, currency = 'NGN') {
    const sym = { NGN: '₦', USD: '$', GHS: 'GH₵' }
    return (sym[currency] || currency + ' ') + Number(amount || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  },

})
