import { useState, useEffect, SetStateAction, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
//import { useQuery } from '@tanstack/react-query'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import tw from 'twin.macro'
import styled from 'styled-components'

import CategoryTab from '@/components/CategoryTab'
import Searching from '@/components/Searching'
import InfoAlert from '@/components/InfoAlert'
import DetailsPopup from '@/components/DetailsPopup'
import MapControls from '@/components/MapControls'

import { amenities } from '@/data/amenities'
//import { buildingAPI } from '@/network/positions'
import { pos, parking, ramp } from './positions.json'

const FloorPlan = lazy(() => import('@/components/FloorPlans'))

const CItemWrapper = styled.div`
  ${tw`flex justify-center items-center`}
`

const Button = styled.button`
  ${tw`w-full py-2 text-white text-center bg-blue-500 rounded-lg disabled:bg-gray-300`}
`

const HeaderButton = styled.button`
  ${tw`p-1 ml-2 w-[1.9rem] h-[1.9rem]`}
`

function App() {
  const mapRef = useRef<kakao.maps.Map>(null)
  const refInput = useRef<HTMLInputElement>(null)
  const [isVisibleId, setIsVisibleId] = useState<number | null>(null) // Popup ID
  const [inputValue, setInputValue] = useState('') // 검색창 입력값
  const [isSearchVisible, setSearchVisible] = useState(false) // 검색창 표시 여부
  const [showAlert, setShowAlert] = useState(false) // 알림창 표시 여부
  const [showResults, setShowResults] = useState(false) // 검색 결과 표시 여부
  const [rampSize, setRampSize] = useState(17) // 경사로 마커 사이즈
  const [parkingSize, setParkingSize] = useState(27) // 주차장 마커 사이즈
  const [plusLat, setPlusLat] = useState(0.002) // Popup 실행 시 마커 위치 조정값
  const [targetAlertName, setTargetAlertName] = useState('info') // Alert 창 종류
  const [hasFocused, setHasFocused] = useState(false) // 최초 포커스 여부 관리

  // 지도 확대 레벨을 저장할 state
  const [mapLevel, setMapLevel] = useState(
    (navigator.userAgent.indexOf('iPhone') 
      || navigator.userAgent.indexOf('Android')) > -1 
      ? 4 : 3 // 초기 값 : pc 화면 : 3 / 모바일 : 4  
  )

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

  // 카테고리 선택을 저장할 state
  const [selectedCategory, setSelectedCategory] = useState("entire")

  const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches
  if (isAndroidPWA) {
    const installAboutElement = document.getElementById('install-about')
    if (installAboutElement) {
      installAboutElement.classList.add('invisible')
    }
  }

  /** API 호출
  const positions = useQuery({
    queryKey: ['building'],
    queryFn: buildingAPI,
    staleTime: 5 * 60 * 1000,
  })

  const pos = positions.data?.pos ?? []
  const ramp = positions.data?.ramp ?? []
  const parking = positions.data?.parking ?? []
  */
  
  const toggleSearch = () => {
    setSearchVisible(!isSearchVisible)
  }

  const handleAlertOpen = ( target : string ) => {
    setTargetAlertName(target)
    setShowAlert(true)
  }

  const handleAlertClose = () => {
    setShowAlert(false)
  }

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInputValue(e.target.value)
    setShowResults(false)
  }
  
  const openReportPage = () => {
    window.open(
      'https://naver.me/xbAgSdy4',
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

  function accessCurrentLocation() {
    if (state.center === mapState.center) {
      // 두 번 클릭 시 중심을 캠퍼스로 이동 (현재 위치 == 지도 중심 같을 때)
      setMapState((prev) => ({
        ...prev,
        center: { lat: 37.29781, lng: 126.835358 },
        isPanto: true,
      }))
    } else {
      // 현재 위치로 중심을 이동시킴
      setMapState((prev) => ({
        ...prev,
        center: state.center,
        isPanto: true,
      }))
    }
  }

  function handleMapMarker(id: number, lat: number, lng: number) {  
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

  // 검색창 열때 input에 포커스
  useEffect(() => {
    if (refInput.current) {
      refInput.current?.focus()
    }
  }, [isSearchVisible])

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
    if(mapLevel === 2) {
      setRampSize(19)
      setPlusLat(0.001)
      setParkingSize(35)
    } else if(mapLevel === 3) {
      setRampSize(17)
      setPlusLat(0.002)
      setParkingSize(27)
    } else if(mapLevel === 4) {
      setRampSize(14)
      setPlusLat(0.0039)
      setParkingSize(22)
    } else if(mapLevel === 5) {
      setRampSize(10)
      setPlusLat(0.0073)
      setParkingSize(18)
    }
  }, [mapLevel])

  useEffect(() => {
    kakao.maps.load(() => {
      const tileset = new kakao.maps.Tileset({
        width: 256,
        height: 256,
        getTile: (x, y, z) => {
          const div = document.createElement('div');
          const whiteBox = document.createElement('div');
          whiteBox.style.background = '#fff';

          if (z === 2 && x >= 1676 && x <= 1688 && y >= 3759 && y <= 3770) {
            return div;
          } else if (z === 3 && x >= 838 && x <= 844 && y >= 1879 && y <= 1885) {
            return div;
          } else if (z === 4 && x >= 419 && x <= 422 && y >= 940 && y <= 942) {
            return div;
          } else if (z === 5 && x >= 209 && x <= 211 && y >= 469 && y <= 471) {
            return div;
          } else {
            // 범위를 벗어난 경우 흰색으로 처리
            return whiteBox;
          }
        },
      })
      kakao.maps.Tileset.add('ROADMAP', tileset)
    })
  }, [])

  useEffect(() => {
    // 스크린 리더가 카카오 로고 및 스케일 요소 읽지 않도록 설정
    window.addEventListener('load', () => {
      const targetElement = document.querySelector(
        'div[style="position: absolute; cursor: default; z-index: 1; margin: 0px 6px; height: 19px; line-height: 14px; left: 0px; bottom: 0px; color: rgb(0, 0, 0);"]'
      )
    
      if (targetElement) {
        targetElement.setAttribute('aria-hidden', 'true') // 스크린 리더 무시 설정
        targetElement.setAttribute('role', 'presentation')
        targetElement.setAttribute('tabindex', '-1') // 포커스 제거
      }
    })
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
    }

    setViewportHeight()
    window.addEventListener("resize", setViewportHeight)

    return () => {
      window.removeEventListener("resize", setViewportHeight)
    }
  }, [])
  
  const EventMarkerContainer = ({ id, position, content, amenityData }: {
      id: number, position: { lat: number, lng: number }, content: string, amenityData: amenities
    }) => {  
    return (
      <MapMarker
        image={{
          src: '/images/marker.png',
          size: { width: 25, height: 36 },
        }}
        zIndex={-2} // 마커와의 겹침 문제 해결
        position={position} // 마커를 표시할 위치
        clickable={true} // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정
        onClick={() => handleMapMarker(id, position.lat, position.lng)} // 마커를 클릭했을 때 InfoWindow를 표시
      >
        {isVisibleId === id &&
          <>
            {/* 세부 정보 팝업 UI */}
            <DetailsPopup 
              id={id} 
              title={content} 
              data={amenityData}
              isVisibleId={isVisibleId}
              hasFocused={hasFocused}
              setHasFocused={setHasFocused}
            />
            <div className='flex justify-center text-[0.8rem] px-5 pb-5 pt-1'>
              <Link
                className='w-full mr-3'
                to={!amenityData.floorplan ? '#' : `/floorplan/${id}`}
                state={{
                  title: content,
                  floors: amenityData.floors
                }}
              >
                <Button 
                  disabled={!amenityData.floorplan}
                >
                  건물 평면도
                </Button>
              </Link>
              <Button
                onClick={() => setIsVisibleId(null)}
              >
                닫기
              </Button>
            </div>
          </>
        }
      </MapMarker>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
            {/* 헤더 */}
            <header className="fixed flex justify-between items-center top-0 left-0 w-full bg-white shadow-lg h-12 px-4 z-50 select-none touch-none">
              <div 
                className='pl-[0.2rem] flex items-center cursor-pointer'
                onClick={() => window.location.reload()}
              >
                  <img 
                    className='w-5 mr-2' 
                    src='/images/logo.png' 
                    alt='길편하냥 로고'
                  />
                  <h1
                    aria-label='길편하냥 타이틀 텍스트'
                    className="text-lg font-fBold tracking-tight"
                  >
                    길편하냥
                  </h1>
              </div>
              <div className='flex right-0 items-center'>
                <HeaderButton 
                  id='install-about'
                  className='pwa:invisible'
                  onClick={() => handleAlertOpen('pwa')}
                >
                    <img 
                      src='/images/download-square.svg'
                      className='fill-black'
                      alt='앱 설치 안내' 
                    />
                </HeaderButton>
                <HeaderButton 
                  onClick={() => handleAlertOpen('info')}
                >
                    <img 
                      src='/images/info.svg'
                      alt='사이트 정보' 
                    />
                </HeaderButton>
                <HeaderButton 
                  onClick={toggleSearch}
                >
                    <img 
                      src='/images/search.svg'
                      alt={!isSearchVisible ? '검색창 열기' : '검색창 닫기'} 
                    />
                </HeaderButton>
              </div>
    
              {isSearchVisible && (
                <div className="absolute top-12 left-0 w-full bg-white p-4 shadow-md z-50 font-fMedium">
                  <h2 className="flex text-md mb-2 font-fBold">장소 검색</h2>
                    <div className='h-12 flex justify-center items-center gap-2'>
                      <input
                        ref={refInput}
                        type="text"
                        placeholder="장소를 검색하세요."
                        className="w-full h-11 border border-[#002060] rounded-md p-2 pointer-events-auto touch-auto"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') setShowResults(true) }}
                      />
                      <CItemWrapper>
                        <button
                          onClick={() => handleAlertOpen('mic')}
                          className='h-11 w-11 bg-white border border-[#002060] rounded-md p-2'
                        > 
                          <img
                            src='/images/mic.png'
                            alt='음성 인식하여 검색어 입력하기'
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
                            alt='검색'
                          />
                        </button>
                      </CItemWrapper>
                    </div>
                    {showResults && 
                      <Searching
                        value={inputValue}
                        plusLat={plusLat}
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
                    targetName={targetAlertName}
                    setInputValue={setInputValue}
                    setShowResults={setShowResults}
                  />
                )}
              </header>
              
              {/* 지도 */}
              <div id='mapwrap' className='w-full h-screen-vh font-fMedium tracking-tight select-none touch-none'>
                {/* 지도 위에 표시될 마커 카테고리 */}
                <CategoryTab 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onclick={openReportPage}
                />
                { /* 지도 확대, 축소 컨트롤 div 입니다 */ }
                <MapControls 
                  zoomIn={zoomIn} 
                  zoomOut={zoomOut} 
                />
                { /** 현재 위치로 이동 버튼 */ }
                <div className='absolute bottom-[45px] right-3 rounded-md border border-gray-400 overflow-hidden z-[2]'>
                  <button className='p-2 bg-white flex items-center justify-center'>
                    <img 
                      src='/images/location.png'
                      alt='현재 위치로 이동'
                      className='w-6' 
                      onClick={() => accessCurrentLocation()} />
                  </button>
                </div>
                <Map
                  id='map'
                  ref={mapRef}
                  center={mapState.center} // 지도의 중심 좌표
                  isPanto={mapState.isPanto} // 지도의 중심 좌표를 변경할 때 애니메이션 효과를 줄지 여부
                  style={{'width': '100%', 'height': '100vh'}} // 지도 크기
                  level={mapLevel}  // 지도 확대 레벨
                  minLevel={5}  // 지도 최소 레벨
                  maxLevel={2}  // 지도 최대 레벨
                  onDragEnd={(map) => {
                    const latlng = map.getCenter()
                    setMapState((prev) => ({
                      ...prev,
                      center: { lat: latlng.getLat(), lng: latlng.getLng() },
                      isPanto: false,
                    }))
                  }}
                  onZoomChanged={(map) => {
                    const level = map.getLevel()
                    setMapLevel(level)
                  }}
                  onCreate={map => map.addOverlayMapTypeId(kakao.maps.MapTypeId['ROADMAP'])}
                >
                  {/* 지도 위에 표시될 마커 */}
                  {pos.map((value) => {
                    const showMarker =
                    selectedCategory === "entire" ||
                    (selectedCategory === "wheel" && value.wheel) ||
                    (selectedCategory === "elevator" && value.elevator) ||
                    (selectedCategory === "toilet" && value.toilet)
                    
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
                            dots: value.dots,
                            floorplan: value.floorplan,
                            floors: value.floors || [],
                            caution: value.caution
                          }}
                        />
                      )
                    )
                  })}

                  { /** 경사로 마커 */
                    ramp.map((value) => {
                      const showMarker = (selectedCategory === "entire" || selectedCategory === "ramp")
                      return (
                        showMarker && (
                          <MapMarker
                            image={{
                              src: "/images/rampMarker.png",
                              size: { width: rampSize, height: rampSize },
                            }}
                            position={{ lat: value.lat, lng: value.lng }}
                            zIndex={-2}
                          />
                        )
                      )
                    }
                  )}

                  { /** 장애인 주차장 마커 */
                    parking.map((value) => {
                      const showMarker = (selectedCategory === "entire" || selectedCategory === "parking")
                      return (
                        showMarker && (
                          <MapMarker
                            image={{
                              src: "/images/parkingMarker.png",
                              size: { width: parkingSize, height: parkingSize },
                            }}
                            position={{ lat: value.lat, lng: value.lng }}
                            zIndex={-1}
                          />
                        )
                      )
                    }
                  )}
                  
                  {/* 현재 위치 표시 마커 */}
                  {!state.isLoading && (
                    <MapMarker
                      image={{
                        src: "https://t1.daumcdn.net/localimg/localimages/07/2018/mw/m640/ico_marker.png",
                        size: { width: 30, height: 30 },
                      }}
                      position={state.center}
                      zIndex={-1}
                    />
                  )}
                </Map>
              </div>
            </>
          } />
          <Route path="/floorplan/:id" element={
              <Suspense fallback={<div>Loading...</div>}>
                <FloorPlan />
              </Suspense>
            } 
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App