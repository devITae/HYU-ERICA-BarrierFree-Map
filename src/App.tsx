import { useState, useEffect } from 'react'
import tw from 'twin.macro'
import styled from 'styled-components'
import { pos } from './positions.json'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import Marker from './assets/marker.png'


const CategoryItem = styled.li`
  float: left;
  list-style: none;
  width: 50px;
  border-right: 1px solid #acacac;
  padding: 6px 0;
  text-align: center;
  cursor: pointer;
  
  &.on {
    background: #eee;
  }
  
  &:hover {
    background: #ffe6e6;
    border-left: 1px solid #acacac;
    margin-left: -1px;
  }
  
  &:last-child {
    margin-right: 0;
    border-right: 0;
  }
  
  span {
    display: block;
    margin: 0 auto 3px;
    width: 27px;
    height: 28px;
  }
  
  .category_bg {
    background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_category.png) no-repeat;
  }
  
  .bank {
    background-position: -10px 0;
  }
  
  .mart {
    background-position: -10px -36px;
  }
  
  .pharmacy {
    background-position: -10px -72px;
  }
  
  .oil {
    background-position: -10px -108px;
  }
  
  .cafe {
    background-position: -10px -144px;
  }
  
  .store {
    background-position: -10px -180px;
  }
  
  &.on .category_bg {
    background-position-x: -46px;
  }
`

const MoveToNowButton = styled.button`
  display: block;
  position: relative;
  width: 32px;
  height: 32px;
  padding: 1px 3px 5px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/2018/pc/common/img_search.png) no-repeat -152.5px -451px;
  alt: '현재 위치로 이동';
`

function App() {
  //const mapRef = useRef<kakao.maps.Map>(null)

  const openReportPage = () => {
    window.open(
      'https://m.naver.com',
      '_black',
      'noopener noreferrer',
    )
  }
  
  const [isVisibleId, setIsVisibleId] = useState<string | null>(null)

  function success(pos) {
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
              <div className='flex mb-5 '>{content}</div>

              <div className="flex items-center mb-4">
                <input 
                  id="default-checkbox"
                  checked={wheel}
                  type="checkbox" value="" 
                  className="checked w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">휠체어 진입가능</label>
              </div>
              <div className="flex items-center mb-4">
                <input id="default-checkbox"
                  checked={elevator}
                  type="checkbox" value="" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">장애인 승강기</label>
              </div>
              <div className="flex items-center mb-4">
                <input id="default-checkbox"
                  checked={toilet}
                  type="checkbox" value="" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">장애인 화장실</label>
              </div>
              <div className="flex items-center mb-4">
                <input id="default-checkbox"
                  checked={parking}
                  type="checkbox" value="" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">장애인 전용 주차장</label>
              </div>
              <div className="flex items-center mb-4">
                <input id="default-checkbox"
                  checked={dots}
                  type="checkbox" value="" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium">점자 명판 여부</label>
              </div>
            </div>
          </>
        }
      </MapMarker>
    )
  }
  
  return (
    <>
      <div id='mapwrap' className='w-full h-screen-vh'>
        {/* 지도 위에 표시될 마커 카테고리 */}
        <Map
          id='map'
          center={mapState.center}   // 지도의 중심 좌표
          isPanto={mapState.isPanto}                      // 지도의 중심 좌표를 변경할 때 애니메이션 효과를 줄지 여부
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
            className={selectedCategory === "entire" ? "on" : ""}
          >
            전체
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("parking")}
            className={selectedCategory === "parking" ? "on" : ""}
          >
            장애인 주차장
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("toilet")}
            className={selectedCategory === "toilet" ? "on" : ""}
          >
            장애인 화장실
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("elevator")}
            className={selectedCategory === "elevator" ? "on" : ""}
          >
            엘레베이터
          </CategoryItem>
          <CategoryItem
            onClick={() => setSelectedCategory("ramp")}
            className={selectedCategory === "ramp" ? "on" : ""}
          >
            경사로
          </CategoryItem>
          <CategoryItem
            onClick={openReportPage}
          >
            불편신고
          </CategoryItem>
        </ul>
        <div className='absolute bottom-[10px] right-[10px] rounded-md border border-[#909090] overflow-hidden z-[2]'>
          <MoveToNowButton onClick={() => accessCurrentLocation()} />
        </div>
      </div>
    </>
  )
}

export default App
