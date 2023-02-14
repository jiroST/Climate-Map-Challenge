import React from 'react';
import styled from "styled-components";
import getSelectedLocatoinId from './locationGetter';


const StyledSidebar = styled.div`
    width: max;
    height: 200vh;
    background-color: black;
    color: white;
    margin-top: -20px;
`;

const MapTypeButton = styled.button`
  background-color: black;
  color: white;
  margin-top: 25px;
  margin-left: 60px;
  border: 1px solid white;
  padding: 10px 20px;
  margin-bottom: 10px;
  font-size: 14px;
  cursor: pointer;
`;

function Sidebar({style, mapView, setMapView, selectedLocationId, observationLocations }) {
  
  const id = getSelectedLocatoinId(selectedLocationId);

  const loc = observationLocations.find(loc => loc.info.id === id);

    const handleMapTypeChange = () => {
      if (mapView === 'normal') {
        setMapView('satellite');
      } else {
        setMapView('normal');
      }
    };


      return (
        <div className="sidebar" style={style}> 
        <StyledSidebar>
                <MapTypeButton onClick={handleMapTypeChange}>
                Change Map Type
                </MapTypeButton>
            </StyledSidebar> 
        </div>
      );
  }
  
  export default Sidebar;
