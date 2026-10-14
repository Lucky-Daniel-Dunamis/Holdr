import { reactive } from 'vue'

function uid() { return crypto.randomUUID() }

function load() {
  try { const r = localStorage.getItem('kora_v1'); return r ? JSON.parse(r) : null } catch { return null }
}

const saved = load()

const defaultUsers = [
  {
    id: 'u-client-1',
    fullName: 'Amara Kalu',
    email: 'client@example.com',
    password: 'password123',
    role: 'client',
    wallet: {
      earnings: 0,
      paid: 0,
      escrowHeld: 1400000,
      bankDetails: null,
      paymentsHistory: [
        {
          id: 'tx-seed-1',
          jobId: 'job-seed-1',
          jobTitle: 'Fintech Mobile App Escrow',
          amount: 1400000,
          currency: 'NGN',
          timestamp: Date.now() - 86400000 * 3,
        }
      ]
    },
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'u-free-1',
    fullName: 'Tobi Adeleke',
    email: 'freelancer@example.com',
    password: 'password123',
    role: 'freelancer',
    wallet: {
      earnings: 450000,
      paid: 450000,
      escrowHeld: 0,
      bankDetails: {
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountNumber: '0123456789',
        accountName: 'Tobi Adeleke',
      },
      paymentsHistory: []
    },
    createdAt: Date.now() - 86400000 * 10,
  }
]

const defaultJobs = [
  {
    id: 'job-seed-1',
    title: 'Fintech Mobile App Escrow & Kora Integration',
    description: 'Build modern responsive Flutter wallet with instant Nigerian bank settlement and escrow milestone verification.',
    currency: 'NGN',
    autoReleaseDays: 5,
    total: 1400000,
    status: 'funded',
    freelancerId: 'u-free-1',
    clientId: 'u-client-1',
    milestones: [
      {
        id: 'ms-seed-1',
        title: 'Phase 1: Architecture, Wireframes & UX',
        amount: 450000,
        status: 'paid',
        note: 'Completed UI kit, wireframes, and architecture spec',
        fileOrLink: 'https://figma.com/@devfest-escrow/specs',
        submittedAt: Date.now() - 86400000 * 3,
        autoReleaseAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'ms-seed-2',
        title: 'Phase 2: Payment Rails & Kora Checkout Integration',
        amount: 550000,
        status: 'submitted',
        note: 'Payment service implemented with webhooks and simulated checkout. Tests passing 100%.',
        fileOrLink: 'https://github.com/example/kora-escrow-api',
        submittedAt: Date.now() - 3600000 * 4,
        autoReleaseAt: Date.now() + 86400000 * 5,
      },
      {
        id: 'ms-seed-3',
        title: 'Phase 3: QA Testing & Production Release',
        amount: 400000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      }
    ],
    transactions: [
      {
        id: 'tx-seed-10',
        type: 'escrow',
        amount: 1400000,
        description: 'Escrow funded — ₦1,400,000.00 held securely via Kora checkout',
        timestamp: Date.now() - 86400000 * 3,
      },
      {
        id: 'tx-seed-11',
        type: 'payout',
        amount: 450000,
        description: 'Payout released for "Phase 1: Architecture, Wireframes & UX"',
        timestamp: Date.now() - 86400000 * 2,
      }
    ],
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'job-seed-2',
    title: 'Brand Identity Design & Corporate Design System',
    description: 'Comprehensive brand overhaul including logo suite, typography hierarchy, UI tokens, and guidelines.',
    currency: 'NGN',
    autoReleaseDays: 7,
    total: 350000,
    status: 'open',
    freelancerId: 'u-free-1',
    clientId: null,
    milestones: [
      {
        id: 'ms-seed-21',
        title: 'Milestone 1: Visual Identity & Color System',
        amount: 175000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      },
      {
        id: 'ms-seed-22',
        title: 'Milestone 2: Final Brand Book & Asset Handoff',
        amount: 175000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      }
    ],
    transactions: [],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'job-seed-3',
    title: 'Cross-Platform Flutter Wallet App',
    description: 'Complete production build for Flutter cross-platform mobile wallet. Includes Kora Pay integration and security by design.',
    currency: 'NGN',
    autoReleaseDays: 7,
    total: 1409000,
    status: 'open',
    freelancerId: 'u-free-1',
    clientId: null,
    milestones: [
      {
        id: 'ms-seed-31',
        title: 'Phase 1: Architecture & App Modules',
        amount: 450000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      },
      {
        id: 'ms-seed-32',
        title: 'Phase 2: Payment Rail Integration (Kora Pay)',
        amount: 600000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      },
      {
        id: 'ms-seed-33',
        title: 'Phase 3: QA Testing & Production',
        amount: 359000,
        status: 'pending',
        note: null,
        fileOrLink: null,
        submittedAt: null,
        autoReleaseAt: null,
      }
    ],
    transactions: [],
    createdAt: Date.now() - 86400000 * 1,
  }
]

export const store = reactive({
  view: saved?.view || (saved?.currentUser ? 'board' : 'auth'),
  currentUser: saved?.currentUser || null,
  users: (saved?.users && saved.users.length) ? saved.users : defaultUsers,
  jobs: (saved?.jobs && saved.jobs.length) ? saved.jobs : defaultJobs,
  selectedJobId: saved?.selectedJobId || null,
  selectedMilestoneId: saved?.selectedMilestoneId || null,

  get selectedJob() { return this.jobs.find(j => j.id === this.selectedJobId) || null },
  get selectedMilestone() {
    if (!this.selectedJob || !this.selectedMilestoneId) return null
    return this.selectedJob.milestones.find(m => m.id === this.selectedMilestoneId) || null
  },
  get isClient() { return this.currentUser?.role === 'client' },
  get isFreelancer() { return this.currentUser?.role === 'freelancer' },

  loginAsDemo(role = 'client') {
    const user = this.users.find(u => u.role === role) || this.users[0]
    this.currentUser = { ...user }
    this.view = 'board'
    this.save()
  },

  switchUser() {
    const targetRole = this.isClient ? 'freelancer' : 'client'
    const target = this.users.find(u => u.role === targetRole)
    if (target) {
      this.currentUser = { ...target }
      this.save()
    }
  },

  save() {
    try {
      localStorage.setItem('kora_v1', JSON.stringify({
        view: this.view, currentUser: this.currentUser, users: this.users,
        jobs: this.jobs, selectedJobId: this.selectedJobId, selectedMilestoneId: this.selectedMilestoneId,
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

  register({ fullName, email, password, role }) {
    if (this.users.find(u => u.email === email)) throw new Error('Email already registered')
    const user = {
      id: uid(), fullName, email, password, role,
      wallet: { earnings: 0, paid: 0, bankDetails: null, paymentsHistory: [], escrowHeld: 0 },
      createdAt: Date.now(),
    }
    this.users.push(user)
    this.currentUser = user
    this.view = 'board'
    this.save()
    return user
  },

  login(email, password) {
    const user = this.users.find(u => u.email === email)
    if (!user || user.password !== password) throw new Error('Invalid email or password')
    this.currentUser = user
    this.view = 'board'
    this.save()
    return user
  },

  logout() { this.currentUser = null; this.view = 'auth'; this.save() },

  createJob({ title, description, currency, autoReleaseDays, total, milestones }) {
    const job = {
      id: uid(), title, description, currency,
      autoReleaseDays: Number(autoReleaseDays),
      total: Number(total),
      status: 'open',
      freelancerId: this.currentUser.id,
      clientId: null,
      milestones: milestones.map(m => ({
        id: uid(), title: m.title, amount: Number(m.amount),
        status: 'pending', note: null, fileOrLink: null,
        submittedAt: null, autoReleaseAt: null,
      })),
      transactions: [],
      createdAt: Date.now(),
    }
    this.jobs.unshift(job)
    this.save()
    return job
  },

  confirmPayment(jobId) {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return
    job.clientId = this.currentUser.id
    job.status = 'funded'
    if (job.milestones.length > 0) job.milestones[0].status = 'funded'
    job.transactions.push({
      id: uid(), type: 'escrow', amount: job.total,
      description: `Escrow funded — ${this.formatCurrency(job.total, job.currency)} held securely`,
      timestamp: Date.now(),
    })
    const ci = this.users.findIndex(u => u.id === this.currentUser.id)
    if (ci !== -1) {
      this.users[ci].wallet.escrowHeld = (this.users[ci].wallet.escrowHeld || 0) + job.total
      this.users[ci].wallet.paymentsHistory = this.users[ci].wallet.paymentsHistory || []
      this.users[ci].wallet.paymentsHistory.push({
        id: uid(), jobId: job.id, jobTitle: job.title,
        amount: job.total, currency: job.currency, timestamp: Date.now()
      })
      this.currentUser = { ...this.users[ci] }
    }
    this.save()
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

  approveMilestone(jobId, milestoneId) {
    const job = this.jobs.find(j => j.id === jobId)
    if (!job) return
    const idx = job.milestones.findIndex(m => m.id === milestoneId)
    if (idx === -1) return
    const m = job.milestones[idx]
    m.status = 'paid'
    job.transactions.push({
      id: uid(), type: 'payout', amount: m.amount,
      description: `Payout released for "${m.title}"`,
      timestamp: Date.now(),
    })
    const fi = this.users.findIndex(u => u.id === job.freelancerId)
    if (fi !== -1) {
      this.users[fi].wallet.earnings = (this.users[fi].wallet.earnings || 0) + m.amount
      this.users[fi].wallet.paid = (this.users[fi].wallet.paid || 0) + m.amount
    }
    const ci = this.users.findIndex(u => u.id === job.clientId)
    if (ci !== -1) {
      this.users[ci].wallet.escrowHeld = Math.max(0, (this.users[ci].wallet.escrowHeld || 0) - m.amount)
    }
    const next = job.milestones.slice(idx + 1).find(x => x.status === 'pending')
    if (next) { next.status = 'funded' }
    else if (job.milestones.every(x => x.status === 'paid')) { job.status = 'completed' }
    if (this.currentUser.id === job.freelancerId && fi !== -1) this.currentUser = { ...this.users[fi] }
    if (this.currentUser.id === job.clientId && ci !== -1) this.currentUser = { ...this.users[ci] }
    this.save()
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

  getUserById(id) { return this.users.find(u => u.id === id) },
  getFreelancerName(id) { return this.getUserById(id)?.fullName || 'Unknown' },
  getClientName(id) { if (!id) return 'Awaiting client'; return this.getUserById(id)?.fullName || 'Unknown' },
})
