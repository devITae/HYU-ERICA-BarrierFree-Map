import tw from 'twin.macro'
import styled from 'styled-components'
import { amenities } from '@/data/amenities'
import { useEffect, useRef } from 'react'

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
    ${tw`block w-4 h-4 bg-no-repeat bg-center bg-contain cursor-pointer`}
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

    useEffect(() => {
        if (isVisibleId === id) {
            // ID가 일치하면 포커스 맞추기 또는 다른 동작 수행
            console.log(`ID ${id}가 선택되었습니다.`)
            // 예: 스크린리더에게 읽히거나, focus() 호출
            titleRef.current?.focus()
        }
    }, [isVisibleId, id])

    return (
        <>
            <div className='pl-5 pr-5 pt-5 w-[230px]'>  
                <div
                    ref={titleRef}
                    tabIndex={-1}
                    className='flex mb-4 font-fBold'
                    aria-label={`다음은 ${title}에 대한 시설정보 입니다`}
                >
                    {title}
                </div>
                <CheckboxWrapper>
                    <CheckboxItem
                        id="wheel-checkbox"
                        checked={data.wheel}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="wheel-checkbox" />
                    <CheckboxTextLabel
                        aria-label={`${title}엔 휠체어의 진입이 ${data.wheel ? '가능합니다.' : '불가합니다.'}`}
                    >
                        휠체어 진입가능
                    </CheckboxTextLabel>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="elevator-checkbox"
                        checked={data.elevator}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="elevator-checkbox" />
                    <CheckboxTextLabel
                        aria-label={`${title}에 승강기가 ${data.wheel ? '있습니다' : '없습니다.'}`}
                    >
                        승강기
                    </CheckboxTextLabel>
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
                                aria-label={`장애인 화장실 이용에 주의가 필요합니다.`}
                            />
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
                    <CheckboxTextLabel
                        aria-label={`${title}에 장애인 화장실이 ${data.wheel ? '있습니다' : '없습니다.'}`}
                    >
                        장애인 화장실
                    </CheckboxTextLabel>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="dots-checkbox"
                        checked={data.dots}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="dots-checkbox" />
                    <CheckboxTextLabel
                        aria-label={`${title}에 점자 안내판이 ${data.wheel ? '있습니다' : '없습니다.'}`}
                    >
                        점자안내판 (촉지도)
                    </CheckboxTextLabel>
                </CheckboxWrapper>

                {
                    data.caution !== '' ? (
                        <>
                            <div className='flex items-center rounded-lg px-3 py-2 mb-2 bg-red-100'>
                                <img className='w-6 h-6 user-drag-none' src='/images/caution.png' alt='다음은 이용 시 주의사항 입니다.' />
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