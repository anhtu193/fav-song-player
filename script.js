// List of songs with just paths
const songs = [
	{ path: "assets/songs/CanWeLove.mp3" },
	{ path: "assets/songs/Lost.mp3" },
	{ path: "assets/songs/ShayNanggg.mp3" },
	{ path: "assets/songs/SojuLove.mp3" },
	{ path: "assets/songs/ChimSoul.mp3" },
	{ path: "assets/songs/DungLamTraiTimAnhDauRemake.mp3" },
	{ path: "assets/songs/NgoaiLeCuaNhau.mp3" },
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
const track = document.querySelector(".track");
const durationDivider = document.querySelector(".duration-divider");
const menu = document.querySelector(".menu");

const music = new Audio();
let textColor = "rgba(0,0,0,0.8)";
let songIndex = 0;
let isPlaying = false;
let isFirstLoad = true;

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
function createSongElement(song, index) {
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

	songItem.addEventListener("click", () => {
		songIndex = index;
		loadMusic(songList[songIndex]);

		playMusic();

		// Scroll to the #media-player section
		document
			.querySelector("#media-player")
			.scrollIntoView({ behavior: "smooth" });
	});

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

function showLoadingIcon() {
	const loadingOverlay = document.getElementById("loading-overlay");
	if (loadingOverlay) {
		loadingOverlay.style.display = "flex";
	}
}

function hideLoadingIcon() {
	const loadingOverlay = document.getElementById("loading-overlay");
	if (loadingOverlay) {
		loadingOverlay.style.display = "none";
	}
}

// Process all songs and render them in order
async function processAndRenderSongs() {
	showLoadingIcon();
	try {
		const results = await Promise.allSettled(
			songs.map((song) => fetchAndExtractMetadata(song))
		);

		const detailedSongs = results
			.filter((result) => result.status === "fulfilled")
			.map((result) => result.value);

		results.forEach((result) => {
			if (result.status === "rejected") {
				console.error("Error processing song:", result.reason);
			}
		});

		songList.push(...detailedSongs);
		console.log("Song List:", songList);

		detailedSongs.forEach((song, index) => {
			createSongElement(song, index);
		});

		loadMusic(songList[songIndex]);
	} catch (error) {
		console.error("Error processing songs:", error);
	} finally {
		hideLoadingIcon(); // Hide loading icon when done
	}
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
	const backgroundColor = window.getComputedStyle(background).backgroundColor;
	textColor = getContrastTextColor(backgroundColor);
	if (textColor === "rgba(0,0,0,0.8)") {
		play.src = "assets/pause-dark.png";
	} else if (textColor === "rgba(255,255,255,0.8)") {
		play.src = "assets/pause.png";
	}

	music.play();
}

function pauseMusic() {
	isPlaying = false;
	const backgroundColor = window.getComputedStyle(background).backgroundColor;
	textColor = getContrastTextColor(backgroundColor);
	if (textColor === "rgba(0,0,0,0.8)") {
		play.src = "assets/play-dark.png";
	} else if (textColor === "rgba(255,255,255,0.8)") {
		play.src = "assets/play.png";
	}
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

		const formatTime = (time) => {
			if (isNaN(time)) return "00"; // Fallback for NaN values
			return String(Math.floor(time)).padStart(2, "0");
		};
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
		updateTextColor(background);
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

	// Calculate progress percentage
	const progressPercent = (currentTime / duration) * 100;

	// Calculate new dash offset
	const totalLength = 942; // Full circumference
	const visibleLength = 753.6; // Visible part of the track
	const newDashOffset = totalLength - (visibleLength * progressPercent) / 100;

	// Update the progress bar
	progress.style.strokeDashoffset = newDashOffset;

	// Update the time display
	const formatTime = (time) => String(Math.floor(time)).padStart(2, "0");
	durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
		duration % 60
	)}`;
	currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(
		currentTime % 60
	)}`;
}

function seekToPercentage(percentage) {
	if (isNaN(music.duration)) {
		console.error("Song duration is not available.");
		return;
	}

	// Calculate the new current time
	const newCurrentTime = (music.duration * percentage) / 100;

	// Update the song's current time
	music.currentTime = newCurrentTime;

	// Manually update the progress bar
	updateProgressBar();
}

function getLuminance(color) {
	// Convert the color to RGB values
	const rgb = color.match(/\d+/g);
	const r = parseInt(rgb[0]);
	const g = parseInt(rgb[1]);
	const b = parseInt(rgb[2]);

	// Calculate the luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	console.log(luminance);
	return luminance;
}

function getContrastTextColor(backgroundColor) {
	const luminance = getLuminance(backgroundColor);
	return luminance > 0.5 ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)";
}

function updateTextColor(divElement) {
	const backgroundColor = window.getComputedStyle(divElement).backgroundColor;
	textColor = getContrastTextColor(backgroundColor);
	divElement.style.color = textColor;
	durationDivider.style.backgroundColor = textColor;
	if (textColor === "rgba(0,0,0,0.8)") {
		next.src = "assets/next-dark.png";
		previous.src = "assets/back-dark.png";
		menu.src = "assets/menu.png";
		// If the page is first load then the first song don't autoplay so set the src correctly
		isFirstLoad === true
			? (play.src = "assets/play-dark.png")
			: (play.src = "assets/pause-dark.png");
	} else if (textColor === "rgba(255,255,255,0.8)") {
		next.src = "assets/next.png";
		previous.src = "assets/back.png";
		menu.src = "assets/menu-dark.png";
		isFirstLoad === true
			? (play.src = "assets/play.png")
			: (play.src = "assets/pause.png");
	}
}

// Event Listeners
play.addEventListener("click", () => togglePlay());
previous.addEventListener("click", () => changeMusic(-1));
next.addEventListener("click", () => changeMusic(1));
music.addEventListener("ended", () => changeMusic(1));
music.addEventListener("timeupdate", () => updateProgressBar());
music.addEventListener("loadedmetadata", () => {
	const { duration, currentTime } = music;

	const formatTime = (time) => {
		if (isNaN(time)) return "00"; // Fallback for NaN values
		return String(Math.floor(time)).padStart(2, "0");
	};
	durationEl.textContent = `${formatTime(duration / 60)}:${formatTime(
		duration % 60
	)}`;
	currentTimeEl.textContent = `${formatTime(currentTime / 60)}:${formatTime(
		currentTime % 60
	)}`;
});
track.addEventListener("click", (event) => {
	// Get the bounding box of the track
	const rect = track.getBoundingClientRect();

	// Calculate the click position relative to the center of the circle
	const clickX = event.clientX - rect.left - rect.width / 2;
	const clickY = event.clientY - rect.top - rect.height / 2;

	// Convert Cartesian coordinates to polar coordinates (angle)
	const angle = Math.atan2(clickY, clickX); // Angle in radians

	// Adjust for the rotation (-55deg in CSS)
	const rotationOffset = (-55 * Math.PI) / 180; // Convert degrees to radians
	let normalizedAngle =
		(angle - rotationOffset + Math.PI * 2) % (Math.PI * 2);

	// Calculate the progress percentage based on the full circle
	let progressPercent = (normalizedAngle / (Math.PI * 2)) * 100;

	// Adjust for the gap
	const totalLength = 942; // Full circumference
	const visibleLength = 753.6; // Visible part of the track

	// Map the progress percentage to the visible part of the track
	const adjustedProgressPercent =
		(progressPercent * totalLength) / visibleLength;

	// Ensure the adjusted progress percentage is within bounds
	if (adjustedProgressPercent > 100) {
		progressPercent = 100;
	} else {
		progressPercent = adjustedProgressPercent;
	}

	// Seek to the calculated percentage of the song's duration
	seekToPercentage(progressPercent);
});
document.addEventListener(
	"click",
	() => {
		if (isFirstLoad) {
			isFirstLoad = false;
		}
	},
	{ once: true } // When the user click the whole web the first time, remove this event
);
