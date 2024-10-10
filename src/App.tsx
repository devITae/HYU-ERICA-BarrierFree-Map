import { useState, useEffect, SetStateAction } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import tw from 'twin.macro'
import styled from 'styled-components'
import Header from './components/Header'
import useSpeechToText from './components/useSpeechToText'
import { amenities } from './data/amenities'
import detailsPopup from './components/detailsPopup'
import { pos } from './positions.json'
import Marker from './assets/images/marker.png'
import MicImg from './assets/images/mic.png'
import SearchImg from './assets/images/search.png'
import LocationImg from './assets/images/location.svg'

const CategoryItem = styled.button<{ isActive: boolean }>(({ isActive }) => [
  tw`bg-white py-1 px-3 mr-2 mb-2 border rounded-2xl cursor-pointer hover:bg-blue-100`,
  isActive && tw`bg-blue-300`,
])

function App() {
  const { transcript, listening, toggleListening } = useSpeechToText()
  const [isVisibleId, setIsVisibleId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInputValue(e.target.value)
  }
  //const mapRef = useRef<kakao.maps.Map>(null)
  
  const openReportPage = () => {
    window.open(
      'https://m.naver.com',
      '_black',
      'noopener noreferrer',
    )
  }

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
        } else if (z === 5 && x >= 209 && x <= 211 && y >= 469 && y <= 471){
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

    setViewportHeight()
    window.addEventListener("resize", setViewportHeight)

    return () => {
      window.removeEventListener("resize", setViewportHeight)
    };
  }, []);
  
  const EventMarkerContainer = ({ id, position, content, amenityData }: { 
    id: string, position: { lat: number, lng: number }, content: string, amenityData: amenities
  }) => {  
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
            {/* 세부 정보 팝업 UI */}
            {detailsPopup(content, amenityData)} 
            <div className='flex justify-center text-[0.8rem] pl-5 pr-5 pb-5'>
              <button 
                className='w-full py-2 mr-3 text-white bg-blue-500 rounded-lg'
              >
                건물 평면도
              </button>
              <button 
                className='w-full py-2 text-white bg-blue-500 rounded-lg' 
                onClick={() => setIsVisibleId(null)}
              >
                닫기
              </button>
            </div>
          </>
        }
      </MapMarker>
    )
  }
  
  return (
    <>
      <div id='mapwrap' className='w-full h-screen-vh font-medium tracking-tight select-none'>
        {/* 지도 위에 표시될 마커 카테고리 */}
        <Map
          id='map'
          center={mapState.center} // 지도의 중심 좌표
          isPanto={mapState.isPanto} // 지도의 중심 좌표를 변경할 때 애니메이션 효과를 줄지 여부
          style={{'width': '100%', 'height': '100vh'}} // 지도 크기
          level={3}                                   // 지도 확대 레벨
          minLevel={5}                                // 지도 최소 레벨
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
                  amenityData={{
                    wheel: value.wheel,
                    elevator: value.elevator,
                    toilet: value.toilet,
                    parking: value.parking,
                    dots: value.dots
                  }}
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
        <Header />
        {/* 지도 위에 표시될 마커 카테고리 */}
        <div className='absolute top-[60px] left-[10px] overflow-hidden z-[2]'>
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
        </div>
      </div>
      
      <ul className='absolute bottom-[30px] left-[10px] rounded-md border border-[#909090] shadow-md bg-white overflow-hidden z-[2]'>
        <li className='flex items-center justify-between p-2'>
          <input
            type='text'
            placeholder='  장소를 검색해보세요'
            className='w-full h-8 border border-[#909090] rounded-md'
            value={inputValue || transcript}
            onChange={handleChange}
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
