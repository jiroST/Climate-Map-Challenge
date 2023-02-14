import React, {useEffect, useState} from 'react';
import Metolib from '@fmidev/metolib';
import './App.css';
import {Map, Marker, TileLayer, Popup} from "react-leaflet";
import styled from "styled-components";
import L from "leaflet";
import Sidebar from './Sidebar';
import { LineChart, Line, XAxis, YAxis } from "recharts";








const MapContainer = styled(Map)`
    width: calc(100vw - 300px);
    height: 100vh;
    position:absolute;
    top:0px;
    left:300px;
`;


// Ugly hack to fix Leaflet icons with leaflet loaders
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


function App() {
  const [observationLocations, setObservationLocations] = useState([]);
  let [selectedLocation, setSelectedLocation] = useState(null);
  const [mapView, setMapView] = useState('normal');


  useEffect(function fetchObservationLocations() {
    const connection = new Metolib.WfsConnection();
    if (connection.connect('http://opendata.fmi.fi/wfs', 'fmi::observations::weather::cities::multipointcoverage')) {
      connection.getData({
        begin: Date.now() - 60e3 * 60 * 24 * 6,
        end: Date.now(),
        requestParameter: "t,snowdepth,r_1h",
        timestep: 60 * 60 * 1000,
        bbox: "20.6455928891, 59.846373196, 31.5160921567, 70.1641930203",
        callback: (data, errors) => {
          console.log(data);
          if (errors.length > 0) {
            errors.forEach(err => {
              console.error('FMI API error: ' + err.errorText);
            });
            return;
          }

          setObservationLocations(data.locations.map(loc => {
              const [lat, lon] = loc.info.position.map(parseFloat);
              return {...loc, position: {lat, lon}}
            })
          );

          connection.disconnect();
        }
      });
    }
  }, []);

   
  
  let tileLayer;
  if (mapView === 'normal') {
    tileLayer = (
      <TileLayer
        url={'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains='abcd'
        maxZoom={19}
      />
    );
  } else if (mapView === 'satellite') {
    tileLayer = (
      <TileLayer
        url={'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      />
    );
  }



  let chart_container;
  const position = [65, 26];
  const map = (
    <MapContainer center={position} zoom={6}>
      {tileLayer}
      {observationLocations.map(loc => (
        <Marker position={[loc.position.lat, loc.position.lon]}
                key={loc.info.id} 
                onClick={ chart_container}>
          <Popup minWidth="450">
          <p style={{ fontSize: 16 }}>{loc.info.name}</p>
                          <p>Latest temperature: {loc.data.t.timeValuePairs[144].value}°C. Temperature (°C) in the past 24h:</p>
                          <LineChart
                              width={400}
                              height={150}
                              data={loc.data.t.timeValuePairs.slice(121, 145)}
                              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                              <Line type="monotone" dataKey="value" stroke="#8884d8"  />
                              <XAxis dataKey="hour"/>
                              <YAxis/>
                          </LineChart>
                          <p>Latest snow depth: {loc.data.snowdepth.timeValuePairs[144].value} cm. Snow depth (cm) in the past 24h:</p> 
                          <LineChart
                              width={400}
                              height={150}
                              data={loc.data.snowdepth.timeValuePairs.slice(121, 145)}
                              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                              <Line type="monotone" dataKey="value" stroke="#8884d8"  />
                              <XAxis dataKey="hour"/>
                              <YAxis/>
                          </LineChart> 
                          <p>Latest rainfall (1h): {loc.data.r_1h.timeValuePairs[144].value} mm. Rainfall (mm) in the past 24h:</p>
                          <LineChart
                              width={400}
                              height={150}
                              data={loc.data.r_1h.timeValuePairs.slice(121, 145)}
                              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                              <Line type="monotone" dataKey="value" stroke="#8884d8"  />
                              <XAxis dataKey="hour"/>
                              <YAxis/>
                          </LineChart>
          </Popup>
        </Marker>))}
    </MapContainer>
  );


  return (
    <div className="App">
      <Sidebar 
          selectedLocationId={selectedLocation} 
          observationLocations={observationLocations}
          mapView={mapView}
          setMapView={setMapView}/>
      {map}
    </div>
  );

}

export default App;