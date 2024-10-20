import { Dispatch, SetStateAction } from 'react'
import { pos } from '../../positions.json'

interface SearchingProps {
    value: string
    setIsVisibleId: Dispatch<SetStateAction<number | null>>
    setSearchVisible: Dispatch<SetStateAction<boolean>>
    setMapState: Dispatch<SetStateAction<{center: {lat: number, lng: number}, isPanto: boolean}>>
    setInputValue: Dispatch<SetStateAction<string>>
    plusLat: number
}

const Searching: React.FC<SearchingProps> = (
    { value, setIsVisibleId, setSearchVisible, setInputValue, setMapState, plusLat }) => {
    
    const resultHandle = (id : number, lat : number, lng : number) => { 
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
            {value &&
                <ul id='searchedList' className='w-full mt-3'>
                    {pos && (() => {
                        const filteredPos = pos.filter(({title}) => title.includes(value))

                        // 검색 결과가 1개일 때 자동으로 선택
                        if (filteredPos.length === 1) {
                            const {id, lat, lng} = filteredPos[0]
                            resultHandle(id, lat, lng)
                        } else if (filteredPos.length === 0) {
                            return (
                                <>
                                    <li className='p-2'>
                                        검색 결과가 없습니다.
                                    </li>
                                </>
                            )
                        }

                        return filteredPos.map(({id, title, lat, lng}) => (
                            <li
                                key={id}
                                className='border-b border-gray-300 cursor-pointer hover:bg-gray-200'
                                onClick={() => resultHandle(id, lat, lng)}
                            >
                                <div className='p-2'>
                                    {title}
                                </div>
                            </li>
                        ))
                    })()}
                    {pos === undefined && (
                        <li className='p-2'>
                            검색 결과가 없습니다.
                        </li>
                    )}
                </ul>
            }
        </>
    )
}

export default Searching