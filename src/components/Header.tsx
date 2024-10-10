import MapMarkerImg from '../assets/images/marker.png'

const Header = () => { 
    return (
        <header className="fixed top-0 left-0 w-full bg-white shadow-md h-12 flex items-center px-4 z-50">
            <img className='w-4 mr-3' src={MapMarkerImg} />
            <h1 className="text-lg font-bold">오픈하냥</h1>
            {/* Add other elements like navigation links, icons, etc. */}
        </header>
    )
}

export default Header