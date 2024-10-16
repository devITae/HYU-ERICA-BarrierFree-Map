import tw from 'twin.macro'
import styled from 'styled-components'
import { amenities } from '@/data/amenities'

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
`

const CheckboxTextLabel = styled.label`
    ${tw`ml-2 text-sm`}
`

const DetailsPopup = (content : string , data : amenities) => {
    return (
        <>
            <div className='pl-5 pr-5 pt-5 w-[230px]'>  
                <div className='flex mb-4'>{content}</div>
                <CheckboxWrapper>
                    <CheckboxItem
                        id="wheel-checkbox"
                        checked={data.wheel}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="wheel-checkbox" />
                    <CheckboxTextLabel>
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
                    <CheckboxTextLabel>
                        승강기
                    </CheckboxTextLabel>
                </CheckboxWrapper>

                <CheckboxWrapper>
                    <CheckboxItem
                        id="toilet-checkbox"
                        checked={data.toilet}
                        type="checkbox" value="" 
                    />
                    <CheckboxLabel htmlFor="toilet-checkbox" />
                    <CheckboxTextLabel>
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
                    <CheckboxTextLabel>
                        점자안내판 (촉지도)
                    </CheckboxTextLabel>
                </CheckboxWrapper>

                {
                    data.caution !== '' ? (
                        <>
                            <div className='flex items-center rounded-lg px-3 py-2 mb-2 bg-red-100'>
                                <img className='w-6 h-6 user-drag-none' src='/images/caution.png' alt='주의사항' />
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