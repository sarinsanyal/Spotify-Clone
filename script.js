console.log("Spotify Clone Under Construction!");

let selection = 0;
let link = "http://127.0.0.1:3000/songs";

async function getPlaylists() {
    let site = await fetch(link);
    let response = await site.text();

    // Create the folders available
    let div = document.createElement("div");
    div.innerHTML = response;
    let folders = div.getElementsByTagName('a');

    // Parsing through the folders and storing names and URLs in an array
    let AvailablePlaylists = [];

    for (let i = 1; i < folders.length; i++) {
        const playlist = folders[i];
        let name = playlist.textContent.trim();

        // Remove trailing slash if present
        if (name.endsWith("/")) {
            name = name.slice(0, -1);
        }
        // Assuming the folder name is the text of the anchor tag
        AvailablePlaylists.push({
            name: name, // Get the folder name
            url: playlist.href // Get the URL
        });
    }
    return AvailablePlaylists;
}

async function getCover(folder) {
    let link = folder.url; // Use the URL from the playlist object
    let site = await fetch(link);
    let response = await site.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let items = div.getElementsByTagName('a');

    // Parsing through the songs and storing in array
    let CoverImages = [];

    for (let i = 1; i < items.length; i++) {
        const List = items[i];
        if (List.href.endsWith(".jpg")) {
            CoverImages.push(List.href);
        }
    }
    return CoverImages;
}

// Function to display images and playlist names on both side-bar and main page
function displayPlaylists(playlists) {
    let container = document.getElementsByClassName("playlists-container")[0];
    container.innerHTML = ""; // Clear any existing content

    playlists.forEach((playlist, index) => {
        let playlistDiv = document.createElement("div");
        playlistDiv.classList.add("playlist-item");
        playlistDiv.setAttribute("data-name", playlist.name);


        let img = document.createElement("img");
        img.src = playlist.coverImage || "default-cover.jpg"; // Fallback image if no cover
        img.alt = `Cover for Playlist: ${playlist.name}`;
        img.classList.add("cover-image");

        let nameLabel = document.createElement("p");
        nameLabel.textContent = playlist.name; // Use the actual folder name
        nameLabel.classList.add("playlist-name");

        playlistDiv.addEventListener("click", () => {
            displayMain(playlist);  // Display songs when playlist is clicked
            console.log("The requested Playlist is:", playlist);
            window.selectedGlobalPlaylist = playlist; //Declares a global variable
        });

        playlistDiv.appendChild(img);
        playlistDiv.appendChild(nameLabel);
        container.appendChild(playlistDiv);
    });
}

//Displays the songs in the main section
function displaySongs(playlist) { 
    let mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = ""; // Clear any existing content

    // Fetch the songs for this playlist
    getSongs(playlist).then(songs => {
        if (songs.length === 0) {
            mainContent.innerHTML = "<p>No songs available for this playlist.</p>";
        } else {
            let unorderedList = document.createElement("ul");
            unorderedList.classList.add("list-songs")
            mainContent.appendChild(unorderedList);

            songs.forEach(song => { //Loops across each song
                let songLi = document.createElement("li");
                songLi.classList.add("song-item");

                // Extract the song name from the URL
                let songName = song.split('/').pop(); // Get the last part of the URL 
                songName = songName.replace(/%20/g, ' '); // Replace '%20' with space
                songName = songName.replace('.mp3', ''); // Remove the '.mp3' extension

                songLi.textContent = songName;

                // Add click event to play the song
                songLi.addEventListener("click", () => {
                    audioPlayerFunc(song, songLi);
                });
                

                unorderedList.appendChild(songLi);
            });
        }
    });
}

//Displays the function in the main section
function displayMain(playlist){
    let mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = ""; // Clear any existing content
    
    getSongs(playlist).then(songs => {
        if (songs.length === 0) {
            mainContent.innerHTML = "<p>No songs available for this playlist.</p>";
        } else {
            // Create a new section for displaying the playlist cover image and name
            let playlistSection = document.createElement("section");
            playlistSection.classList.add("playlist-section");
            
            // Create the image element
            let img = document.createElement("img");
            img.src = playlist.coverImage || "default-cover.jpg"; // Use a default image if no cover is available
            img.alt = `Cover for Playlist: ${playlist.name}`;
            img.classList.add("cover-image");
            
            // Create the name element
            let nameLabel = document.createElement("h2");
            nameLabel.textContent = playlist.name; // Display the playlist name
            nameLabel.classList.add("playlist-name");
            
            // Append the image and name to the playlist section
            playlistSection.appendChild(img);
            playlistSection.appendChild(nameLabel);
            
            // Append the playlist section to the main content
            mainContent.appendChild(playlistSection);
            
        }
    });

    //End List of songs
    displaySongs(playlist);
}

//Fetches the songs from the given folder
async function getSongs(folder) {
    let link = folder.url; // Use the URL from the playlist object
    let site = await fetch(link);
    let response = await site.text();

    // Create the songs available
    let div = document.createElement("div");
    div.innerHTML = response;
    let songs = div.getElementsByTagName('a');

    // Parsing through the songs and storing in array
    let AvailableSongs = [];

    for (let i = 1; i < songs.length; i++) {
        const songList = songs[i];
        if (songList.href.endsWith(".mp3")) {
            AvailableSongs.push(songList.href);
        }
    }
    return AvailableSongs;
}

//Hamburger Implementation
document.getElementById("hamburger").addEventListener("click", function() {
    let sidebar = document.querySelector(".left-bar");
    let main_content = document.querySelector(".main-content");
    let container = document.querySelector(".container");
    let hamburger = document.getElementById("hamburger");

    // Toggle the 'collapsed' and 'active' classes
    sidebar.classList.toggle("collapsed");
    container.classList.toggle("sidebar-collapsed");
    hamburger.classList.toggle("active"); // Toggles rotation
    main_content.classList.toggle("increased") //Toggles the main section to increase
});

//Home Erase Main Screen 
document.querySelector(".home").addEventListener("click", function() {
    let mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = "<p>Click on a Playlist to play songs...</p>"; // Display text when Home is clicked
});


let currentPlaylist = null;
let currentSongIndex = 0;

// Function to play a specific song from the playlist
function audioPlayerFunc(song, songLi) {
    let songItems = document.querySelectorAll(".song-item");
    songItems.forEach(item => {
        item.style.color = ""; // Reset to default color
        item.style.backgroundColor = ""; // Reset to default background
    });

    // Apply the styling only to the selected item
    songLi.style.color = "rgb(30, 208, 94)";
    songLi.style.backgroundColor = "rgb(64,64,64)";

    let audioPlayer = document.getElementById("audioPlayer");
    let totalTime = document.getElementById("totalTime");
    let currentTimeDisplay = document.getElementById("currentTime");
    let SeekBar = document.getElementById("seek-bar");
    let playPauseButton = document.getElementById("pausePlayButton");

    // Load and play the selected song
    audioPlayer.src = song;
    audioPlayer.play();
    console.log("Song being Played is: ", song);
    displaySongInfoAudioPlayer(song);

    
    // Load metadata and update the total duration
    audioPlayer.addEventListener("loadedmetadata", function() {
        let duration = audioPlayer.duration;
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        totalTime.innerHTML = `${minutes}:${seconds}`;
    });
    
    // Update current time and progress bar as the song plays
    audioPlayer.addEventListener("timeupdate", function() {
        let currentTime = audioPlayer.currentTime;
        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        seconds = seconds < 10 ? "0" + seconds : seconds;
        currentTimeDisplay.innerHTML = `${minutes}:${seconds}`;
        SeekBar.value = (currentTime / audioPlayer.duration) * 100;
    });
    
    // Seek audio when the range input is changed
    SeekBar.addEventListener("input", function() {
        audioPlayer.currentTime = (SeekBar.value / 100) * audioPlayer.duration;
    });

    // Set the play button icon to pause
    playPauseButton.src = "assets/images/pausesong.svg";

    // Play/pause toggle functionality
    playPauseButton.addEventListener("click", function() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.src = "assets/images/pausesong.svg"; // Set to pause icon
        } else {
            audioPlayer.pause();
            playPauseButton.src = "assets/images/playsong.svg"; // Set to play icon
        }
    });

    // Store the current playlist and song index
    currentSongIndex = Array.from(songItems).indexOf(songLi);
    currentPlaylist = songItems;
}

// Function to play the next song
function playNextSong() {
    if (currentPlaylist && currentSongIndex < currentPlaylist.length - 1) {
        currentSongIndex++;
        let nextSongLi = currentPlaylist[currentSongIndex];
        let nextSong = selectedGlobalPlaylist.url + nextSongLi.textContent + ".mp3";
        audioPlayerFunc(nextSong, nextSongLi);
    }
}

// Function to play the previous song
function playPreviousSong() {
    if (currentPlaylist && currentSongIndex > 0) {
        currentSongIndex--;
        let prevSongLi = currentPlaylist[currentSongIndex];
        let prevSong = selectedGlobalPlaylist.url + prevSongLi.textContent + ".mp3";
        audioPlayerFunc(prevSong, prevSongLi);
    }
}

// Add event listeners for the Next and Previous buttons
document.getElementById("nextButton").addEventListener("click", playNextSong);
document.getElementById("prevButton").addEventListener("click", playPreviousSong);

// Volume Control Code
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");

volumeSlider.addEventListener("input", function() {
    const volume = volumeSlider.value;
    audioPlayer.volume = volume;

    // Update the icon based on the volume level
    if (volume == 0) {
        volumeIcon.src = "assets/images/volume-mute.svg";
        volumeIcon.alt = "Muted";
    } else if (volume > 0 && volume <= 0.3) {
        volumeIcon.src = "assets/images/volume-low.svg";
        volumeIcon.alt = "Low Volume";
    } else if (volume > 0.3 && volume <= 0.7) {
        volumeIcon.src = "assets/images/volume-medium.svg";
        volumeIcon.alt = "Medium Volume";
    } else {
        volumeIcon.src = "assets/images/volume-high.svg";
        volumeIcon.alt = "High Volume";
    }

});

volumeIcon.addEventListener("click", function() {
    // Extract the file name from the src URL
    const iconFileName = volumeIcon.src.split('/').pop();

    if (iconFileName !== "volume-mute.svg") {
        volumeIcon.src = "assets/images/volume-mute.svg";
        volumeIcon.alt = "Muted";
        volumeIcon.title = "Press to Unmute";
        audioPlayer.volume = 0; // Mute the audio
        volumeSlider.value = 0; // Update the slider to reflect muted state
    } else {
        // Update the icon to unmute and set to medium volume
        volumeIcon.src = "assets/images/volume-medium.svg";
        volumeIcon.alt = "Medium Volume";
        volumeIcon.title = "Press to Mute";
        audioPlayer.volume = 0.5; // Set to a default medium volume
        volumeSlider.value = 0.5; // Update the slider to reflect medium volume
    }
});

function displaySongInfoAudioPlayer(song){
    let SongNameDiv = document.querySelector(".song-name");
    let PlaylistNameDiv = document.querySelector(".bottom-playlist-name");

    // Extract the song name from the URL
    let songName = song.split('/').pop(); // Get the last part of the URL 
    songName = songName.replace(/%20/g, ' '); // Replace '%20' with space
    songName = songName.replace('.mp3', ''); // Remove the '.mp3' extension

    SongNameDiv.textContent = songName;
    console.log(songName, selectedGlobalPlaylist.name);
    PlaylistNameDiv.textContent = selectedGlobalPlaylist.name;
}

//Main Function
async function main() {    
    let playlists = await getPlaylists();
    console.log("Available Playlists:", playlists); // Prints the list of Playlists available
    
    // Fetch cover images for each playlist and add them to the playlist objects
    for (let i = 0; i < playlists.length; i++) {
        let covers = await getCover(playlists[i]);
        playlists[i].coverImage = covers[0] || "default-cover.jpg"; // Only use the first cover image for each playlist
    }
    
    displayPlaylists(playlists); // Display all cover images and names
    
    let mainContent = document.querySelector(".main-content");
    mainContent.innerHTML = "<p>Click on a Playlist to play songs...</p>"; // Display text when Home is clicked
    
    // Volume Control

}

main();
