import tw from 'twin.macro'
import styled from 'styled-components'
import { amenities } from '@/data/amenities'
import { useEffect, useRef } from 'react'

interface DetailsPopupProps {
    id: number
    title: string
    data: amenities
    isVisibleId: number | null
    hasFocused: boolean
    setHasFocused: React.Dispatch<React.SetStateAction<boolean>>
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

const DetailsPopup: React.FC<DetailsPopupProps> = ({ id, title, data, isVisibleId, hasFocused, setHasFocused }) => {
    const divRef = useRef<HTMLDivElement>(null)
    //const [viewingId, setViewingID] = useState<number | null>(null) // 현재 보고 있는 ID

    useEffect(() => {
        if (isVisibleId === id && divRef.current && !hasFocused) {
            divRef.current.focus();
            setHasFocused(true);
            console.log('focus set for id:', id);
        }
        // 디버깅을 위한 상태 출력
        console.log('Effect triggered - isVisibleId:', isVisibleId, 'id:', id, 'hasFocused:', hasFocused);
    }, [id, isVisibleId, hasFocused, setHasFocused]);

    return (
        <>
            <div 
                ref={divRef}
                className='pl-5 pr-5 pt-5 w-[230px]'
            >  
                <div className='sr-only'>
                    {`다음은 ${title}에 대한 시설정보 입니다`}
                </div>
                <div
                    tabIndex={-1}
                    aria-hidden={true}
                    className='flex mb-4 font-fBold border-transparent focus:border-transparent focus:ring-0'
                >
                    {title}
                </div>
                
                <CheckboxWrapper>
                    <CheckboxItem
                        id="wheel-checkbox"
                        checked={data.wheel}
                        type="checkbox" value=""
                        aria-hidden={true}
                    />
                    <CheckboxLabel htmlFor="wheel-checkbox" aria-hidden={true} />
                    <CheckboxTextLabel aria-hidden={true} >
                        휠체어 진입가능
                    </CheckboxTextLabel>
                    <div className='sr-only'>
                        {`${title}엔 휠체어의 진입이 ${data.wheel ? '가능합니다.' : '불가합니다.'}`}
                    </div>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="elevator-checkbox"
                        checked={data.elevator}
                        type="checkbox" value="" 
                        aria-hidden={true}
                    />
                    <CheckboxLabel htmlFor="elevator-checkbox" aria-hidden={true} />
                    <CheckboxTextLabel aria-hidden={true} >
                        승강기
                    </CheckboxTextLabel>
                    <div className='sr-only'>
                        {`${title}에 승강기가 ${data.elevator ? '있습니다.' : '없습니다.'}`}
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
                                aria-hidden={true}
                            />
                            <CheckboxLabel
                                id='caution' 
                                htmlFor="toilet-checkbox" 
                                aria-hidden={true}
                            />
                            <div className='sr-only'>
                                장애인 화장실 이용에 주의가 필요합니다.
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckboxItem
                                id="toilet-checkbox"
                                checked={data.toilet}
                                type="checkbox" value="" 
                                aria-hidden={true}
                            />
                            <CheckboxLabel htmlFor="toilet-checkbox" aria-hidden={true} />
                        </>
                    )}    
                    <CheckboxTextLabel aria-hidden={true} >
                        장애인 화장실
                    </CheckboxTextLabel>
                    <div className='sr-only'>
                        {`${title}에 장애인 화장실이 ${data.toilet ? '있습니다.' : '없습니다.'}`}
                    </div>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="dots-checkbox"
                        checked={data.dots}
                        type="checkbox" value="" 
                        aria-hidden={true}
                    />
                    <CheckboxLabel htmlFor="dots-checkbox" aria-hidden={true} />
                    <CheckboxTextLabel aria-hidden={true} >
                        점자안내판 (촉지도)
                    </CheckboxTextLabel>
                    <div className='sr-only'>
                        {`${title}에 점자 안내판이 ${data.dots ? '있습니다.' : '없습니다.'}`}
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