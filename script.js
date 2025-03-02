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

// Element representations
const title = document.querySelector(".player-song-title");
const artist = document.querySelector(".player-song-artist");
const cover = document.querySelector(".player-song-cover");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const play = document.querySelector(".play");
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");
const background = document.querySelector(".media-player-page");
const progress = document.querySelector(".progress");

const music = new Audio();
let songIndex = 0;
let isPlaying = false;

// Function to fetch a file and extract metadata
async function fetchAndExtractMetadata(song) {
	try {
		const response = await fetch(song.path);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch ${song.path}: ${response.statusText}`
			);
		}
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
					reject(error); // Reject the promise if metadata extraction fails
				},
			});
		});
	} catch (error) {
		console.error(`Error fetching ${song.path}:`, error);
		throw error; // Re-throw the error to handle it in the calling function
	}
}

function getSongCoverImageColor(base64Image) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = base64Image;

		img.onload = () => {
			const colorThief = new ColorThief();
			const dominantColor = colorThief.getColor(img); // Get dominant color [R, G, B]
			resolve(dominantColor);
		};

		img.onerror = (error) => {
			reject(`Error loading image: ${error}`);
		};
	});
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
	const results = await Promise.allSettled(
		songs.map((song) => fetchAndExtractMetadata(song))
	);

	// Filter out successful results
	const detailedSongs = results
		.filter((result) => result.status === "fulfilled")
		.map((result) => result.value);

	// Log any errors
	results.forEach((result) => {
		if (result.status === "rejected") {
			console.error("Error processing song:", result.reason);
		}
	});

	// Add the detailed songs to the songList array
	songList.push(...detailedSongs);

	// Log the songList for debugging
	console.log("Song List:", songList);

	// Render the songs in order
	detailedSongs.forEach((song) => {
		createSongElement(song);
	});

	loadMusic(songList[songIndex]);
}
processAndRenderSongs();

function togglePlay() {
	if (isPlaying) {
		pauseMusic();
	} else {
		playMusic();
	}
}

function playMusic() {
	isPlaying = true;
	play.src = "assets/pause.png";
	music.play();
}

function pauseMusic() {
	isPlaying = false;
	play.src = "assets/play.png";
	music.pause();
}

async function loadMusic(song) {
	if (!song) {
		console.error("No song provided to loadMusic.");
		return;
	}

	console.log("Loading song:", song);
	music.src = song.path;
	title.textContent = song.title;
	artist.textContent = song.artist;
	cover.src = song.coverImage;

	// Wait for the 'loadedmetadata' event to get the duration
	music.addEventListener("loadedmetadata", () => {
		const { duration, currentTime } = music;
		console.log("Duration:", duration, "Current Time:", currentTime);

		const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");
		durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
			duration % 60
		)}`;
		currentTimeEl.textContent = `${formatTime(
			currentTime / 60
		)}:${formatTime(currentTime % 60)}`;
	});

	// Optional: Extract dominant color from the cover image
	try {
		const dominantColor = await getSongCoverImageColor(song.coverImage);
		const colorString = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
		background.style.backgroundColor = colorString;
	} catch (error) {
		console.error("Error extracting dominant color:", error);
	}
}
function changeMusic(direction) {
	songIndex = (songIndex + direction + songList.length) % songList.length;
	loadMusic(songList[songIndex]);
	playMusic();
}

function updateProgressBar() {
	const { duration, currentTime } = music;
	const progressPercent = (currentTime / duration) * 100;

	const newDashOffset = 880 - (765 * progressPercent) / 100;

	progress.setAttribute("stroke-dashoffset", newDashOffset);

	const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");

	durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
		duration % 60
	)}`;
	currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(
		currentTime % 60
	)}`;
}

play.addEventListener("click", () => togglePlay());
previous.addEventListener("click", () => changeMusic(-1));
next.addEventListener("click", () => changeMusic(1));
music.addEventListener("ended", () => changeMusic(1));
music.addEventListener("timeupdate", updateProgressBar);
music.addEventListener("loadedmetadata", () => {
	const { duration, currentTime } = music;
	console.log("Duration:", duration, "Current Time:", currentTime);

	const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");
	durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
		duration % 60
	)}`;
	currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(
		currentTime % 60
	)}`;
});
