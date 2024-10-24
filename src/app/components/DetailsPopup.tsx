import tw from 'twin.macro'
import styled from 'styled-components'
import { amenities } from '@/data/amenities'
import { useEffect, useRef, useState } from 'react'

interface DetailsPopupProps {
    id: number
    title: string
    data: amenities
    isVisibleId: number | null
}

const CheckboxWrapper = styled.div`
    ${tw`flex items-center bg-blue-50 rounded-lg p-2 mb-2`}
`

const CheckboxItem = styled.input`
    ${tw`hidden`}
`

const CheckboxLabel = styled.label`
    ${tw`block w-4 h-4 bg-no-repeat bg-center bg-contain not-sr-only`}
        background-image: url('/images/xbox.png');

    input:checked + & {
        background-image: url('/images/checkbox.png');
    }
    
    input:checked + #caution& {
        background-image: url('/images/cautionBox.png');
    }
`

const CheckboxTextLabel = styled.label`
    ${tw`ml-2 text-sm`}
`

const DetailsPopup: React.FC<DetailsPopupProps> = ({ id, title, data, isVisibleId }) => {
    const titleRef = useRef<HTMLDivElement>(null)
    //const [viewingId, setViewingID] = useState<number | null>(null) // 현재 보고 있는 ID
    const [hasFocused, setHasFocused] = useState(false) // 최초 포커스 여부 관리

    useEffect(() => {
        // isVisibleId가 변경되고 해당 ID가 맞을 때만 포커스 설정, 단 최초 1회만
        if (isVisibleId === id && titleRef.current && !hasFocused) {
        //if (id !== viewingId && isVisibleId === id && titleRef.current) {
            setHasFocused(true) // 포커스 이후 상태 변경
            //setViewingID(id)
            titleRef.current.focus() // 최초 포커스
            console.log('focus')
        }
    }, [isVisibleId, id, hasFocused])

    return (
        <>
            <div className='pl-5 pr-5 pt-5 w-[230px]'>  
                <div
                    ref={titleRef}
                    tabIndex={-1}
                    aria-hidden={true}
                    className='flex mb-4 font-fBold border-transparent focus:border-transparent focus:ring-0'
                >
                    {title}
                </div>
                <div className='sr-only' aria-live='polite'>
                    다음은 {title}에 대한 시설정보 입니다
                </div>
                <CheckboxWrapper>
                    <CheckboxItem
                        id="wheel-checkbox"
                        checked={data.wheel}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="wheel-checkbox" />
                    <CheckboxTextLabel aria-hidden={true} >
                        휠체어 진입가능
                    </CheckboxTextLabel>
                    <div className='sr-only' aria-live='polite'>
                        {title}엔 휠체어의 진입이 {data.wheel ? '가능합니다.' : '불가합니다.'}
                    </div>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="elevator-checkbox"
                        checked={data.elevator}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="elevator-checkbox" />
                    <CheckboxTextLabel aria-hidden={true} >
                        승강기
                    </CheckboxTextLabel>
                    <div className='sr-only' aria-live='polite'>
                        {title}에 승강기가 {data.wheel ? '있습니다' : '없습니다.'}
                    </div>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    { /* 학술정보관, 아고라 화장실 예외 표시 */ }
                    {id === 401 || id === 100 ? (
                        <>
                            <CheckboxItem
                                id="toilet-checkbox"
                                checked={data.toilet}
                                type="checkbox" value="" 
                            />
                            <CheckboxLabel
                                id='caution' 
                                htmlFor="toilet-checkbox" 
                            />
                            <div className='sr-only' aria-live='polite'>
                                장애인 화장실 이용에 주의가 필요합니다.
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckboxItem
                                id="toilet-checkbox"
                                checked={data.toilet}
                                type="checkbox" value="" 
                            />
                            <CheckboxLabel htmlFor="toilet-checkbox" />
                        </>
                    )}    
                    <CheckboxTextLabel aria-hidden={true} >
                        장애인 화장실
                    </CheckboxTextLabel>
                    <div className='sr-only' aria-live='polite'>
                        {title}에 장애인 화장실이 {data.wheel ? '있습니다' : '없습니다.'}
                    </div>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="dots-checkbox"
                        checked={data.dots}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="dots-checkbox" />
                    <CheckboxTextLabel aria-hidden={true} >
                        점자안내판 (촉지도)
                    </CheckboxTextLabel>
                    <div className='sr-only' aria-live='polite'>
                        {title}에 점자 안내판이 {data.wheel ? '있습니다' : '없습니다.'}
                    </div>
                </CheckboxWrapper>

                {
                    data.caution !== '' ? (
                        <>
                            <div className='flex items-center rounded-lg px-3 py-2 mb-2 bg-red-100'>
                                <img 
                                    className='w-6 h-6 user-drag-none' 
                                    src='/images/caution.png' 
                                    alt='다음은 이용 시 주의사항 입니다.' />
                                    <div className='ml-2 text-[0.75rem]'>
                                        {data.caution}
                                    </div>
                            </div>
                        </>
                    ) : null
                }
            </div>
        </>
    )
}

export default DetailsPopup