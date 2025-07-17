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
                        } else if (value === '소프트웨어융합대학' || value === '소융대') {
                            // 이스터 에그
                            return (
                                <>
                                    <li className='p-2'>
                                        소융대 건물 지어주세요 ㅠㅠ
                                    </li>
                                </>
                            )
                        } else if (value === '장애' || value === '장애학생' || value === '장애학생지원센터' || value === '맑은누리' || value === '희망터') {
                            return (
                                <>
                                    <li className='p-2'>
                                        장애학생지원센터(맑은누리)는 학생복지관 1층 입니다!
                                        <br/>희망터(쉼터)는 제1공학관 1층 102호에 있습니다.
                                        <br/>
                                        <br/>전화번호: 031-400-4502
                                        <br/>E-mail : diverse@hanyang.ac.kr
                                    </li>
                                </>
                            )
                        } else if (value === '인권센터') {
                            // 이스터 에그
                            return (
                                <>
                                    <li className='p-2'>
                                        학생회관 1층으로 오세요!<br/>언제나 환영합니다☺️
                                    </li>
                                </>
                            )
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
                                className='p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200 flex items-center'
                                onClick={() => resultHandle(id, lat, lng)}
                            >
                                <div
                                    className='w-10 font-fBold bg-blue-800 text-white p-1 mr-1.5 text-sm rounded-[0.4rem] text-center justify-center'
                                >
                                    {id}
                                </div>
                                <div className=''>
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