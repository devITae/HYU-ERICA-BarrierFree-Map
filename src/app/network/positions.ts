import { building } from '@/data/building'
import { apiHandler } from '@/network/apiHandler'

export const buildingAPI = async (): Promise<Array<building>> => {
    return apiHandler<Array<building>>('/positions/')
}
