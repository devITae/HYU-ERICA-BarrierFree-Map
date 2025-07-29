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

const CheckboxWrapper = styled.div<{ id?: boolean, isCaution?: boolean }>`
    ${tw`flex items-center justify-center rounded-lg p-1 px-2`}

    ${({ id }) => id ? tw`bg-blue-100` : tw`bg-red-100`}
    ${({ isCaution }) => isCaution && tw`bg-[#ffea9d]`}
`

const CheckboxItem = styled.input`
    ${tw`hidden`}
`

const CheckboxLabel = styled.label`
    ${tw`block w-[0.9rem] h-[0.9rem] bg-no-repeat bg-center bg-contain not-sr-only`}
        background-image: url('/images/xbox.png');

    input:checked + & {
        background-image: url('/images/checkbox.png');
    }
    
    input:checked + #caution& {
        background-image: url('/images/cautionBox.png');
    }
`

const CheckboxTextLabel = styled.label`
    ${tw`ml-1.5 text-[0.8rem]`}
`

const FacilityItem = styled.div`
    ${tw`flex flex-col w-full items-center justify-center rounded-md p-2 shadow-md bg-white border`}
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
                className='pl-5 pr-5 pt-5'
            >  
                <div className='sr-only'>
                    {`다음은 ${id}번 건물인 ${title}에 대한 시설정보 입니다`}
                </div>
                <div
                    tabIndex={-1}
                    aria-hidden={true}
                    className='flex mb-4 font-fBold border-transparent focus:border-transparent focus:ring-0 items-center'
                >
                    <div
                        aria-hidden={true}
                        className='font-fBold bg-blue-800 text-white p-1 mr-1.5 text-sm rounded-[0.4rem] text-center justify-center'
                    >
                        {id}
                    </div>
                    {title}
                </div>

                <div className='flex gap-3 mb-3'>
                    <FacilityItem>
                        <img 
                            className='h-7 user-drag-none' 
                            src='/images/wheelchair.png' 
                            alt='다음은 이용 시 휠체어 진입여부입니다.' 
                        />
                        <p className='py-1 text-[0.82rem]' aria-hidden={true}>
                            휠체어 진입
                        </p>
                        <CheckboxWrapper id={data.wheel}>
                            <CheckboxItem
                                id="wheel-checkbox"
                                checked={data.wheel}
                                type="checkbox"
                                aria-hidden={true}
                            />
                            <CheckboxLabel htmlFor="wheel-checkbox" aria-hidden={true} />
                            <CheckboxTextLabel aria-hidden={true} >
                                {data.wheel ? '가능' : '불가'}
                            </CheckboxTextLabel>
                            <div className='sr-only'>
                                {`${title}엔 휠체어의 진입이 ${data.wheel ? '가능합니다.' : '불가합니다.'}`}
                            </div>
                        </CheckboxWrapper>
                    </FacilityItem>

                    <FacilityItem>
                        <img 
                            className='h-8 user-drag-none' 
                            src='/images/elevator.png' 
                            alt='다음은 이용 시 승강기 여부입니다.' 
                        />
                        <p className='py-1 text-[0.82rem]' aria-hidden={true}>
                            승강기 이용
                        </p>
                        <CheckboxWrapper id={data.elevator}>
                            <CheckboxItem
                                id="wheel-checkbox"
                                checked={data.elevator}
                                type="checkbox"
                                aria-hidden={true}
                            />
                            <CheckboxLabel htmlFor="wheel-checkbox" aria-hidden={true} />
                            <CheckboxTextLabel aria-hidden={true} >
                                {data.elevator ? '가능' : '불가'}
                            </CheckboxTextLabel>
                            <div className='sr-only'>
                                {`${title}에 승강기가 ${data.elevator ? '있습니다.' : '없습니다.'}`}
                            </div>
                        </CheckboxWrapper>
                    </FacilityItem>
                </div>

                <div className='flex gap-3 mb-3'>
                    <FacilityItem>
                        <img 
                            className='h-7 user-drag-none' 
                            src='/images/toilet.png' 
                            alt='다음은 장애인 화장실 여부 입니다.' 
                        />
                        <p className='py-1 text-[0.82rem]' aria-hidden={true}>
                            장애인 화장실
                        </p>
                        <CheckboxWrapper id={data.toilet} isCaution={id === 401 || id === 100}>
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
                                {data.toilet ? '있음' : '없음'}
                            </CheckboxTextLabel>
                            <div className='sr-only'>
                                {`${title}에 장애인 화장실이 ${data.toilet ? '있습니다.' : '없습니다.'}`}
                            </div>
                        </CheckboxWrapper>
                    </FacilityItem>

                    <FacilityItem>
                        <img 
                            className='h-7 user-drag-none' 
                            src='/images/dots.png' 
                            alt='다음은 점자 안내판 여부입니다.' 
                        />
                        <p className='py-1 text-[0.82rem]' aria-hidden={true}>
                            점자 안내판
                        </p>
                        <CheckboxWrapper id={data.dots}>
                            <CheckboxItem
                                id="dots-checkbox"
                                checked={data.dots}
                                type="checkbox" value="" 
                                aria-hidden={true}
                            />
                            <CheckboxLabel htmlFor="dots-checkbox" aria-hidden={true} />
                            <CheckboxTextLabel aria-hidden={true} >
                                {data.dots ? '있음' : '없음'}
                            </CheckboxTextLabel>
                            <div className='sr-only'>
                                {`${title}에 점자 안내판이 ${data.dots ? '있습니다.' : '없습니다.'}`}
                            </div>
                        </CheckboxWrapper>
                    </FacilityItem>
                </div>

                {
                    data.caution !== '' ? (
                        <>
                            <div className='flex flex-col rounded-lg p-3 mb-2 bg-yellow-50 shadow-lg border border-amber-300'>
                                <div className='flex mb-1'>
                                    <img 
                                        className='w-5 mr-1.5 user-drag-none' 
                                        src='/images/caution.png' 
                                        alt='다음은 이용 시 주의사항 입니다.' 
                                    />
                                    <p className='text-[0.8rem] font-fBold' aria-hidden={true}>
                                        이용 시 주의사항
                                    </p>
                                </div>
                                <div className='text-[0.75rem]'>
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