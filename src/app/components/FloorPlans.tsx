import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

function FloorPlans() {
    const location = useLocation()
    const navigate = useNavigate()
    const { id } = useParams()
    const id2 = location.state?.id

    // If no state is passed, redirect back to the previous page or a default route
    useEffect(() => {
        if (!id2) {
            navigate('/'); // Redirect to home or another page if no id
        }
    }, [id2, navigate])

    return (
        <>
            <div>
                letter details~
                <p>id: {id}</p>
                <p>id2: {id2}</p>
            </div>
        </>
    )
}

export default FloorPlans
