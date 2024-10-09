import { useState, useEffect } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import tw from 'twin.macro'
import styled from 'styled-components'
import useSpeechToText from './useSpeechToText'
import { pos } from './positions.json'
import Marker from './assets/marker.png'
import MicImg from './assets/mic.png'
import SearchImg from './assets/search.png'
import LocationImg from './assets/location.svg'
import CheckBoxImg from './assets/checkbox.png'
import XBoxImg from './assets/xbox.png'

const CategoryItem = styled.li<{ isActive: boolean }>(({ isActive }) => [
  tw`float-left list-none w-[50px] border-r border-[#acacac] py-[6px] text-center cursor-pointer hover:bg-[#ffe6e6] hover:border-l hover:border-[#acacac] hover:ml-[-1px] last:mr-0 last:border-r-0`,
  isActive && tw`bg-[#eee]`,
])

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

function App() {
  const { transcript, listening, toggleListening } = useSpeechToText()
  //const mapRef = useRef<kakao.maps.Map>(null)
  
  const openReportPage = () => {
    window.open(
      'https://m.naver.com',
      '_black',
      'noopener noreferrer',
    )
  }
  
  const [isVisibleId, setIsVisibleId] = useState<string | null>(null)

  function success(pos: { coords: { latitude: number, longitude: number } }) {
    const coordinates = pos.coords
    console.log(
      `Your location is: ${coordinates.latitude}} ${coordinates.longitude}`
    );
  }
  
  function error(error: { message: unknown }) {
    console.warn(`Error: ${error.message}`)
  }

  // 현재 위치를 저장할 state
  const [state, setState] = useState({
    center: {
      lat: 37.29781,
      lng: 126.835358,
    },
    errMsg: null,
    isLoading: true,
  })

  // 지도의 중심을 저장할 state
  const [mapState, setMapState] = useState({
    center: {
      lat: 37.29781,
      lng: 126.835358,
    },
    isPanto: false,
  })

  const [selectedCategory, setSelectedCategory] = useState("entire")

  function accessCurrentLocation() {
    //현재 위치로 중심을 이동시킴
    setMapState((prev) => ({
      ...prev,
      center: state.center,
      isPanto: true,
    }))
  }

  useEffect(() => {
    const tileset = new kakao.maps.Tileset({
      width: 256,
      height: 256,
      getTile: (x, y, z) => {
        const div = document.createElement('div');
        const whiteBox = document.createElement('div');

        if (z === 4 && x >= 419 && x <= 422 && y >= 940 && y <= 942) {
          return div
        } else if (z === 3 && x >= 838 && x <= 844 && y >= 1879 && y <= 1885){
          return div
        } else if (z === 2 && x >= 1676 && x <= 1688 && y >= 3759 && y <= 3770){
          return div
        } else {
          console.log(`x: ${x}, y: ${y}, out of range`);  // 범위를 벗어난 경우
          whiteBox.style.background = '#fff';
          return whiteBox
        }
      }
    })
    kakao.maps.Tileset.add("ROADMAP", tileset)
  }, [])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name:'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // GeoLocation을 이용해서 접속 위치를 얻어옵니다
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setState((prev) => ({
                ...prev,
                center: {
                  lat: position.coords.latitude, // 위도
                  lng: position.coords.longitude, // 경도
                },
                isLoading: false,
              }))
            },
          )
        } else if(result.state === 'denied'){
          console.log("denial")
        } else {
          console.log("prompt")
          navigator.geolocation.getCurrentPosition(success, error, {
            timeout: 4000,
            maximumAge: 0
          })
        }
      })
    } 
  }, [])

  useEffect(() => {
    /*navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })*/
    navigator.geolocation.watchPosition((pos) => {
      setState((prev) => ({
        ...prev,
        center: {
          lat: pos.coords.latitude, // 위도
          lng: pos.coords.longitude, // 경도
        },
        isLoading: false,
      }))
    })
  }, [])
  
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();

    window.addEventListener("resize", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
    };
  }, []);
  
  const EventMarkerContainer = ({ id, position, content, wheel, elevator, toilet, parking, dots }: { 
    id: string, position: { lat: number, lng: number }, content: string,
    wheel: boolean, elevator: boolean, toilet: boolean, parking: boolean, dots: boolean }) => {  
    
    return (
      <MapMarker
        image={{
          src: Marker,
          size: { width: 25, height: 36 },
        }}
        zIndex={-1} // 마커와의 겹침 문제 해결
        position={position} // 마커를 표시할 위치
        clickable={true} // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정
        onClick={() => setIsVisibleId(String(id))} // 마커를 클릭했을 때 InfoWindow를 표시
      >
        {isVisibleId === id && 
        <>
          <img
            className='flex absolute w-6 h-6 cursor-pointer right-2 top-1'
            src="https://t1.daumcdn.net/localimg/localimages/07/mapjsapi/2x/bt_close.gif"
            onClick={() => setIsVisibleId(null)}
            alt="닫기"
          />
            <div className='p-5 w-[200px]'>  
              <div className='flex mb-4'>{content}</div>
              <CheckboxWrapper>
                <CheckboxItem
                  id="wheel-checkbox"
                  checked={wheel}
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
                  checked={elevator}
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
                  checked={toilet}
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
                  checked={parking}
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
                  checked={dots}
                  type="checkbox" value="" 
                />
                <CheckboxLabel htmlFor="dots-checkbox" />
                  <CheckboxTextLabel>
                    점자 명판
                  </CheckboxTextLabel>
              </CheckboxWrapper>
            </div>
          </>
        }
      </MapMarker>
    )
  }
  
  return (
    <>
      <div id='mapwrap' className='w-full h-screen-vh font-medium'>
        {/* 지도 위에 표시될 마커 카테고리 */}
        <Map
          id='map'
          center={mapState.center} // 지도의 중심 좌표
          isPanto={mapState.isPanto} // 지도의 중심 좌표를 변경할 때 애니메이션 효과를 줄지 여부
          style={{'width': '100%', 'height': '100vh'}} // 지도 크기
          level={3}                                   // 지도 확대 레벨
          minLevel={4}                                // 지도 최소 레벨
          maxLevel={2}                               // 지도 최대 레벨
          onDragEnd={(map) => {
            const latlng = map.getCenter()
            setMapState((prev) => ({
              ...prev,
              center: { lat: latlng.getLat(), lng: latlng.getLng() },
              isPanto: false,
            }))
          }}
          onCreate={map => map.addOverlayMapTypeId(kakao.maps.MapTypeId['ROADMAP'])}
        >
          {pos.map((value, index) => {
            const showMarker =
            selectedCategory === "entire" ||
            (selectedCategory === "wheel" && value.wheel) ||
            (selectedCategory === "elevator" && value.elevator) ||
            (selectedCategory === "toilet" && value.toilet) ||
            (selectedCategory === "parking" && value.parking)
            
            return (
              showMarker && (
                <EventMarkerContainer
                  key={`EventMarkerContainer-${value.lat}-${value.lng}`}
                  id={`marker-${index}`}
                  position={{ lat: value.lat, lng: value.lng }}
                  content={value.title}
                  wheel={value.wheel}
                  elevator={value.elevator}
                  toilet={value.toilet}
                  parking={value.parking}
                  dots={value.dots}
                />
              )
            )
          })}
          {/* 현재 위치 표시 마커 */}
          {!state.isLoading && (
            <MapMarker
              image={{
                src: "https://t1.daumcdn.net/localimg/localimages/07/2018/mw/m640/ico_marker.png",
                size: { width: 30, height: 30 },
              }}
              position={state.center}
            />
          )}
        </Map>
        {/* 지도 위에 표시될 마커 카테고리 */}
        <ul className='absolute top-[10px] left-[10px] rounded-md border border-[#909090] shadow-md bg-white overflow-hidden z-[2]'>
          <CategoryItem
            onClick={() => setSelectedCategory("entire")}
            isActive={selectedCategory === "entire"}
          >
            전체
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("parking")}
            isActive={selectedCategory === "parking"}
          >
            장애인 주차장
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("toilet")}
            isActive={selectedCategory === "toilet"}
          >
            장애인 화장실
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("elevator")}
            isActive={selectedCategory === "elevator"}
          >
            엘레베이터
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("ramp")}
            isActive={selectedCategory === "ramp"}
          >
            경사로
          </CategoryItem>
          <CategoryItem
            onClick={openReportPage}
            isActive={selectedCategory === "report"}
          >
            불편신고
          </CategoryItem>
        </ul>
      </div>
      
      <ul className='absolute bottom-[30px] left-[10px] rounded-md border border-[#909090] shadow-md bg-white overflow-hidden z-[2]'>
        <li className='flex items-center justify-between p-2'>
          <input
            type='text'
            placeholder='  장소를 검색해보세요'
            className='w-full h-8 border border-[#909090] rounded-md'
            value={transcript}
            onChange={() => {}}
          />
          <button className='p-1 ml-2 w-8 h-8 bg-white border border-[#909090] rounded-md'>
            <img
              src={SearchImg}
              alt='검색버튼'
            />
          </button>
          <button
            onClick={() => toggleListening()}
            className='p-1 ml-2 w-8 h-8 bg-white border border-[#909090] rounded-md'
          > 
            <img
              src={MicImg}
              alt={listening ? '음성인식 중지' : '음성인식 시작'}
            />
          </button>
        </li>
      </ul>
      <div className='absolute bottom-[30px] right-[10px] rounded-md border border-[#909090] overflow-hidden z-[2]'>
        <button className='p-2 bg-white'>
          <img 
            src={LocationImg} 
            alt='현재 위치로 이동'
            className='p-1 h-8 w-8' 
            onClick={() => accessCurrentLocation()} />
        </button>
      </div>
    </>
  )
}

export default App
