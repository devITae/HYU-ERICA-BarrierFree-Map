import { useState, useEffect, SetStateAction, useRef } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import tw from 'twin.macro'
import styled from 'styled-components'

import { useSpeechToText } from '@/components/useSpeechToText'
import CategoryTab from '@/components/CategoryTab'
import Searching from '@/components/Searching'
import InfoAlert from '@/components/InfoAlert'
import DetailsPopup from '@/components/DetailsPopup'
import MapControls from '@/components/MapControls'

import { amenities } from '@/data/amenities'
import { pos } from './positions.json'


const CItemWrapper = styled.div`
  ${tw`flex justify-center items-center`}
`

function App() {
  const mapRef = useRef<kakao.maps.Map>(null)
  const { transcript, listening, toggleListening } = useSpeechToText()
  const [isVisibleId, setIsVisibleId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSearchVisible, setSearchVisible] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible)
  }

  const handleAlertOpen = () => {
    setShowAlert(true)
  }

  const handleAlertClose = () => {
    setShowAlert(false)
  }

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInputValue(e.target.value)
  }
  
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

  const zoomIn = () => {
    const map = mapRef.current
    if (!map) return
    map.setLevel(map.getLevel() - 1)
  }

  const zoomOut = () => {
    const map = mapRef.current
    if (!map) return
    map.setLevel(map.getLevel() + 1)
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

  function handleMapMarker(id: number, lat: number, lng: number) {
    let plusLat = 0
    const map = mapRef.current
    if (map) {
      const level = map.getLevel()
      if(level === 2) plusLat = 0.001
      else if(level === 3) plusLat = 0.002
      else if(level === 4) plusLat = 0.0035
      else if(level === 5) plusLat = 0.0073
    } else {
      console.log('Map reference not available');
    }
    
    setMapState(() => ({
      center: { 
        lat: lat + plusLat, 
        lng: lng
      },
      isPanto: true,
    }))

    // 렌더링 겹침 문제 해결 위해 시간 차를 두고 setIsVisibleId(id) 실행
    setTimeout(() => {
      setIsVisibleId(id)
    }, 240)
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    if(inputValue === '' && showResults === true)
      setShowResults(false)
  }, [showResults, inputValue])

  useEffect(() => {
    const tileset = new kakao.maps.Tileset({
      width: 256,
      height: 256,
      getTile: (x, y, z) => {
        const div = document.createElement('div')
        const whiteBox = document.createElement('div')
        whiteBox.style.background = '#fff'

        if (z === 2 && x >= 1676 && x <= 1688 && y >= 3759 && y <= 3770){
          return div
        } else if (z === 3 && x >= 838 && x <= 844 && y >= 1879 && y <= 1885){
          return div
        } else if (z === 4 && x >= 419 && x <= 422 && y >= 940 && y <= 942){
          return div
        } else if (z === 5 && x >= 209 && x <= 211 && y >= 469 && y <= 471){
          return div
        } else {
          // 범위를 벗어난 경우 흰색으로 처리
          //console.log(`x: ${x}, y: ${y}, out of range`);  
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
      id: number, position: { lat: number, lng: number }, content: string, amenityData: amenities
    }) => {  
    return (
      <MapMarker
        image={{
          src: '/images/marker.png',
          size: { width: 25, height: 36 },
        }}
        zIndex={-1} // 마커와의 겹침 문제 해결
        position={position} // 마커를 표시할 위치
        clickable={true} // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정
        onClick={() => handleMapMarker(id, position.lat, position.lng)} // 마커를 클릭했을 때 InfoWindow를 표시
      >
        {isVisibleId === id &&
          <>
            {/* 세부 정보 팝업 UI */}
            {DetailsPopup(content, amenityData)} 
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
      {/* 헤더 */}
      <header className="fixed flex justify-between items-center top-0 left-0 w-full bg-white shadow-lg h-12 px-4 z-50 select-none">
        <div className='flex items-center'>
            <img className='w-4 mr-3' src='/images/marker.png' />
            <h1 className="text-lg font-bold tracking-tighter">오픈하냥</h1>
        </div>
        <div className='flex right-0 items-center'>
            <button 
              className='p-1 ml-2 w-7 h-7 bg-white rounded-md'
              onClick={handleAlertOpen}
            >
                <img 
                  src='/images/info.svg'
                  alt='사이트 정보' 
                />
            </button>
            <button 
              className='p-1 ml-2 w-7 h-7 bg-white rounded-md'
              onClick={toggleSearch}
            >
                <img 
                  src='/images/search.png'
                  alt={!isSearchVisible ? '검색창 열기' : '검색창 닫기'} 
                />
            </button>
        </div>

        {isSearchVisible && (
          <div className="absolute top-12 left-0 w-full bg-white p-4 shadow-md z-50">
            <h2 className="flex text-md mb-2">장소 검색</h2>
            <div className='h-12 flex justify-center items-center gap-2'>
              <input
                type="text"
                placeholder="장소를 검색하세요"
                className="w-full h-11 border border-[#002060] rounded-md p-2"
                value={inputValue || transcript}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === 'Enter') setShowResults(true) }}
              />
              <CItemWrapper>
                <button
                  onClick={() => toggleListening()}
                  className='h-11 w-11 bg-white border border-[#002060] rounded-md p-2'
                > 
                  <img
                    src='/images/mic.png'
                    alt={listening ? '음성인식 중지' : '음성인식 시작'}
                  />
                </button>
              </CItemWrapper>

              <CItemWrapper>
                <button 
                  className='h-11 w-11 bg-white border border-[#002060] rounded-md p-2'
                  onClick={() => setShowResults(true)}
                >
                  <img
                    src='/images/search2.png'
                    alt='검색버튼'
                  />
                </button>
              </CItemWrapper>
            </div>
            {showResults && 
              <Searching
                value={inputValue || transcript}
                level={mapRef.current?.getLevel() || 3}
                setIsVisibleId={setIsVisibleId}
                setSearchVisible={setSearchVisible}
                setInputValue={setInputValue}
                setMapState={setMapState}
              />
            }
          </div>
        )}
        {showAlert && (
          <InfoAlert
            onClose={handleAlertClose}
          />
        )}
      </header>
        
      {/* 지도 */}
      <div id='mapwrap' className='w-full h-screen-vh font-medium tracking-tight select-none'>
        {/* 지도 위에 표시될 마커 카테고리 */}
        <Map
          id='map'
          ref={mapRef}
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
          {pos.map((value) => {
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
                  id={value.id}
                  position={{ lat: value.lat, lng: value.lng }}
                  content={value.title}
                  amenityData={{
                    wheel: value.wheel,
                    elevator: value.elevator,
                    toilet: value.toilet,
                    parking: value.parking,
                    dots: value.dots,
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
        {/* 지도 확대, 축소 컨트롤 div 입니다 */}
        <MapControls 
          zoomIn={zoomIn} 
          zoomOut={zoomOut} 
        />
        {/* 지도 위에 표시될 마커 카테고리 */}
        <CategoryTab 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onclick={openReportPage}
        />
      </div>
      
      <div className='absolute bottom-[45px] right-3 rounded-md border border-gray-400 overflow-hidden z-[2]'>
        <button className='p-2 bg-white flex items-center justify-center'>
          <img 
            src='/images/location.png'
            alt='현재 위치로 이동'
            className='w-6' 
            onClick={() => accessCurrentLocation()} />
        </button>
      </div>
    </>
  )
}

export default App
