import { reactive } from 'vue'
import { login as apiLogin, register as apiRegister,
        listJobs, createJob as apiCreateJob, getJob, joinJob, 
        approveMilestone as apiApproveMilestone, fundJob, 
        submitMilestone as apiSubmitMilestone, listBanks,
        setBankDetails, myTransactions } from './api.js'

function uid() { return crypto.randomUUID() }

function load() {
  try { const r = localStorage.getItem('kora_v1'); return r ? JSON.parse(r) : null } catch { return null }
}

const saved = load()


export const store = reactive({
  view: saved?.view && JSON.parse(localStorage.getItem('holdr_user') || 'null') ? saved.view : 'auth',
  currentUser: JSON.parse(localStorage.getItem('holdr_user') || 'null'),
  selectedJobId: saved?.selectedJobId || null,
  selectedMilestoneId: saved?.selectedMilestoneId || null,
  jobs: [],
        transactions: [],

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


        toast: { message: '', visible: false },

showToast(message) {
  this.toast.message = message
  this.toast.visible = true
  clearTimeout(this._toastTimer)
  this._toastTimer = setTimeout(() => {
    this.toast.visible = false
  }, 3000)
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

        logout() {
  localStorage.removeItem('holdr_token')
  localStorage.removeItem('holdr_user')
  this.currentUser = null
  this.view = 'auth'
  this.save()
},

  async createJob(payload) {
    const job = await apiCreateJob(payload)
    this.jobs.unshift(job)
    return job
  },

  async fundJob(jobId) {
    return await fundJob(jobId)
  },

  async submitMilestone(jobId, milestoneId) {
  await apiSubmitMilestone(jobId, milestoneId)
  await this.fetchJob(jobId)
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
async fetchTransactions() {
  this.transactions = await myTransactions()
},
  requestChanges(jobId, milestoneId) {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return
    const m = job.milestones.find(m => m.id === milestoneId)
    if (!m) return
    m.status = 'funded'; m.note = null; m.fileOrLink = null; m.submittedAt = null; m.autoReleaseAt = null
    this.save()
  },

  async listBanks() {
  return await listBanks()
},

async setBankDetails(bankCode, accountNumber) {
  const result = await setBankDetails(bankCode, accountNumber)
  this.currentUser = { ...this.currentUser, bank_code: bankCode, account_number: accountNumber, account_name: result.account_name }
  localStorage.setItem('holdr_user', JSON.stringify(this.currentUser))
  return result
},

  formatCurrency(amount, currency = 'NGN') {
    const sym = { NGN: '₦', USD: '$', GHS: 'GH₵' }
    return (sym[currency] || currency + ' ') + Number(amount || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  },

})
