import axios from 'axios'

export const apiClient = axios.create({
    baseURL: 'https://mapapi.vercel.app',
    timeout: 10000,
})
