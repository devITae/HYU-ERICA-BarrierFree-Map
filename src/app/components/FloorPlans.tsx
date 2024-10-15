import { useLocation } from 'react-router-dom'

function FloorPlans() {
    const location = useLocation()
    const id = location.state.id

    return (
        <>
            <div>
                letter details~
                <p>id: {id}</p>
            </div>
        </>
    )
}

export default FloorPlans
