import { building } from '@/data/building'
import { apiClient } from '@/network/apiClient'

export const apiHandler = async <T extends | Array<building>>(
    urlPath: string
): Promise<T> => {
    return apiClient.get(urlPath).then((response) => {
        return response.data as T
    })
}
