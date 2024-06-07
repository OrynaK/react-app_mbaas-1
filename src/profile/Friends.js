import React, { useState, useEffect } from 'react';
import Backendless from 'backendless';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { getDistance } from 'geolib';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRadius, setSearchRadius] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedFriendLocations, setSelectedFriendLocations] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const userId = Backendless.UserService.currentUser.objectId;

    useEffect(() => {
        fetchFriends();
        fetchFriendRequests();
        fetchUserLocation();
    }, []);

    const fetchUserLocation = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            setUserLocation(currentUser.my_location);
        } catch (error) {
            console.error('Error fetching user location:', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const queryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(`(userId='${userId}' OR friendId='${userId}') AND status='accepted'`);
            const friendsData = await Backendless.Data.of('friends').find(queryBuilder);

            const friendsWithUserDetails = await Promise.all(friendsData.map(async (friend) => {
                const friendUserId = friend.userId === userId ? friend.friendId : friend.userId;
                const user = await Backendless.Data.of('Users').findById(friendUserId);
                return { ...friend, name: user.name, locationTrackingEnabled: user.locationTrackingEnabled, location: user.my_location };
            }));

            setFriends(friendsWithUserDetails);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const queryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(`friendId='${userId}' AND status='pending'`);
            const requestsData = await Backendless.Data.of('friends').find(queryBuilder);

            const requestsWithUserDetails = await Promise.all(requestsData.map(async (request) => {
                const user = await Backendless.Data.of('Users').findById(request.userId);
                return { ...request, name: user.name };
            }));

            setFriendRequests(requestsWithUserDetails);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const request = await Backendless.Data.of('friends').findById(requestId);
            request.status = 'accepted';
            await Backendless.Data.of('friends').save(request);
            fetchFriends();
            fetchFriendRequests();
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await Backendless.Data.of('friends').remove({ objectId: requestId });
            fetchFriendRequests();
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const handleDeleteFriend = async (friendId) => {
        try {
            await Backendless.Data.of('friends').remove({ objectId: friendId });
            fetchFriends();
        } catch (error) {
            console.error('Error deleting friend:', error);
        }
    };

    const handleSearchFriends = async () => {
        try {
            const queryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(`name LIKE '%${searchQuery}%'`);
            const results = await Backendless.Data.of('Users').find(queryBuilder);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching for friends:', error);
        }
    };

    const handleAddFriend = async (friendId) => {
        try {
            if (friendId === userId) {
                alert("You cannot add yourself as a friend.");
                return;
            }

            const existingRequestQuery = Backendless.DataQueryBuilder.create()
                .setWhereClause(`(userId='${userId}' AND friendId='${friendId}') OR (userId='${friendId}' AND friendId='${userId}')`);
            const existingRequests = await Backendless.Data.of('friends').find(existingRequestQuery);

            if (existingRequests.length > 0) {
                alert("Friend request already sent.");
                return;
            }

            const newRequest = {
                userId: userId,
                friendId: friendId,
                status: 'pending'
            };
            await Backendless.Data.of('friends').save(newRequest);
            alert('Friend request sent.');
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    };

    const handleSearchWithinRadius = async () => {
        if (!searchRadius) {
            alert("Please enter a radius.");
            return;
        }

        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            const currentUserLocation = currentUser.my_location;

            if (!currentUserLocation) {
                alert("Current user's location not available.");
                return;
            }

            const friendsWithinRadius = friends.filter(friend => {
                if (friend.locationTrackingEnabled && friend.location) {
                    const distance = getDistance(
                        { latitude: currentUserLocation.lat, longitude: currentUserLocation.lng },
                        { latitude: friend.location.lat, longitude: friend.location.lng }
                    );
                    return distance <= searchRadius * 1000; // Convert radius to meters
                }
                return false;
            });

            setSearchResults(friendsWithinRadius);
            setSelectedFriendLocations(friendsWithinRadius);
        } catch (error) {
            console.error('Error searching friends within radius:', error);
        }
    };


    const markerIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    const mapStyle = {
        height: "400px",
        width: "100%"
    };

    return (
        <div className="friends-container">
            <h2>Friends</h2>
            <div>
                <h3>My Friends</h3>
                <ul>
                    {friends.map(friend => (
                        <li key={friend.objectId}>
                            {friend.name}
                            <button onClick={() => handleDeleteFriend(friend.objectId)}>Delete</button>
                            {friend.locationTrackingEnabled && (
                                <button onClick={() => setSelectedFriendLocations([friend.location])}>Show Location</button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Friend Requests</h3>
                <ul>
                    {friendRequests.map(request => (
                        <li key={request.objectId}>
                            {request.name}
                            <button onClick={() => handleAcceptRequest(request.objectId)}>Accept</button>
                            <button onClick={() => handleRejectRequest(request.objectId)}>Reject</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Find Friends</h3>
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearchFriends}>Search</button>
                <ul>
                    {searchResults.map(result => (
                        <li key={result.objectId}>
                            {result.name}
                            <button onClick={() => handleAddFriend(result.objectId)}>Add Friend</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Search Friends Within Radius</h3>
                <input
                    type="number"
                    placeholder="Enter radius in km"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(e.target.value)}
                />
                <button onClick={handleSearchWithinRadius}>Search</button>
                {userLocation && selectedFriendLocations.length > 0 && (
                    <div className="map-container">
                        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={mapStyle}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[userLocation.lat, userLocation.lng]} icon={markerIcon}>
                                <Popup>You are here</Popup>
                            </Marker>
                            {searchRadius && (
                                <Circle center={[userLocation.lat, userLocation.lng]} radius={searchRadius * 1000} color="blue" />
                            )}
                            {selectedFriendLocations.map((friend, index) => (
                                <Marker key={index} position={[friend.location.lat, friend.location.lng]} icon={markerIcon}>
                                    <Popup>{friend.name}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
