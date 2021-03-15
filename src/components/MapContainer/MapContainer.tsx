import React, { useState, useEffect } from 'react'
import Map from './Map'
import { Layers, TileLayer, VectorLayer } from './Layers'
import { fromLonLat } from 'ol/proj'
import { Controls, FullScreenControl } from './Controls'
import orca from './orcapin.png'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const Sheets_API_Key = process.env['REACT_APP_GOOGLE_SHEETS_KEY'] || ''
const Sheets_ID = process.env['REACT_APP_GOOGLE_SHEETS_ID'] || ''

const doc = new GoogleSpreadsheet(Sheets_ID)
doc.useApiKey(Sheets_API_Key)

const MapContainer: React.FC = () => {
  const [coordinates, setCoordinates] = useState([[0, 0]])
  const [coordinatesFromSheet, setCoordinatesFromSheet] = useState([[0, 0]])
  const [zoom, setZoom] = useState(0)
  const [center, setCenter] = useState([0, 0])
  const [showLayer, setShowLayer] = useState(true)

  useEffect(() => {
    setCoordinates([
      [-122.5565, 48.0084],
      [-122.5765, 47.9584],
      [-122.4544, 47.9829],
      [-122.4544, 47.3365],
      [-122.4768, 47.7365],
      [-122.4108, 47.7365],
    ])
    setZoom(9)
    setCenter([-122.4713, 47.7237])
    async function loadSpreadsheet() {
      try {
        await doc.loadInfo()
        const sheet = doc.sheetsByIndex[0]

        // TODO: this currently returns a single row from a sheet with 2+ entries, so only one map point is returned from sheets.
        const rows = await sheet.getRows()

        const coordinatesArray = []
        for (let i = 0; rows[i] != null && i < sheet.rowCount; i++) {
          coordinatesArray.push([rows[i].longitude, rows[i].latitude])
        }
        setCoordinatesFromSheet(coordinatesArray)
      } catch (err) {
        console.log(err)
      }
    }
    loadSpreadsheet()
  }, [])

  return (
    <>
      <div id="cetacean_checkbox" style={{ margin: '0 40vw' }}>
        <img
          src={orca}
          width="25px"
          height="25px"
          alt="possible orca pin"
        ></img>
        <input
          type="checkbox"
          checked={showLayer}
          onChange={(event) => setShowLayer(event.target.checked)}
        />{' '}
        Pod Sightings
      </div>

      <Map center={fromLonLat(center)} zoom={zoom}>
        <Layers>
          <TileLayer zIndex={0} />
          {showLayer && (
            <VectorLayer
              coordinates={coordinates}
              coordinatesFromSheet={coordinatesFromSheet}
              zIndex={0}
            />
          )}
        </Layers>

        <Controls>
          <FullScreenControl />
        </Controls>
      </Map>
    </>
  )
}

export default MapContainer

//
//
//
//
//
//
//
//
// refactor notes, * Don't dispose of quite yet *
// innards to the prop "source" which was being passed to vector layer::
// vector({
//   features: new GeoJSON().readFeatures(
//     {
//       type: "FeatureCollection",
//       features: [
//         {
//           type: "Feature",
//           properties: {
//             kind: "Sighting",
//             name: "SRKW",
//             state: "WA",
//           },
//           geometry: {
//             type: "MultiPoint",
//             coordinates: coordinates,
//           },
//         },
//       ],
//     },
//     {
//       featureProjection: get("EPSG:3857"),
//     }
//   ),
// })

// original geoJSONobj :: this was being passed to
// const geoJSONobj = {
//   type: "FeatureCollection",
//   features: [
//     {
//       type: "Feature",
//       properties: {
//         kind: "Sighting",
//         name: "SRKW",
//         state: "WA",
//       },
//       geometry: {
//         type: "MultiPoint",
//         coordinates: [
//           [-122.5565, 48.0084],
//           [-122.5765, 47.9584],
//           [-122.4544, 47.9829],
//           [-122.4544, 47.3365],
//           [-122.4768, 47.7365],
//           [-122.4108, 47.7365],
//         ],
//       },
//     },
//   ],
// };
