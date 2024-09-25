import { useState, useEffect } from 'react'
import { pos } from './positions.json'
import { Map, MapMarker, useMap } from 'react-kakao-maps-sdk' // Import the InfoWindow component
import Marker from './assets/marker.png'

function App() {
  //const [selectedCategory, setSelectedCategory] = useState("coffee")
  //const markerImageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png"
  //const imageSize = { width: 22, height: 26 }
  //const spriteSize = { width: 36, height: 98 }
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

  //const map = useMap()
  const [state, setState] = useState({
    center: {
      lat: 37.29781,
      lng: 126.835358,
    },
    errMsg: null,
    isLoading: true,
  })

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
    <div id='mapwrap' className='w-full h-full'>
      {/* 지도 위에 표시될 마커 카테고리 */}
      <Map
        id='map'
        center={{ lat: 37.29781, lng: 126.835358 }}   // 지도의 중심 좌표
        style={{'width': '100%', 'height': '100vh'}} // 지도 크기
        level={3}                                   // 지도 확대 레벨
      >
        {
          pos.map((value, index) => (
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
          ))
        }
        /* 현위치 마커 */
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
      <div className="chat">

      </div>
    </div>
  );
}

export default App
