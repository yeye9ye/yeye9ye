import React, { useEffect, useState } from "react";
import{
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from 'react-simple-maps';
import { getClient, initClient } from "../../Client";
import{Schema} from '../../../amplify/data/resource';

const usGeoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const MARKER_DEFAULT_OFFSET = -25;

type Bridge = Schema['Bridge']['type'];

type Marker = {
    markerOffset: number;
    name: string;
    id: string;
    coordinates: [number, number];
}



function BridgeMap() {
    const [selectedMarker,setSelectedMarker]=useState<Marker|null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [tooltipBridgeLocation, setTooltipBridgeLocation] = useState<string | null>(null);
    const [tooltipBridgeDate, setTooltipBridgeDate] = useState<string | null>(null);
    const [tooltipBridgeReason, setTooltipBridgeReason] = useState<string | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [bridges, setBridges] = useState<Bridge[]>([]);

    const client=getClient();
    const fetchBridges=async()=>{
        if(!client){
            initClient();
        }else{
            const{data:bridge_info}=await client.models.Bridge.list();
            setBridges(bridge_info);
        }
    };
    async function fetchDetails(id: string) {
        if (!client) {
          initClient();
          return fetchDetails(id);
        } else {
          const { data: fetchedDetails } = await client.models.Details.list({
            filter: {
              bridgeId: { eq: id }
            }
          });
          return fetchedDetails;
        }
    }
    useEffect(() => {
        fetchBridges();
    });
    
    const markers = bridges.map((bridge) => {
        return {
          markerOffset: MARKER_DEFAULT_OFFSET,
          name: bridge.name,
          id: bridge.id,
          coordinates: [bridge.longitude, bridge.latitude],
        }
    });
    const handleMarkerClick = async (marker: Marker, event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        event.stopPropagation();
        const fetchedDetails = await fetchDetails(marker.id);
        console.log(fetchedDetails);
        if (fetchedDetails[0]) {
          setSelectedMarker(marker);
          setTooltipBridgeLocation(`Location: ${fetchedDetails[0].city}, ${fetchedDetails[0].state}`);
          setTooltipBridgeDate(`Failure Date: ${fetchedDetails[0].date}`);
          setTooltipBridgeReason(`Reason: ${fetchedDetails[0].reason}`);
          const { clientX, clientY } = event;
          setTooltipPosition({ x: clientX, y: clientY });
          setShowTooltip(true);
        } else {
          handleMarkerClick(marker, event);
        }
    };

    const hideTooltip = () => {
        // click on the map background to hide the tooltip
        setShowTooltip(false);
        setTooltipBridgeReason(null); // clean data to avoid wrong details on next click
        setTooltipBridgeLocation(null); // clean data to avoid wrong details on next click
        setTooltipBridgeDate(null); // clean data to avoid wrong details on next click
    };
    return (
        <div className='bridge_map' onClick={hideTooltip}>
            <ComposableMap projection="geoAlbersUsa">
                <Geographies geography={usGeoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#EEE"
                                stroke="#999"
                            />
                        ))
                    }
                </Geographies>
                {markers.map((marker) => (
                    <Marker key={marker.name} coordinates={marker.coordinates as [number, number]} id={marker.id}
                        onClick={(e) => {
                            handleMarkerClick(marker as Marker, e);
                        }}
                    >
                        <g
                            fill="#fa6b6b"
                            stroke="#FF5533"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            transform="translate(-12, -24)"
                        >
                            <circle cx="12" cy="10" r="3" />
                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                        </g>
                        <text
                            textAnchor="middle"
                            y={marker.markerOffset}
                            style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                        >
                            {/* {marker.name} */}
                        </text>
                    </Marker>
                ))}
            </ComposableMap>
            {selectedMarker && tooltipBridgeReason && showTooltip && (
                <div
                    style={{
                        position: "absolute",
                        top: `${tooltipPosition.y + 350}px`,
                        left: `${tooltipPosition.x - 120}px`,
                        background: "#fff",
                        width: "480px",
                        border: "1px solid #ccc",
                        padding: "10px",
                        borderRadius: "5px",
                        zIndex: 1000
                    }}
                >
                    <h4>{selectedMarker.name}</h4>
                    <p>{tooltipBridgeLocation}</p>
                    <p>{tooltipBridgeDate}</p>
                    <p>{tooltipBridgeReason}</p>
                </div>
            )}
        </div>
    )
}

export default BridgeMap;