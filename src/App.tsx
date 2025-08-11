import { useState, useMemo, useEffect, SetStateAction, useRef, lazy, Suspense } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
//import { useQuery } from '@tanstack/react-query'
import { Map, MapMarker, Polygon, DrawingManager, Toolbox } from 'react-kakao-maps-sdk'
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
  const divRampRef = useRef<HTMLDivElement>(null)
  const refInput = useRef<HTMLInputElement>(null)
  const [isVisibleId, setIsVisibleId] = useState<number | null>(null) // Popup ID
  const [inputValue, setInputValue] = useState('') // 검색창 입력값
  const [isSearchVisible, setSearchVisible] = useState(false) // 검색창 표시 여부
  const [showAlert, setShowAlert] = useState(false) // 알림창 표시 여부
  const [showResults, setShowResults] = useState(false) // 검색 결과 표시 여부
  const [markerSize, setMarkerSize] = useState({width: 25, height: 36}) // 건물 마커 사이즈
  const [rampSize, setRampSize] = useState(17) // 경사로 마커 사이즈
  const [parkingSize, setParkingSize] = useState(27) // 주차장 마커 사이즈
  const [plusLat, setPlusLat] = useState(0.002) // Popup 실행 시 마커 위치 조정값
  const [targetAlertName, setTargetAlertName] = useState('info') // Alert 창 종류
  const [hasFocused, setHasFocused] = useState(false) // 최초 포커스 여부 관리
  //const [isMouseOver, setIsMouseOver] = useState(false)
  const [ready] = useState(false)         // DrawingManager 렌더 여부
  /** Kakao Maps DrawingManager 관련 코드
   * 
   *   
  const [OT, setOT] = useState<unknown>(null)           // kakao.maps.drawing.OverlayType
  const [ready, setReady] = useState(false)         // DrawingManager 렌더 여부
  const managerRef =
    useRef<
      kakao.maps.drawing.DrawingManager<
        | kakao.maps.drawing.OverlayType.ARROW
        | kakao.maps.drawing.OverlayType.CIRCLE
        | kakao.maps.drawing.OverlayType.ELLIPSE
        | kakao.maps.drawing.OverlayType.MARKER
        | kakao.maps.drawing.OverlayType.POLYLINE
        | kakao.maps.drawing.OverlayType.RECTANGLE
        | kakao.maps.drawing.OverlayType.POLYGON
      >
  >(null)

  const xyToLatLng = ({ x, y }: { x: number; y: number }) => ({ lat: y, lng: x });
  // 방법 1) getData() 사용 (도형 좌표/옵션을 순수 데이터로 반환)
  const dumpByGetData = () => {
    const mgr = managerRef.current;
    if (!mgr) return;
    const data = mgr.getData(); // arrow, circle, ellipse, marker, polygon, polyline, rectangle
    const out = {
      polygon: data.polygon.map(({ points }) => points.map(xyToLatLng)),
      polyline: data.polyline.map(({ points }) => points.map(xyToLatLng)),
      arrow: (data as unknown).arrow?.map(({ points }: unknown) => points.map(xyToLatLng)) ?? [],
      rectangle: data.rectangle.map(({ sPoint, ePoint }) => {
        const sw = xyToLatLng(sPoint);
        const ne = xyToLatLng(ePoint);
        // 네 꼭짓점(시계방향)으로 변환
        return [
          sw,
          { lat: sw.lat, lng: ne.lng },
          ne,
          { lat: ne.lat, lng: sw.lng },
        ];
      }),
      circle: data.circle.map(({ center, radius }) => ({ center: xyToLatLng(center), radius })),
      ellipse: data.ellipse.map(({ center, rx, ry }) => ({ center: xyToLatLng(center), rx, ry })),
      marker: data.marker.map(({ x, y }) => ({ lat: y, lng: x })),
    };
    console.log('BY getData()', out);
  };

  // {lat, lng}[] -> [lat, lng][] 로 변환
  function toPairs(
    coords: Array<{ lat: number; lng: number }>,
    opt: { dedupeClose?: boolean; precision?: number } = {}
  ): [number, number][] {
    const { dedupeClose = true, precision = 14 } = opt
    const eps = 10 ** -precision

    const pairs = coords.map(({ lat, lng }) => [
      +lat.toFixed(precision),
      +lng.toFixed(precision),
    ]) as [number, number][]

    if (dedupeClose && pairs.length > 1) {
      const [fLat, fLng] = pairs[0]
      const [lLat, lLng] = pairs[pairs.length - 1]
      if (Math.abs(fLat - lLat) < eps && Math.abs(fLng - lLng) < eps) {
        pairs.pop() // 폴리곤 닫힘점 제거
      }
    }
    return pairs
  }
  const fmtNum = (n: number, precision = 14) =>
  n.toFixed(precision).replace(/\.?0+$/, '')

  const pairsToText = (pairs: [number, number][], withKey = true) => {
    const lines = pairs.map(([lat, lng]) => `  [${fmtNum(lat)}, ${fmtNum(lng)}]`)
    return withKey ? `"polygon": [\n${lines.join(',\n')}\n]` : `[\n${lines.join(',\n')}\n]`
  }

  const dumpByGetOverlays = () => {
    const mgr = managerRef.current
    if (!mgr) return

    const data = mgr.getData()

    // Kakao drawing의 점은 {x, y} = {lng, lat}
    const xyToLatLng = ({ x, y }: { x: number; y: number }) => ({ lat: y, lng: x })

    // 폴리곤이 1개라면 단일 배열로, 여러 개면 그대로 배열의 배열로
    //const out = { polygon: polygons.flat() }                   // 여러 개면 보존
    const points = data.polygon[0].points.map(xyToLatLng)
    const text = pairsToText(toPairs(points))

    console.log('BY getData() -> pairs', text)
  }
  //const managerRef = useRef<kakao.maps.drawing.DrawingManager | null>(null)

  const handleMapCreate = () => {
    const overlayType = window.kakao?.maps?.drawing?.OverlayType
    if (!overlayType) {
      console.warn('drawing library not loaded')
      return
    }
    setOT(overlayType)
    setReady(true)
  }

  const drawingModes = OT
    ? [OT.ARROW, OT.CIRCLE, OT.ELLIPSE, OT.MARKER, OT.POLYLINE, OT.RECTANGLE, OT.POLYGON]
    : []
  */

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
      'https://naver.me/xJGeal6l',
      '_black',
      'noopener noreferrer',
    )
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

  function handleRampMapMarker(idx: number, lat: number, lng: number) {  
    setMapState(() => ({
      center: { 
        lat: lat, 
        lng: lng
      },
      isPanto: true,
    }))

    // 렌더링 겹침 문제 해결 위해 시간 차를 두고 setIsVisibleId(id) 실행
    setTimeout(() => {
      setIsVisibleId(idx + 1000)
      // 경사로 포커스
      if(divRampRef.current){
        divRampRef.current.focus()
        setHasFocused(true)
        console.log('focus set for id:', idx + 1000)
      }
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
      setMarkerSize({width: 25, height: 25}) // 25, 36
      setRampSize(22)
      setPlusLat(0.0012)
      setParkingSize(35)
    } else if(mapLevel === 3) {
      setMarkerSize({width: 23, height: 23}) // 25, 36
      setRampSize(17)
      setPlusLat(0.0025)
      setParkingSize(27)
    } else if(mapLevel === 4) {
      setMarkerSize({width: 23, height: 23}) // 22, 31
      setRampSize(12)
      setPlusLat(0.0048)
      setParkingSize(22)
    } else if(mapLevel === 5) {
      setMarkerSize({width: 18, height: 18}) // 17, 25
      setRampSize(9)
      setPlusLat(0.0091)
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
            //return div;
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
    let watchId: number
  
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
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
        (error) => {
          console.error("Error watching location:", error.message);
        },
        {
          timeout: 4000,
          maximumAge: 0,
          enableHighAccuracy: true,
        }
      )
    } else {
      console.warn("Geolocation is not supported by this browser.")
    }
  
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
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

  function makeMarker(id: number, diameter = 40): string {
    const canvas = document.createElement('canvas')
    canvas.width = diameter
    canvas.height = diameter
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#1f5ab8d1'
    ctx.beginPath()
    ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = `bold ${diameter * 0.48}px Pretendard, sans-serif`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(id), diameter / 2, diameter / 2)

    return canvas.toDataURL()
  }

  const EventMarkerContainer = ({ id, position, content, amenityData, polygon }: {
      id: number, position: { lat: number, lng: number }, content: string, amenityData: amenities, polygon: { lat: number, lng: number }[]
    }) => {
    const markerSrc = useMemo(() => makeMarker(id), [id])
    return (
      <>
       <Polygon
          path={polygon}
          zIndex={-5} // 마커와의 겹침 문제 해결
          strokeWeight={2} // 선의 두께입니다
          strokeColor={"#2a5ade"} // 선의 색깔입니다
          strokeOpacity={0.35} // 선의 불투명도입니다
          strokeStyle={"solid"} // 선의 스타일입니다
          fillColor={"#edf6ff"} // 채우기 색깔입니다
          fillOpacity={0.1} // 채우기 불투명도입니다
          //onMouseover={() => setIsMouseOver(true)}
          //onMouseout={() => setIsMouseOver(false)}
          //onMousedown={() => handleMapMarker(id, position.lat, position.lng)}
          onClick={() => handleMapMarker(id, position.lat, position.lng)}
        />
        <MapMarker
          image={{
            src: markerSrc, //'/images/marker.png',
            size: markerSize, // 마커 사이즈
          }}
          zIndex={-3} // 마커와의 겹침 문제 해결
          position={position} // 마커를 표시할 위치
          clickable={true} // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정
          onClick={() => handleMapMarker(id, position.lat, position.lng)} // 마커를 클릭했을 때 InfoWindow를 표시
        >
          {isVisibleId === id &&
            <div className='w-[16.7rem]'>
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
            </div>
          }
        </MapMarker>
      </>
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
                        placeholder="명칭 또는 번호를 입력하세요."
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
                {/**
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button onClick={dumpByGetData}>좌표 내보내기 (getData)</button>
                  <button onClick={dumpByGetOverlays}>좌표 내보내기 (getOverlays + getPath)</button>
                </div>
                 */}
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
                  onCreate={map => {
                    map.addOverlayMapTypeId(kakao.maps.MapTypeId['ROADMAP'])
                    //handleMapCreate()
                  }}
                >
                  {ready && (
                    <DrawingManager
                      ref={managerRef}
                      drawingModes={drawingModes}
                      guideTooltip={['draw', 'drag', 'edit']}
                      //markerOptions={{ draggable: true, removable: true }}
                      //polylineOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', hintStrokeStyle: 'dash', hintStrokeOpacity: 0.5 }}
                      //rectangleOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', fillColor: '#39f', fillOpacity: 0.5 }}
                      //circleOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', fillColor: '#39f', fillOpacity: 0.5 }}
                      polygonOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', fillColor: '#39f', fillOpacity: 0.5, hintStrokeStyle: 'dash', hintStrokeOpacity: 0.5 }}
                      //arrowOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', hintStrokeStyle: 'dash', hintStrokeOpacity: 0.5 }}
                      //ellipseOptions={{ draggable: true, removable: true, editable: true, strokeColor: '#39f', fillColor: '#39f', fillOpacity: 0.5 }}
                    >
                      <Toolbox />
                    </DrawingManager>
                  )}
                  {/* 지도 위에 표시될 마커 */}
                  {pos.map((value) => {
                    const showMarker =
                    selectedCategory === "entire" ||
                    (selectedCategory === "wheel" && value.wheel) ||
                    (selectedCategory === "elevator" && value.elevator) ||
                    (selectedCategory === "toilet" && value.toilet)
                    
                    const ring = Array.isArray(value.polygon)
                      ? value.polygon.map(([lat, lng]: [number, number]) => ({ lat, lng }))
                      : []
                    
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
                          polygon={ring}
                        />
                      )
                    )
                  })}

                  { /** 경사로 마커 */
                    ramp.map((value, idx) => {
                      const showMarker = (selectedCategory === "entire" || selectedCategory === "ramp")
                      return (
                        showMarker && (
                          <MapMarker
                            key={`ramp-${idx + 1000}`}
                            image={{
                              src: "/images/rampMarker.png",
                              size: { width: rampSize, height: rampSize },
                            }}
                            onClick={() => handleRampMapMarker(idx, value.lat, value.lng)}
                            position={{ lat: value.lat, lng: value.lng }}
                            zIndex={-2}
                          >
                            {isVisibleId === idx + 1000 && (
                              <div
                                ref={divRampRef}
                                className="p-2 text-sm w-[11rem] h-[5rem] text-center"
                              >
                                {/* 팝업 내부 원하는 내용 */}
                                <p className='font-fBold text-[0.83rem] text-blue-900'>[건물 진입 경사로]</p>
                                <p className='text-[0.83rem]'>{value.memo}</p>
                                <button
                                  onClick={() => setIsVisibleId(null)}
                                  className="font-fBold mt-2 text-xs w-full text-blue-500"
                                >
                                  닫기
                                </button>
                              </div>
                            )}
                          </MapMarker>
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