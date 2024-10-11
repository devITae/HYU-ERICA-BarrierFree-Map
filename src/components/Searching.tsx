import { Dispatch, SetStateAction } from 'react'
import { pos } from '../positions.json'

interface SearchingProps {
    value: string;
    setIsVisibleId: Dispatch<SetStateAction<number | null>>;
    setShowResults: Dispatch<SetStateAction<boolean>>;
  }

const Searching: React.FC<SearchingProps> = ({ value, setIsVisibleId, setShowResults }) => {
    const resultHandle = (id : number) => {
        setIsVisibleId(id)
        setShowResults(false)
    }   

    return (
        <>
            <ul>
                {pos.map(({ id, title }) => (
                    <div 
                        key={id}
                        className='w-full cursor-pointer hover:bg-gray-300'
                        onClick={() => resultHandle(id)}
                    >
                        {title}
                    </div>
                ))}
            </ul>
        </>
    )
}

export default Searching