import { Dispatch, SetStateAction } from 'react'
import { pos } from '../positions.json'

interface SearchingProps {
    value: string
    setIsVisibleId: Dispatch<SetStateAction<number | null>>
    setSearchVisible: Dispatch<SetStateAction<boolean>>
    setMapState: Dispatch<SetStateAction<{center: {lat: number, lng: number}, isPanto: boolean}>>
    setInputValue: Dispatch<SetStateAction<string>>
    level: number
}

const Searching: React.FC<SearchingProps> = (
    { value, setIsVisibleId, setSearchVisible, setInputValue, setMapState, level }) => {
    
    const resultHandle = (id : number, level : number, lat : number, lng : number) => {
        let plusLat = 0
        if(level === 2) plusLat = 0.0010
        else if(level === 3) plusLat = 0.0015
        else if(level === 4) plusLat = 0.003
        else if(level === 5) plusLat = 0.006

        setInputValue('')
        setSearchVisible(false)
        setMapState(() => ({
            center: { lat: lat + plusLat, lng: lng},
            isPanto: false,
        }))

        // 렌더링 겹침 문제 해결 위해 시간 차를 두고 setIsVisibleId(id) 실행
        setTimeout(() => {
            setIsVisibleId(id)
        }, 1)
    }
    
    return (
        <>
            <ul className='w-full mt-3'>
                {pos && pos.map(({id, title, lat, lng}) => {
                    if (title.includes(value)) {
                        return (
                            <li 
                                key={id} 
                                className='border-b border-gray-300 cursor-pointer hover:bg-gray-200' 
                                onClick={() => resultHandle(id, level, lat, lng)}
                            >
                                <div className='p-2'>
                                    {title}
                                </div>
                            </li>
                        )
                    }
                })}
                {pos === undefined && (
                    <li className='p-2'>
                        검색 결과가 없습니다.
                    </li>
                )}
            </ul>
        </>
    )
}

export default Searching