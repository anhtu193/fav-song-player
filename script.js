// List of songs
const songs = [
	{ name: "Can We Love", path: "assets/songs/CanWeLove.mp3" },
	{ name: "Lost", path: "assets/songs/Lost.mp3" },
	{ name: "Shay Nắnggg", path: "assets/songs/ShayNanggg.mp3" },
	{ name: "Friendzone", path: "assets/songs/Friendzone.mp3" },
	{ name: "When You Look At Me", path: "assets/songs/WhenYouLookAtMe.mp3" },
];

const media = document.querySelector(".media-player-page");

// // Function to fetch a file and extract metadata
// async function fetchAndExtractMetadata(song) {
// 	fetch(song.path)
// 		.then((response) => response.blob())
// 		.then((blob) => {
// 			jsmediatags.read(blob, {
// 				onSuccess: async function (tag) {
// 					const metadata = tag.tags;
// 					displaySongInfo(song.name, metadata);
// 				},
// 				onError: function (error) {
// 					console.error(
// 						`Error reading metadata for ${song.name}:`,
// 						error
// 					);
// 					displaySongInfo(song.name, {
// 						error: "Metadata not available",
// 					});
// 				},
// 			});
// 		})
// 		.catch((error) => {
// 			console.error(`Error fetching ${song.name}:`, error);
// 			displaySongInfo(song.name, { error: "File not found" });
// 		});
// }

// function getSongCoverImageColor(base64Image) {
// 	return new Promise((resolve, reject) => {
// 		const img = new Image();
// 		img.src = base64Image;

// 		img.onload = () => {
// 			const colorThief = new ColorThief();
// 			const dominantColor = colorThief.getColor(img); // Get dominant color [R, G, B]
// 			resolve(dominantColor);
// 		};

// 		img.onerror = (error) => {
// 			reject(`Error loading image: ${error}`);
// 		};
// 	});
// }

// // Function to display song information
// async function displaySongInfo(songName, metadata) {
// 	const songList = document.querySelector(".song-list");

// 	const songInfo = document.createElement("div");
// 	const dominantColor = await getSongCoverImageColor(
// 		getCoverImageUrl(metadata.picture)
// 	);
// 	const colorString = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
// 	songInfo.innerHTML = `
//         <h2>${songName}</h2>
//         <p><strong>Title:</strong> ${metadata.title || "N/A"}</p>
//         <p><strong>Artist:</strong> ${metadata.artist || "N/A"}</p>
//         <p><strong>Album:</strong> ${metadata.album || "N/A"}</p>
//         ${
// 			metadata.picture
// 				? `<img src="${getCoverImageUrl(
// 						metadata.picture
// 				  )}" alt="Cover" style="max-width: 100px;">`
// 				: ""
// 		}
//         <div style="width: 100px; height: 100px; background-color: ${colorString};"></div>
//         <hr>
//     `;

// 	songList.appendChild(songInfo);
// }

// // Function to convert picture data to a URL
// function getCoverImageUrl(picture) {
// 	const base64String = arrayBufferToBase64(picture.data);
// 	return `data:${picture.format};base64,${base64String}`;
// }

// // Function to convert ArrayBuffer to Base64
// function arrayBufferToBase64(buffer) {
// 	let binary = "";
// 	const bytes = new Uint8Array(buffer);
// 	const len = bytes.byteLength;
// 	for (let i = 0; i < len; i++) {
// 		binary += String.fromCharCode(bytes[i]);
// 	}
// 	return window.btoa(binary);
// }

// // Loop through the songs and extract metadata
// songs.forEach((song) => {
// 	fetchAndExtractMetadata(song);
// });
