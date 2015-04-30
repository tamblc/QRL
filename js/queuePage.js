//---------------------------------
// Functions

// Load YouTube Frame API & SoundCloud API & Google API & Vimeo API
(function(){ //Closure, to not leak to the scope
    var ytapi = document.createElement("script");
    var scapi = document.createElement("script");
    var ggapi = document.createElement("script");
    var vimeoapi = document.createElement("script");
    ggapi.src = "https://apis.google.com/js/client.js?onload=ginit";     /* Load GG API*/
    ytapi.src = "https://www.youtube.com/player_api";       /* Load YT API*/
    scapi.src = "https://connect.soundcloud.com/sdk.js";   /* Load SC API*/
    vimeoapi.src = "https://player.vimeo.com/video/VIDEO_ID?api=1"; 
    var before = document.getElementsByTagName("script")[0];
    before.parentNode.insertBefore(ytapi, before);
    before.parentNode.insertBefore(scapi, before);
    before.parentNode.insertBefore(ggapi, before);
    before.parentNode.insertBefore(vimeoapi, before);

})();

function ginit() {
    gapi.client.setApiKey("AIzaSyBwtrpyD5Bfxcohb6aDpwfhHK-040pEczc");
    gapi.client.load("youtube", "v3");
    console.log("Google API key set");
    scinit();
}
function scinit() {
    SC.initialize({client_id: "ec98e7fd2d4b6d79f0c30808836e1b87"});
    console.log("Soundcloud API loaded");  
    vimeoinit();  
}
function vimeoinit(){
    console.log("Vimeo API loaded");
}

//Loads the Youtube player when it's ready
function onYouTubePlayerAPIReady() {
    console.log("Youtube API Done!");
    makeVideo();
}

//Plays video when the player is loaded
function onPlayerReady(event) {
    if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
        handleSoundcloud(queueObj.cur_index);
    }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
        handleVimeo(queueObj.cur_index);
    }else if(queueObj.queue[queueObj.cur_index].domain === "youtube") {
        event.target.playVideo();
    }
}

//Prints the current queue, for debugging
function printQueue(queue){
    console.log("Printing Queue \n");
    for(var i = 0; i < queue.length; i++){
        console.log(queue[i].url + "\n");
    }
}

function soundcloudTrackID(url){
    
}

function embedSoundcloud(track){
    SC.oEmbed("http://soundcloud.com/forss/flickermood", {auto_play: true}, function(response){
        console.log(response)});
}

function handleSoundcloud(index){
    hidePlayers();

    var scPlayer = document.getElementById("soundcloudPlayer");
    scPlayer.style.display = "";

}

function handleVimeo(index){
    alert("Sorry, we're working on playing Vimeo content!");
    skipTo(index+1);
}

function skipTo(index){
    if(queueObj.queue[index].domain === "youtube"){
        queueObj.write('cur_index', index);
        youtubePlayer.videoId = queueObj.queue[index].videoID;
        youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
        populateQueue();
    }else if(queueObj.queue[index].domain === "soundcloud"){
        handleSoundcloud(index);
    }else if(queueObj.queue[index].domain === "vimeo"){
        handleVimeo(index);
    }
}

function remove(index){
    if(index >= queueObj.length){
        console.log("ERR: remove("+index+") - index out of bounds");
        return;
    }
    if(index == queueObj.cur_index){
        skipTo(index+1);
        queueObj.queue.splice(index, 1);
    }else{
        queueObj.queue.splice(index, 1);
        populateQueue();    
    }
}

function hidePlayers(){
    var ytPlayer = document.getElementById("youtubePlayer");
    var scPlayer = document.getElementById("soundcloudPlayer");
    var vmPlayer = document.getElementById("vimeoPlayer");


    console.log("Hiding elements!");
    ytPlayer.style.display = "None";
    scPlayer.style.display = "None";
    vmPlayer.style.display = "None";

}

//Helper function to make videos. Only runs after it's been called twice
function makeVideo(){

    var ytPlayer = document.getElementById("youtubePlayer");
    ytPlayer.style.display = "";

    populateQueue();
    youtubePlayer = new YT.Player('youtubePlayer', {
        videoId: queueObj.queue[queueObj.cur_index].videoID,
        height: '100%',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

//Populates the html for the Queue on the page
function populateQueue(){
    printQueue(queueObj.queue);
    var Document = "";
    for(var x = queueObj.cur_index; x < queueObj.queue.length; x++){
        var queueClass = "thumbnail";
        if(queueObj.queue[x].domain === "youtube"){
            console.log('Adding ' + x);
            Document = Document + 
            "<img id=\"" + x + "\" class=\"" +
            queueClass + "\" ondblclick=\"remove("+x+")\" src=\"https://img.youtube.com/vi/" + queueObj.queue[x].videoID + "/0.jpg\" /><br>";
        }else if(queueObj.queue[x].domain === "soundcloud"){
                        Document = Document + 
            "<img id=\"" + x + "\" class=\"" +
            queueClass + "\" ondblclick=\"remove("+x+")\" src=\"http://africaninamerica.org/wp-content/uploads/2014/04/soundcloud-logo-transparent.png\" /><br>";
        }else if(queueObj.queue[x].domain === "vimeo"){
            //TODO: Get thumbnails for vimeo content
        }
    }
    document.getElementById("queue").innerHTML = Document;
}

//---------------------------------
// Listeners

//Listens for the queue to be sent over
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(queueObj.queue === undefined){
            queueObj.write('queue', []);
            queueObj.write('cur_index', 0);
        }else if(request.queueContent === null){
            console.log("blank queue content");
            console.log(queueObj.queue.length);
            if(queueObj.queue.length == 0 || queueObj.cur_index == queueObj.queue.length){
                console.log("set blank");
                blank = true;
                return;
            }else{
                populateQueue();
                makeVideo();
                return;
            }
        }
        if(request.addNext){
            queueObj.queue.splice(queueObj.cur_index+1, 0, request.queueContent);
        }else{
            queueObj.queue.push(request.queueContent);
        }
        populateQueue();
        if(request.newTab || blank){
            blank = false;
            makeVideo();
        }
});

//listener for clear
document.getElementById("clear").addEventListener("click", function(){
    if (confirm("Are you sure you want to clear the queue? (This is permanent)")) {
    queueObj.write('queue', []);
    queueObj.write('cur_index', 0);
    console.log("Queue has been cleared.");
    chrome.tabs.getCurrent(function(tab){
        chrome.tabs.remove(tab.id);
    });}
});

//listener for skip
document.getElementById("skip").addEventListener("click", function(){
    //load new video ID
    if (queueObj.cur_index+1 == queueObj.queue.length) {
        queueObj.write('cur_index', ++queueObj.cur_index);
        console.log("Last item in queue");
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.remove(tab.id);
    });
    } else {
        if(queueObj.queue[queueObj.cur_index].domain !== "youtube"){
            hidePlayers();
            makeVideo();
        }
        queueObj.write('cur_index', ++queueObj.cur_index);
        populateQueue();
        if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
            handleSoundcloud(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
            handleVimeo(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "youtube") {
            youtubePlayer.videoId = queueObj.queue[queueObj.cur_index].videoID;
            youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
        }
    }
});

//---------------------------------
// Main
var youtubePlayer;
var halt = true;
var blank;
hidePlayers();
var queueObj = Rhaboo.persistent('queueObj');
if(queueObj.cur_index === undefined){
    queueObj.write('cur_index', 0);
}

//Runs when video state changes, handles videos ending
function onPlayerStateChange(event) {  
    console.log("playerStateChange = " + event.data);
    if(event.data === YT.PlayerState.ENDED) { 
        console.log("Video over, new video being loaded");
        //load new video ID
        if(queueObj.cur_index+1 == queueObj.queue.length)
        {
           console.log("Reached end of queue playback");
           queueObj.write('cur_index', ++queueObj.cur_index);
           return;
        }
        queueObj.write('cur_index', ++queueObj.cur_index);     
        populateQueue();
        if(queueObj.queue[queueObj.cur_index].domain === "soundcloud") {
            handleSoundcloud(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "vimeo") {
            handleVimeo(queueObj.cur_index);
        }else if(queueObj.queue[queueObj.cur_index].domain === "youtube"){
            console.log("Current videoId is: " + youtubePlayer.videoId + " (if undefined, the player object isn't accessible by onPlayerStateChange)");  
            youtubePlayer.videoId = queueObj.queue[queueObj.cur_index].videoID;
            console.log(youtubePlayer.videoId);
            console.log("Loading video by ID");
            youtubePlayer.loadVideoById(youtubePlayer.videoId, 0, "large");
        }
    }
}