import tw from 'twin.macro'
import styled from 'styled-components'

const CategoryItem = styled.button<{ isActive: boolean }>(({ isActive }) => [
  tw`flex-col bg-white py-1 px-3 mr-2 mb-2 border border-gray-300 shadow-sm rounded-2xl cursor-pointer 
    focus:outline-none transition-all duration-100 text-[0.9rem] justify-center items-center`,
  isActive && tw`bg-blue-500 text-white font-fBold`,
])
  
const CItemWrapper = styled.div`
  ${tw`flex justify-center items-center`}
`

const CategoryItemImg = styled.img`
  ${tw`w-4 h-4 mr-1`}
`

interface CategoryTabProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  onclick: () => void
}

const CategoryTab: React.FC<CategoryTabProps> = ({ selectedCategory, setSelectedCategory, onclick }) => {
    return (
        <div className='absolute top-[60px] left-[13px] overflow-hidden z-[2] font-fMedium'>
          <CategoryItem
            onClick={() => setSelectedCategory("entire")}
            isActive={selectedCategory === "entire"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/map.svg' />
              전체
            </CItemWrapper>
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("parking")}
            isActive={selectedCategory === "parking"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/parking.png'/>
              주차장
            </CItemWrapper>
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("toilet")}
            isActive={selectedCategory === "toilet"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/toilet.png' />
              화장실
            </CItemWrapper>
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("elevator")}
            isActive={selectedCategory === "elevator"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/elevator.png' />
              승강기
            </CItemWrapper>
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("ramp")}
            isActive={selectedCategory === "ramp"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/ramp.png' />
              경사로
            </CItemWrapper>
          </CategoryItem>
          <CategoryItem
            onClick={onclick}
            isActive={selectedCategory === "report"}
          >
            <CItemWrapper>
              <CategoryItemImg src='/images/report.png' />
              불편신고
            </CItemWrapper>
          </CategoryItem>
        </div>
    )
}

export default CategoryTab