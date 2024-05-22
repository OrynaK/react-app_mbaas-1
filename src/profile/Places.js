import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const Places = ({ userId }) => {
    const [places, setPlaces] = useState([]);
    const [newPlace, setNewPlace] = useState({
        description: '',
        hashtags: '',
        imageUrl: '',
        category: '',
        location: null
    });
    const [markerPosition, setMarkerPosition] = useState(null);

    useEffect(() => {
        fetchPlaces();
    }, []);

    const fetchPlaces = async () => {
        try {
            const queryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(`ownerId='${userId}'`);
            const userPlaces = await Backendless.Data.of('Place').find(queryBuilder);
            setPlaces(userPlaces);
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };

    const addPlace = async () => {
        try {
            if (!newPlace.description || !newPlace.location) {
                alert('Please fill in description and coordinates');
                return;
            }
            const placeData = {
                description: newPlace.description,
                hashtags: newPlace.hashtags,
                imageUrl: newPlace.imageUrl,
                category: newPlace.category,
                ownerId: userId,
                location: {
                    "__type": "GeoPoint",
                    "latitude": newPlace.location.lat,
                    "longitude": newPlace.location.lng
                }
            };
            const savedPlace = await Backendless.Data.of('Place').save(placeData);
            setPlaces([...places, savedPlace]);
            setNewPlace({
                description: '',
                hashtags: '',
                imageUrl: '',
                category: '',
                location: null
            });
            setMarkerPosition(null);
        } catch (error) {
            console.error('Error adding place:', error);
            console.error(error.message);
            alert('Error adding place. Please try again later.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPlace(prevState => ({ ...prevState, [name]: value }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                setMarkerPosition([latitude, longitude]);
                setNewPlace(prevState => ({
                    ...prevState,
                    location: { lat: latitude, lng: longitude }
                }));
            }, error => {
                console.error('Error getting current location:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
                setNewPlace(prevState => ({
                    ...prevState,
                    location: { lat, lng }
                }));
            }
        });
        return null;
    };

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    return (
        <div>
            <h2>My Places</h2>
            <div>
                <h3>Add New Place</h3>
                <input type="text" name="description" placeholder="Description" value={newPlace.description} onChange={handleInputChange} />
                <input type="text" name="hashtags" placeholder="Hashtags" value={newPlace.hashtags} onChange={handleInputChange} />
                <input type="text" name="imageUrl" placeholder="Image URL" value={newPlace.imageUrl} onChange={handleInputChange} />
                <input type="text" name="category" placeholder="Category" value={newPlace.category} onChange={handleInputChange} />
                <div>
                    <button onClick={getCurrentLocation}>Set Current Location</button>
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {markerPosition && <Marker position={markerPosition} />}
                        <MapClickHandler />
                    </MapContainer>
                </div>
                <button onClick={addPlace}>Add Place</button>
            </div>
            <div>
                <h3>My Places List</h3>
                <ul>
                    {places.map(place => (
                        <li key={place.objectId}>
                            <div>Description: {place.description}</div>
                            <div>Coordinates: {place.location ? `${place.location.latitude}, ${place.location.longitude}` : 'N/A'}</div>
                            <div>Hashtags: {place.hashtags}</div>
                            <div>Image URL: {place.imageUrl}</div>
                            <div>Category: {place.category}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Places;
