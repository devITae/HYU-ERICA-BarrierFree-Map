import { Dispatch, SetStateAction } from 'react'
import { pos } from '../../positions.json'

interface PosItem {
    id: number
    title: string
    nickname: string[]
    lat: number
    lng: number
}

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

    const filteredPos = pos.filter(({ title, nickname }: PosItem) => {
        if (!value) return false
        const keyword = value.trim()
        const inTitle = title.includes(keyword)
        const inNickname = nickname?.some((alias) => alias.includes(keyword))
        return inTitle || inNickname
    })

    const renderSpecialCases = () => {
        if (value === '소프트웨어융합대학' || value === '소융대') {
            return (
                <li className='p-2'>
                    소융대 건물 지어주세요 ㅠㅠ
                </li>
            )
        }
        if (['장애', '장애학생', '장애학생지원센터', '맑은누리', '희망터'].includes(value)) {
            return (
                <li className='p-2'>
                    장애학생지원센터(맑은누리)는 학생복지관 1층 입니다!
                    <br />희망터(쉼터)는 제1공학관 1층 102호에 있습니다.
                    <br />
                    <br />전화번호: 031-400-4502
                    <br />E-mail : diverse@hanyang.ac.kr
                </li>
            )
        }
        if (value === '인권센터') {
            return (
                <li className='p-2'>
                    학생회관 1층으로 오세요!<br />언제나 환영합니다☺️
                </li>
            )
        }
        return null
    }

    /* ③ 검색 결과가 1개면 자동 선택 */
    if (filteredPos.length === 1) {
        const { id, lat, lng } = filteredPos[0]
        resultHandle(id, lat, lng)
    }

    return (
        <>
        {value && (
            <ul id='searchedList' className='w-full mt-3'>
            {/* 특수 케이스 먼저 렌더 */}
            {renderSpecialCases()}

            {/* 일반 검색 결과 */}
            {filteredPos.length > 0 ? (
                filteredPos.map(({ id, title, lat, lng }) => (
                <li
                    key={id}
                    className='p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-200 flex items-center'
                    onClick={() => resultHandle(id, lat, lng)}
                >
                    <div className='w-10 font-fBold bg-blue-800 text-white p-1 mr-1.5 text-sm rounded-[0.4rem] text-center'>
                        {id}
                    </div>
                    <div>{title}</div>
                </li>
                ))
            ) : (
                /* 일치하는 title · nickname 모두 없을 때 */
                !renderSpecialCases() && (
                    <li className='p-2'>
                        검색 결과가 없습니다.
                    </li>
                )
            )}
            </ul>
        )}
        </>
    )
}

export default Searching