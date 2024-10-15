import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const FloorPlans = () => {
    const [imgURL, setImgURL] = useState<string>("")
    const [floor, setFloor] = useState<number>(1)

    const location = useLocation()
	const param = location.state.param

    const getFloorPlan = (floorCode : number) => {
        const response = `https://DOMAIN/api/floorplan/${buildingID}/${floorCode}`
        setImgURL(response)
    }

    return (
        <>
            <img 
                src={imgURL} 
                alt="floor plan" 
            />
            <button onClick={() => getFloorPlan(floor)}>1층</button>
        </>
    )
}

export default FloorPlans
