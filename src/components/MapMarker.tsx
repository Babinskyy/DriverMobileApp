type MapMarkerProps = {
    width: number;
    number?: number;
}

const MapMarker: React.FC<MapMarkerProps> = ({ width, number }) => {

    return(
        <>
        <svg style={{
            width: width + "px"
        }} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" xmlSpace="preserve">
  <style type="text/css" dangerouslySetInnerHTML={{__html: "\n\t.st0{fill:url(#SVGID_1_);stroke:#0000FF;stroke-miterlimit:10;}\n\t.st1{fill:#FFFFFF;}\n\t.st2{font-family:'Arial-BoldMT';}\n\t.st3{font-size:23.7243px;}\n" }} />
  <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="7.83" y1="34.0019" x2="56.15" y2="34.0019" gradientTransform="matrix(1 0 0 -1 0 66)">
    <stop offset={0} style={{stopColor: '#233CFF'}} />
    <stop offset="0.2459" style={{stopColor: '#1B56F6'}} />
    <stop offset={1} style={{stopColor: '#0B80E3'}} />
  </linearGradient>
  <path className="st0" d="M32,2C18.7,2,7.8,13.4,7.8,27.3c0,13.6,21.9,33.3,22.8,34.2C31,61.8,31.5,62,32,62c0.5,0,1-0.2,1.3-0.5
	c0.9-0.8,22.8-20.5,22.8-34.2C56.2,13.4,45.3,2,32,2z" />
  <text transform="matrix(1 0 0 1 32 34.6927)" className="st1 st2 st3" style={{
    textAnchor: "middle",
    fontSize: "21px",
    fontFamily: "\'Nunito\'",
    fontWeight: 700
  }} >{number}</text>
</svg>

        </>
    )

}

export default MapMarker