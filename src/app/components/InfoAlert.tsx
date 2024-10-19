import React from 'react'

interface InfoAlertProps {
  onClose: () => void
  targetName: string
}

const InfoAlert: React.FC<InfoAlertProps> = ({ onClose, targetName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-fMedium tracking-tight">
      <div className="bg-white p-5 rounded-md shadow-lg w-80 text-sm">
        <h2 className="text-lg font-fBold mb-3">
          {
            targetName === 'info' ? 
            '정보' : 
            '앱 설치 안내'
          }
        </h2>
        {
          targetName === 'info' && (
            <>
              <p className='mb-4'>한양대학교 ERICA캠퍼스의 배리어프리맵<br/>웹서비스인 '오픈하냥' 입니다.</p>
              <p>[개발자]</p>
              <p>Frontend: 이재형 (컴퓨터학부 21)</p>
              <p>Backend: 정윤성 (컴퓨터학부 20)</p>
              <p>Designer: 임동섭 (경영학부 21)</p>
              <p className='mt-4'>[도움]<br/>한양대학교 ERICA 인권센터 & 소중한대</p>
              <p className='mt-4'>[문의]<br/>
                <a className='text-blue-500' href='mailto:alpha@hanyang.ac.kr'>
                  alpha@hanyang.ac.kr
                </a>
              </p>
            </>
          )
        }
        {
          targetName === 'pwa' && (
            <>
              <p className='mb-4'>
                iOS (iPhone)
                <p>1. Safari로 접속</p>
                <p>2. 공유 - '홈 화면에 추가'</p>
              </p>

              <p className='mb-4'>
                Android (Galaxy)
                <p>1. 삼성 인터넷 또는 크롬으로 접속</p>
                <p>2. 상단 설치 버튼 클릭</p>
              </p>
            </>
          )
        }
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoAlert