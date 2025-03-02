// List of songs with just paths
const songs = [
	{ path: "assets/songs/CanWeLove.mp3" },
	{ path: "assets/songs/Lost.mp3" },
	{ path: "assets/songs/ShayNanggg.mp3" },
	{ path: "assets/songs/Friendzone.mp3" },
	{ path: "assets/songs/WhenYouLookAtMe.mp3" },
	{ path: "assets/songs/SojuLove.mp3" },
];

// Detailed song list (will be populated later)
const songList = [];

// Function to fetch a file and extract metadata
async function fetchAndExtractMetadata(song) {
	try {
		const response = await fetch(song.path);
		const blob = await response.blob();

		return new Promise((resolve, reject) => {
			jsmediatags.read(blob, {
				onSuccess: function (tag) {
					const metadata = tag.tags;

					const detailedSong = {
						path: song.path,
						title: metadata.title || "Unknown Title",
						artist: metadata.artist || "Unknown Artist",
						coverImage: metadata.picture
							? getCoverImageUrl(metadata.picture)
							: "assets/default.png",
					};

					resolve(detailedSong);
				},
				onError: function (error) {
					console.error(
						`Error reading metadata for ${song.path}:`,
						error
					);
				},
			});
		});
	} catch (error) {
		console.error(`Error fetching ${song.path}:`, error);
	}
}

// Function to render song element
function createSongElement(song) {
	const songListElement = document.querySelector(".song-list");

	const songItem = document.createElement("div");
	songItem.innerHTML = ` 
        <div class="song-item">
			<div class="song">	
				<img src="${song.coverImage}" alt="${song.title}" class="song-cover-image">
				<div class="song-detail">
					<span class="song-title">${song.title}</span>
					<span class="song-artist">${song.artist}</span>
				</div>
			</div>
			<div class="song-divider"></div>
		</div>
    `;

	songListElement.appendChild(songItem);
}

// Function to convert picture data to a URL
function getCoverImageUrl(picture) {
	const base64String = arrayBufferToBase64(picture.data);
	return `data:${picture.format};base64,${base64String}`;
}

// Function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

// Process all songs and render them in order
async function processAndRenderSongs() {
	// Fetch metadata for all songs first
	const detailedSongs = await Promise.all(
		songs.map((song) => fetchAndExtractMetadata(song))
	);

	// Add the detailed songs to the songList array
	songList.push(...detailedSongs);

	// Render the songs in order
	detailedSongs.forEach((song) => {
		createSongElement(song);
	});
}

processAndRenderSongs();
