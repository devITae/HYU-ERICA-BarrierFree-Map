import tw from 'twin.macro';
import styled from 'styled-components';

const CustomZoomControl = styled.div`
  ${tw`absolute bottom-[4.5rem] right-3 w-[2.625rem] h-20 overflow-hidden z-10 bg-white rounded-lg border border-gray-400 bg-center`}
`

const ZoomButton = styled.button`
  ${tw`flex w-[2.55rem] h-10 justify-center items-center cursor-pointer`}
  
  &:first-child {
    ${tw`border-b border-gray-300`}
  }
  
  img {
    ${tw`w-4 h-4`}
  }
`

interface MapControlsProps {
  zoomIn: () => void
  zoomOut: () => void
}

const MapControls: React.FC<MapControlsProps> = ({ zoomIn, zoomOut }) => {
  return (
    <CustomZoomControl>
      <ZoomButton onClick={zoomIn}>
        <img
          src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png"
          alt="확대"
        />
      </ZoomButton>
      <ZoomButton onClick={zoomOut}>
        <img
          src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png"
          alt="축소"
        />
      </ZoomButton>
    </CustomZoomControl>
  )
}

export default MapControls;