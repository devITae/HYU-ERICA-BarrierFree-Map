import tw from 'twin.macro'
import styled from 'styled-components'
import CheckBoxImg from '../assets/images/checkbox.png'
import XBoxImg from '../assets/images/xbox.png'
import { amenities } from '@/data/amenities'

const CheckboxWrapper = styled.div`
    ${tw`flex items-center bg-blue-50 rounded-lg p-2 mb-2`}
`

const CheckboxItem = styled.input`
    ${tw`hidden`}
`

const CheckboxLabel = styled.label`
    ${tw`block w-4 h-4 bg-no-repeat bg-center bg-contain cursor-pointer`}
        background-image: url(${XBoxImg});

    input:checked + & {
        background-image: url(${CheckBoxImg});
    }
`

const CheckboxTextLabel = styled.label`
    ${tw`ml-2 text-sm`}
`

const detailsPopup = (content : string , data : amenities) => {
    return (
        <>
            <div className='p-5 w-[200px]'>  
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
                    id="parking-checkbox"
                    checked={data.parking}
                    type="checkbox" value="" 
                />
                <CheckboxLabel htmlFor="parking-checkbox" />
                    <CheckboxTextLabel>
                        장애인 주차장
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
                        점자 명판
                    </CheckboxTextLabel>
                </CheckboxWrapper>
            </div>
        </>
    )
}

export default detailsPopup