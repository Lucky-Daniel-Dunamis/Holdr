<template>
  <div class="wallet-page">
    <div class="wallet-header">
      <div>
        <h1 class="page-title">Wallet &amp; Payouts</h1>
        <p class="text-muted">Manage your funds, view escrow balances, and track payment transactions</p>
      </div>
      <div class="user-role-badge">
        <span class="badge" :class="store.isFreelancer ? 'badge-primary' : 'badge-client'">
          {{ store.isFreelancer ? 'Freelancer Account' : 'Client Account' }}
        </span>
      </div>
    </div>

    <!-- FREELANCER WALLET -->
    <template v-if="store.isFreelancer">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Earned</div>
          <div class="stat-value text-success">
            {{ store.formatCurrency(userWallet.earnings || 0, 'NGN') }}
          </div>
          <div class="stat-hint">Across all approved milestones</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Paid Out to Bank</div>
          <div class="stat-value">
            {{ store.formatCurrency(userWallet.paid || 0, 'NGN') }}
          </div>
          <div class="stat-hint">Processed to your payout account</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Settlement Rail</div>
          <div class="stat-rail">
            <span class="rail-logo">⚡ Kora Pay</span>
            <span class="rail-status">Live Escrow</span>
          </div>
          <div class="stat-hint">Instant Nigerian bank settlement</div>
        </div>
      </div>

      <!-- Bank Details -->
      <div class="card mb-24">
        <div class="card-head-row">
          <div>
            <h2 class="card-title">Payout Bank Account</h2>
            <p class="text-muted text-sm">Where your milestone earnings get deposited</p>
          </div>
          <button v-if="!editingBank && userWallet.bankDetails" class="btn btn-ghost btn-sm" @click="editingBank = true">
            ✏️ Edit Details
          </button>
        </div>

        <div v-if="!editingBank && userWallet.bankDetails" class="bank-display">
          <div class="bank-chip">
            <div class="bank-icon">🏛️</div>
            <div class="bank-info">
              <div class="bank-name">{{ userWallet.bankDetails.bankName }}</div>
              <div class="bank-acc">{{ userWallet.bankDetails.accountNumber }}</div>
              <div class="bank-holder">{{ userWallet.bankDetails.accountName }}</div>
            </div>
            <span class="badge badge-success ml-auto">Verified</span>
          </div>
        </div>

        <form v-else @submit.prevent="saveBank" class="bank-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Select Bank</label>
              <select v-model="bankForm.bankName" class="form-select" required>
                <option value="" disabled>Choose your bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                <option value="Kuda Bank">Kuda Bank</option>
                <option value="Moniepoint MFB">Moniepoint MFB</option>
                <option value="Opay">Opay</option>
                <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                <option value="Zenith Bank">Zenith Bank</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Account Number</label>
              <input
                v-model="bankForm.accountNumber"
                type="text"
                maxlength="10"
                class="form-input"
                placeholder="10-digit NUBAN"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Account Name</label>
            <input
              v-model="bankForm.accountName"
              type="text"
              class="form-input"
              placeholder="Full name on bank account"
              required
            />
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-primary btn-sm">Save Bank Details</button>
            <button v-if="userWallet.bankDetails" type="button" class="btn btn-ghost btn-sm" @click="editingBank = false">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Payout History -->
      <div class="card">
        <h2 class="card-title">Payout History</h2>
        <div v-if="!freelancerPayouts.length" class="empty-state-sm">
          <span class="empty-icon">💸</span>
          <p class="text-muted">No payouts received yet. Complete milestones to earn!</p>
        </div>
        <div v-else class="tx-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job &amp; Milestone</th>
                <th>Date</th>
                <th>Rail</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in freelancerPayouts" :key="item.id">
                <td>
                  <strong>{{ item.jobTitle }}</strong>
                  <div class="text-muted text-sm">{{ item.description }}</div>
                </td>
                <td class="text-muted text-sm">{{ fmtDate(item.timestamp) }}</td>
                <td><span class="badge badge-pill">Kora Payout</span></td>
                <td class="text-success font-bold">+{{ store.formatCurrency(item.amount, item.currency) }}</td>
                <td><span class="badge badge-success">Completed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- CLIENT WALLET -->
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Spent / Deposited</div>
          <div class="stat-value text-accent">
            {{ store.formatCurrency(totalClientSpent, 'NGN') }}
          </div>
          <div class="stat-hint">Funded via Kora Checkout</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Held in Escrow</div>
          <div class="stat-value text-warning">
            {{ store.formatCurrency(userWallet.escrowHeld || 0, 'NGN') }}
          </div>
          <div class="stat-hint">Protected until you approve</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Escrow Guarantee</div>
          <div class="stat-rail">
            <span class="rail-logo">🔒 100% Secure</span>
            <span class="rail-status">Protected</span>
          </div>
          <div class="stat-hint">Auto-refund on unfulfilled contracts</div>
        </div>
      </div>

      <!-- Deposit History -->
      <div class="card">
        <h2 class="card-title">Deposit &amp; Funding History</h2>
        <div v-if="!clientDeposits.length" class="empty-state-sm">
          <span class="empty-icon">💳</span>
          <p class="text-muted">No deposits yet. Accept and pay for an open job to fund escrow!</p>
        </div>
        <div v-else class="tx-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Amount Deposited</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in clientDeposits" :key="item.id">
                <td>
                  <strong>{{ item.jobTitle }}</strong>
                </td>
                <td class="text-muted text-sm">{{ fmtDate(item.timestamp) }}</td>
                <td><span class="badge badge-pill">Kora Checkout</span></td>
                <td class="text-accent font-bold">{{ store.formatCurrency(item.amount, item.currency || 'NGN') }}</td>
                <td><span class="badge badge-success">Escrow Funded</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { store } from '../store.js'

const userWallet = computed(() => store.currentUser?.wallet || {})
const editingBank = ref(!store.currentUser?.wallet?.bankDetails)

const bankForm = reactive({
  bankName: store.currentUser?.wallet?.bankDetails?.bankName || '',
  accountNumber: store.currentUser?.wallet?.bankDetails?.accountNumber || '',
  accountName: store.currentUser?.wallet?.bankDetails?.accountName || store.currentUser?.fullName || '',
})

function saveBank() {
  store.updateBankDetails({ ...bankForm })
  editingBank.value = false
}

function fmtDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const freelancerPayouts = computed(() => {
  const payouts = []
  store.jobs.forEach(job => {
    if (job.freelancerId === store.currentUser?.id) {
      (job.transactions || []).forEach(tx => {
        if (tx.type === 'payout') {
          payouts.push({
            id: tx.id,
            jobTitle: job.title,
            currency: job.currency,
            description: tx.description,
            amount: tx.amount,
            timestamp: tx.timestamp,
          })
        }
      })
    }
  })
  return payouts.sort((a, b) => b.timestamp - a.timestamp)
})

const clientDeposits = computed(() => {
  return (userWallet.value.paymentsHistory || []).slice().sort((a, b) => b.timestamp - a.timestamp)
})

const totalClientSpent = computed(() => {
  return (userWallet.value.paymentsHistory || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})
</script>

<style scoped>
.wallet-page { animation: fadeIn 0.3s ease; max-width: 960px; margin: 0 auto; }
.wallet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.page-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 4px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-sm);
}
.stat-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
.stat-value { font-size: 1.8rem; font-weight: 800; }
.stat-hint { font-size: 0.78rem; color: var(--text-muted); }
.stat-rail { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
.rail-logo { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
.rail-status { font-size: 0.75rem; background: var(--success-bg); color: var(--success); padding: 2px 8px; border-radius: 99px; }

.card-head-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.card-title { font-size: 1.2rem; font-weight: 700; }

.bank-display { margin-top: 8px; }
.bank-chip {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}
.bank-icon { font-size: 2rem; }
.bank-name { font-weight: 700; font-size: 1.05rem; }
.bank-acc { font-family: monospace; font-size: 1rem; color: var(--primary); letter-spacing: 1px; }
.bank-holder { font-size: 0.85rem; color: var(--text-muted); }

.bank-form { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
.form-row { display: flex; gap: 16px; flex-wrap: wrap; }
.flex-1 { flex: 1; min-width: 200px; }
.btn-group { display: flex; gap: 10px; }

.empty-state-sm { text-align: center; padding: 32px 16px; }
.empty-state-sm .empty-icon { font-size: 2.2rem; display: block; margin-bottom: 8px; }

.tx-table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { padding: 12px 14px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
.badge-pill { background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 99px; font-size: 0.75rem; padding: 2px 8px; }
</style>
