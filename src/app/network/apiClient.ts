import axios from 'axios'

export const apiClient = axios.create({
    baseURL: 'https://bfmap-api.vercel.app',
    timeout: 10000,
})
