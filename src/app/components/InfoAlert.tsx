import React from 'react'

interface InfoAlertProps {
  onClose: () => void
}

const InfoAlert: React.FC<InfoAlertProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-md shadow-lg w-80 text-sm">
        <h2 className="text-lg font-semibold mb-3">정보</h2>
        <p className='mb-4'>한양대학교 ERICA캠퍼스의 배리어프리맵 웹서비스인 '오픈하냥' 입니다.</p>
        <p>[개발자]</p>
        <p>Frontend: 이재형 (컴퓨터학부 21)</p>
        <p>Backend: 정윤성 (컴퓨터학부 20)</p>
        <p>Designer: 임동섭 (경영학부 21)</p>
        <p className='mt-4'>[도움]<br/>한양대학교 ERICA 인권센터 & 사랑한대</p>
        <p className='mt-4'>[문의]<br/>
          <a className='text-blue-500' href='mailto:alpha@hanyang.ac.kr'>
            alpha@hanyang.ac.kr
          </a>
        </p>
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