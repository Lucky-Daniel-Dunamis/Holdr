import axios from 'axios'

const api = axios.create({
  baseURL: 'https://holdr-backend.onrender.com',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('holdr_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function register({ full_name, email, password, role }) {
  const response = await api.post('/auth/register', {
    full_name, email, password, role
  })
  return response.data
}

export async function listJobs() {
  const response = await api.get('/job')
  return response.data
}

export async function createJob(payload) {
  const response = await api.post('/job', payload)
  return response.data
}

export async function getJob(jobId) {
  const response = await api.get(`/job/${jobId}`)
  return response.data
}

export async function joinJob(jobId) {
  const response = await api.post(`/job/${jobId}/join`)
  return response.data
}

export async function approveMilestone(jobId, milestoneId) {
  const response = await api.post(`/job/${jobId}/milestones/${milestoneId}/approve`)
  return response.data
}

export async function fundJob(jobId) {
  const response = await api.post(`/job/${jobId}/fund`)
  return response.data
}


export async function submitMilestone(jobId, milestoneId) {
  const response = await api.post(`/job/${jobId}/milestones/${milestoneId}/submit`)
  return response.data
}

export async function listBanks() {
  const response = await api.get('/job/banks')
  return response.data
}

export async function setBankDetails(bankCode, accountNumber) {
  const response = await api.post('/job/me/bank-details', {
    bank_code: bankCode,
    account_number: accountNumber,
  })
  return response.data
}
export default api
