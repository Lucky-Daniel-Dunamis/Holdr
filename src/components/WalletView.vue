<template>
  <div class="wallet-page">
    <div class="wallet-header">
      <div>
        <h1 class="page-title">Wallet &amp; Payouts</h1>
        <p class="text-muted">Manage your payout details</p>
      </div>
      <div class="user-role-badge">
        <span class="badge" :class="store.isFreelancer ? 'badge-primary' : 'badge-client'">
          {{ store.isFreelancer ? 'Freelancer Account' : 'Client Account' }}
        </span>
      </div>
    </div>

    <template v-if="store.isFreelancer">
      <div class="card mb-24">
        <div class="card-head-row">
          <div>
            <h2 class="card-title">Payout Bank Account</h2>
            <p class="text-muted text-sm">Where your milestone earnings get deposited</p>
          </div>
          <button v-if="!editingBank" class="btn btn-ghost btn-sm" @click="editingBank = true">
            Edit Details
          </button>
        </div>

        <div v-if="error" class="alert alert-error mb-16">⚠️ {{ error }}</div>

        <div v-if="!editingBank" class="bank-display">
          <div class="bank-chip">
            <div class="bank-icon">🏛️</div>
            <div class="bank-info">
              <div class="bank-acc">{{ store.currentUser?.account_number }}</div>
              <div class="bank-holder">{{ store.currentUser?.account_name }}</div>
            </div>
            <span class="badge badge-success ml-auto">Verified</span>
          </div>
        </div>

        <form v-else @submit.prevent="saveBank" class="bank-form">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Select Bank</label>
              <select v-model="bankForm.bankCode" class="form-select" required :disabled="banksLoading">
                <select v-model="bankForm.bankCode" class="form-select" required :disabled="banksLoading">
  <option value="" disabled>{{ banksLoading ? 'Loading banks…' : 'Choose your bank' }}</option>
  <option value="033"> Test Bank (Sandbox)</option>
  <option v-for="b in banks" :key="b.code" :value="b.code">{{ b.name }}</option>
</select>
                <option value="" disabled>{{ banksLoading ? 'Loading banks…' : 'Choose your bank' }}</option>
                <option v-for="b in banks" :key="b.code" :value="b.code">{{ b.name }}</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Account Number</label>
              <input
                v-model="bankForm.accountNumber"
                type="text"
                maxlength="10"
                class="form-input"
                placeholder="10-digit account number"
                required
              />
            </div>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Verifying…' : 'Save Bank Details' }}
            </button>
            <button v-if="store.currentUser?.account_name" type="button" class="btn btn-ghost btn-sm" @click="editingBank = false">Cancel</button>
          </div>
        </form>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <h2 class="card-title">Escrow Protection</h2>
        <p class="text-muted">Funds you pay into a job are held securely and released to the freelancer only when you approve each milestone.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { store } from '../store.js'

const banks = ref([])
const banksLoading = ref(true)
const editingBank = ref(!store.currentUser?.account_name)
const saving = ref(false)
const error = ref('')

const bankForm = reactive({
  bankCode: store.currentUser?.bank_code || '',
  accountNumber: store.currentUser?.account_number || '',
})

onMounted(async () => {
  try {
    const result = await store.listBanks()
    banks.value = result.data || []
  } finally {
    banksLoading.value = false
  }
})

async function saveBank() {
  error.value = ''
  saving.value = true
  try {
    await store.setBankDetails(bankForm.bankCode, bankForm.accountNumber)
    editingBank.value = false
  } catch (e) {
    error.value = e.response?.data?.detail || 'Could not verify bank account'
  } finally {
    saving.value = false
  }
}
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
