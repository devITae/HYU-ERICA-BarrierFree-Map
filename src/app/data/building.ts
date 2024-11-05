import { amenities } from '@/data/amenities'

export type building = {
    id: number
    lat: number
    lng: number
    amenities: amenities
    floors: Array<string>
}