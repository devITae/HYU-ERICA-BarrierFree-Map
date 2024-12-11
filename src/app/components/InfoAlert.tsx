import React from 'react'
import { useSpeechToText } from "./useSpeechToText"

interface InfoAlertProps {
  targetName: string
  onClose: () => void
  setInputValue: (value: string) => void
  setShowResults: (value: boolean) => void
}

const InfoAlert: React.FC<InfoAlertProps> = ({ targetName, onClose, setInputValue, setShowResults }) => {
  const { transcript, listening, toggleListening, abortListening, browserSupportsSpeechRecognition } = useSpeechToText()

  const handleCloseButton = () => {
    abortListening()
    onClose()
  }

  const handleButton = () => {
    if (listening) {
      const value = transcript.replace(/(\s*)/g, "")
      if (value !== '') {
        setInputValue(value)
        setShowResults(true)
      }
      onClose()
    }
    toggleListening()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-fMedium tracking-tight"
    >
      <div className="bg-white p-5 rounded-md shadow-lg w-80 text-sm">
        <div className='flex justify-between items-center mb-3'>
          <h2 className="text-lg font-fBold tracking-tighter">
            {
              targetName === 'info' ? 
                '정보' : (targetName === 'pwa' ? '앱 설치 안내' : '음성 인식')
            }
          </h2>
          { // 음성 인식 닫기 버튼
            targetName === 'mic' && (
              <>
                <button onClick={handleCloseButton}>
                  <img 
                    src='/images/x_button.svg'
                    alt='닫기'
                    className='w-7'
                  />
                </button>
              </>
            )
          }
        </div>

        { // 개발 정보
          targetName === 'info' && (
            <>
              <p className='mb-4'>한양대학교 ERICA캠퍼스의 배리어프리맵<br/>웹서비스인 '길편하냥' 입니다.</p>

              <p>[개발자]</p>
              <p>Frontend: 이재형 (컴퓨터학부 21)</p>
              <p>Backend: 정윤성 (컴퓨터학부 20)</p>
              <p>Designer: 임동섭 (경영학부 22)</p>

              <p className='mt-4'>
                [도움]
                <br/>
                <a 
                  className='text-blue-500' 
                  href='https://ehrc.hanyang.ac.kr/'
                >
                  한양대학교 ERICA 인권센터 
                </a> & 소중한대
              </p>
              
              <p className='mt-4'>[오픈소스]<br/>
                <a className='text-blue-500' href='https://github.com/devITae/HYU-ERICA-BarrierFree-Map'>
                  GitHub (Client)
                </a>
                <br/>
              </p>
              {/** 
                <p className='mt-4'>[문의]<br/>
                  <a className='text-blue-500' href='mailto:alpha@hanyang.ac.kr'>
                    ehrc@hanyang.ac.kr
                  </a>
                </p>
              */}
            </>
          )
        }

        { // PWA 설치 안내
          targetName === 'pwa' && (
            <>
              <p className='mb-4'>
                iOS (iPhone)
                <p>1. Safari로 접속</p>
                <p>2. 공유 - '홈 화면에 추가'</p>
              </p>
              <hr />
              <p className='my-4'>
                Android (Galaxy)
                <p>1. 기본 브라우저로 접속</p>
                <p>2. 상단 주소창의 설치 버튼 클릭</p>
                <p className='mb-2'/>
                <p>3. 없을 시, 메뉴( ⋮ ) 클릭 후</p>
                <p>(크롬/웨일) '홈 화면에 추가'</p>
                <p>(삼성 인터넷) '현재 페이지 추가' - '앱스 화면'</p>
              </p>
            </>
          )
        }
        
        {
          // 음성 인식 UI
          targetName === 'mic' && (
            <>
              <img
                  className='w-20 mx-auto mt-5' 
                  src='/images/mic.png'
              />
              <p className='text-center py-5'>
                {browserSupportsSpeechRecognition === true ? 
                  (listening ? transcript : '음성 인식을 시작하세요.') 
                  : '지원하지 않는 브라우저입니다.'}
              </p>
            </>
          )
        }

        {
          targetName !== 'mic' ? (
            // 기본 닫기 버튼
            <>
              <div className="mt-4 flex justify-end">
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={onClose}
                >
                  닫기
                </button>
              </div>
            </>
          ) : (
            // 음성 인식 UI
            <>
              <button 
                className="bg-blue-500 text-white w-full px-4 py-2 rounded-md"
                onClick={handleButton}
              >
                음성 인식 {listening ? '중지' : '시작'}
              </button>
            </>
          )
        }
      </div>
    </div>
  )
}

export default InfoAlert