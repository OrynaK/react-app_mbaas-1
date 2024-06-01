import React, {useState, useEffect} from 'react';
import Backendless from 'backendless';
import 'leaflet/dist/leaflet.css';
import {MapContainer, TileLayer, Marker, useMapEvents, Popup} from 'react-leaflet';
import L from 'leaflet';
import './Places.css';

const Places = ({userId, profile, placesUpdated, onPlacesUpdated}) => {
    const [places, setPlaces] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [newPlace, setNewPlace] = useState({
        description: '',
        hashtags: '',
        image_url: '',
        category: '',
        location: null
    });
    const resetSearch = async () => {
        try {
            setSearchQuery({
                description: '',
                category: '',
                radius: 0,
                location: null
            });

            // Fetch all places of the current user
            await fetchPlaces(userId);
        } catch (error) {
            console.error('Error resetting search:', error);
        }
    };

    const [markerPosition, setMarkerPosition] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategoryInput, setNewCategoryInput] = useState(false);
    const [fileDirectory, setFileDirectory] = useState([]);
    const [newImageInput, setNewImageInput] = useState(false);
    const [searchQuery, setSearchQuery] = useState({
        description: '',
        category: '',
        radius: 0,
        location: null
    });

    useEffect(() => {
        fetchPlaces(userId);
        fetchCategories();
        retrieveFileDirectory();
    }, [placesUpdated]);

    const fetchPlaces = async (userId) => {
        try {
            const query = Backendless.DataQueryBuilder.create().setWhereClause(`ownerId='${userId}'`);
            const userPlaces = await Backendless.Data.of('Place').find(query);
            const categoriesMap = new Map();
            const allCategories = await Backendless.Data.of('Category').find();
            allCategories.forEach(category => categoriesMap.set(category.objectId, category.name));
            const placesWithCategories = userPlaces.map(place => ({
                ...place,
                categoryName: categoriesMap.get(place.categoryId)
            }));
            setPlaces(placesWithCategories);
            setSearchResults(placesWithCategories);
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };


    const fetchCategories = async () => {
        try {
            const allCategories = await Backendless.Data.of('Category').find();
            setCategories(allCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const retrieveFileDirectory = async () => {
        try {
            const directory = await Backendless.Files.listing(`/user_files/${profile.name}`);
            const imageFiles = directory.filter(file =>
                file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.png')
            );
            setFileDirectory(imageFiles);
        } catch (error) {
            console.error('Error in fetching files:', error);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (name === 'category') {
            if (value === 'new') {
                setNewCategoryInput(true);
            } else {
                setNewCategoryInput(false);
                setNewPlace(prevState => ({
                    ...prevState,
                    [name]: value,
                }));
            }
        } else if (name === 'image_url') {
            if (value === 'new') {
                setNewImageInput(true);
            } else {
                setNewImageInput(false);
                setNewPlace(prevState => ({
                    ...prevState,
                    [name]: value,
                }));
            }
        } else {
            setNewPlace(prevState => ({...prevState, [name]: value}));
        }
    };

    const addPlace = async () => {
        try {
            if (!newPlace.description || !newPlace.location || (!newPlace.category && !newPlace.newCategory)) {
                alert('Please fill in description, category, and coordinates');
                return;
            }
            let categoryId;
            if (newCategoryInput) {
                const newCategory = await Backendless.Data.of('Category').save({name: newPlace.newCategory});
                categoryId = newCategory.objectId;
            } else {
                categoryId = newPlace.category;
            }
            const placeData = {
                description: newPlace.description,
                hashtags: newPlace.hashtags,
                image_url: newPlace.image_url,
                category: newPlace.newCategory || categories.find(cat => cat.objectId === newPlace.category)?.name,
                categoryId: categoryId,
                ownerId: userId,
                location: {
                    "type": "Point",
                    "coordinates": [newPlace.location.lng, newPlace.location.lat]
                }
            };
            const savedPlace = await Backendless.Data.of('Place').save(placeData);
            setPlaces([...places, savedPlace]);
            setNewPlace({
                description: '',
                hashtags: '',
                image_url: '',
                category: '',
                newCategory: '',
                location: null
            });
            setMarkerPosition(null);
            setShowAddModal(false);
            onPlacesUpdated();
        } catch (error) {
            console.error('Error adding place:', error);
            alert(`Error adding place: ${error.message}`);
        }
    };

    const deletePlace = async (placeId) => {
        try {
            await Backendless.Data.of('Place').remove({objectId: placeId});
            setPlaces(places.filter(place => place.objectId !== placeId));
            onPlacesUpdated();
        } catch (error) {
            console.error('Error deleting place:', error);
        }
    };

    const likePlace = async (placeId) => {
        try {
            const place = places.find(place => place.objectId === placeId);
            if (!place) return;
            const userLikes = place.likes || [];
            if (userLikes.includes(userId)) {
                alert('You have already liked this place');
                return;
            }
            place.likes = [...userLikes, userId];
            await Backendless.Data.of('Place').save(place);
            setPlaces(places.map(p => (p.objectId === placeId ? place : p)));
        } catch (error) {
            console.error('Error liking place:', error);
        }
    };

    const searchPlaces = async () => {
        try {
            const allPlaces = await Backendless.Data.of('Place').find();
            const allCategories = await Backendless.Data.of('Category').find();

            // Create a map of categoryId to categoryName
            const categoryMap = new Map();
            allCategories.forEach(category => {
                categoryMap.set(category.objectId, category.name);
            });

            let filteredPlaces = allPlaces.map(place => ({
                ...place,
                categoryName: categoryMap.get(place.categoryId) // Assign categoryName to each place
            }));

            if (searchQuery.description) {
                filteredPlaces = filteredPlaces.filter(place => place.description.toLowerCase().includes(searchQuery.description.toLowerCase()));
            }

            if (searchQuery.category) {
                // Filter places by categoryId
                filteredPlaces = filteredPlaces.filter(place => place.categoryId === searchQuery.category);
            }

            if (searchQuery.radius && searchQuery.location) {
                filteredPlaces = filteredPlaces.filter(place => {
                    const distance = getDistanceFromLatLonInKm(
                        searchQuery.location.lat,
                        searchQuery.location.lng,
                        place.location.coordinates[1],
                        place.location.coordinates[0]
                    );
                    return distance <= searchQuery.radius;
                });
            }

            setSearchResults(filteredPlaces);
        } catch (error) {
            console.error('Error searching places:', error);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const {latitude, longitude} = position.coords;
                setMarkerPosition([latitude, longitude]);
                setNewPlace(prevState => ({
                    ...prevState,
                    location: {lat: latitude, lng: longitude}
                }));
            }, error => {
                console.error('Error getting current location:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1); // deg2rad below
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    return (
        <div className="places-container">
            <h3>My Places List</h3>
            <div className="search-form">
                <input
                    type="text"
                    placeholder="Search by description"
                    value={searchQuery.description}
                    onChange={(e) => setSearchQuery({...searchQuery, description: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Search by category"
                    value={searchQuery.category}
                    onChange={(e) => setSearchQuery({...searchQuery, category: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Search radius (km)"
                    value={searchQuery.radius}
                    onChange={(e) => setSearchQuery({...searchQuery, radius: e.target.value})}
                />
                <button onClick={getCurrentLocation}>Use Current Location</button>
                <button onClick={searchPlaces}>Search</button>
                <button onClick={resetSearch}>Reset</button>
            </div>
            <ul className="places-list">
                {searchResults.map(place => {
                    const coordinates = place.location?.coordinates;
                    return (
                        <li key={place.objectId} className="place-item">
                            {place.image_url &&
                                <img src={place.image_url} alt={place.description} className="place-image"/>}
                            <div className="place-details">
                                <div className="place-description">{place.description}</div>
                                <div className="place-hashtags">Hashtags: {place.hashtags}</div>
                                <div className="place-category">Category: {place.categoryName}</div>
                                <div className="place-likes">Likes: {place.likes ? place.likes.length : 0}</div>
                                {place.ownerId === userId && (
                                    <button onClick={() => deletePlace(place.objectId)}>Delete</button>
                                )}
                                {place.ownerId !== userId && (
                                    <button onClick={() => likePlace(place.objectId)}>Like</button>
                                )}
                                <button onClick={() => setSelectedPlace(place)}>View on Map</button>
                            </div>
                        </li>
                    );
                })}
            </ul>
            {selectedPlace && (
                <div className="modal-overlay" onClick={() => setSelectedPlace(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h5 className="modal-title">{selectedPlace.description}</h5>
                            <button type="button" className="close" onClick={() => setSelectedPlace(null)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{height: '300px', width: '100%'}}>
                                <MapContainer
                                    center={[selectedPlace.location.coordinates[1], selectedPlace.location.coordinates[0]]}
                                    zoom={13} style={{height: '100%'}}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <Marker
                                        position={[selectedPlace.location.coordinates[1], selectedPlace.location.coordinates[0]]}>
                                        <Popup>
                                            {selectedPlace.description}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <button onClick={() => setShowAddModal(true)}>Add New Place</button>
            </div>
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h5 className="modal-title">Add New Place</h5>
                            <button type="button" className="close" onClick={() => setShowAddModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={newPlace.description}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="hashtags"
                                placeholder="Hashtags"
                                value={newPlace.hashtags}
                                onChange={handleInputChange}
                            />
                            <select
                                name="image_url"
                                value={newPlace.image_url}
                                onChange={handleInputChange}
                                style={{color: 'black', backgroundColor: 'white'}}
                            >
                                <option value="">Select Image</option>
                                {fileDirectory.map(file => (
                                    <option
                                        key={file.name}
                                        value={file.publicUrl}
                                    >
                                        {file.name}
                                    </option>
                                ))}
                                <option
                                    value="new"
                                    style={{fontWeight: 'bold', color: 'plum'}}
                                >
                                    Upload New Image
                                </option>
                            </select>
                            {newImageInput && (
                                <input type="file" accept="image/*" onChange={handleFileChange}/>
                            )}
                            <select
                                name="category"
                                value={newPlace.category}
                                onChange={handleInputChange}
                                style={{color: 'black', backgroundColor: 'white'}}
                            >
                                <option value="">Select category</option>
                                {categories.map(category => (
                                    <option key={category.objectId} value={category.objectId}>
                                        {category.name}
                                    </option>
                                ))}
                                <option
                                    value="new"
                                    style={{fontWeight: 'bold', color: 'plum'}}
                                >
                                    Add Category
                                </option>
                            </select>
                            {newCategoryInput && (
                                <input
                                    type="text"
                                    name="newCategory"
                                    placeholder="New Category Name"
                                    value={newPlace.newCategory}
                                    onChange={handleInputChange}
                                />
                            )}
                            <div>
                                <button onClick={getCurrentLocation}>Set Current Location</button>
                            </div>
                            <div style={{height: '300px', width: '100%'}}>
                                <MapContainer center={[51.505, -0.09]} zoom={13} style={{height: '100%'}}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {markerPosition && <Marker position={markerPosition}/>}
                                    <MapClickHandler/>
                                </MapContainer>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowAddModal(false)}
                            >
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={addPlace}>
                                Add Place
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Places;

