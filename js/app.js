const container = document.querySelector(".container");
const coffees = [
  {
    name: "Perspiciatis",
    image: "images/coffee1.jpg"
  },
  {
    name: "Voluptatem",
    image: "images/coffee2.jpg"
  },
  {
    name: "Explicabo",
    image: "images/coffee3.jpg"
  },
  {
    name: "Rchitecto",
    image: "images/coffee4.jpg"
  },
  {
    name: " Beatae",
    image: "images/coffee5.jpg"
  },
  {
    name: " Vitae",
    image: "images/coffee6.jpg"
  },
  {
    name: "Inventore",
    image: "images/coffee7.jpg"
  },
  {
    name: "Veritatis",
    image: "images/coffee8.jpg"
  },
  {
    name: "Accusantium",
    image: "images/coffee9.jpg"
  }
];
const showCoffees = () => {
  let output = "";
  coffees.forEach(
    ({ name, image }) =>
      (output += `
              <div class="card">
                <img class="card--avatar" src=${image} />
                <h1 class="card--title">${name}</h1>
                <a class="card--link" href="#">Taste</a>
              </div>
              `)
  );
  container.innerHTML = output;
};

document.addEventListener("DOMContentLoaded", showCoffees);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
        .register("./serviceWorker.js", { scope: "./" })
        .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}

function getUserMedia(options, successCallback, failureCallback) {
  var api = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if (api) {
    return api.bind(navigator)(options, successCallback, failureCallback);
  }
}

var theStream;
var theRecorder;
var recordedChunks = [];

function getStream() {
  if (!navigator.getUserMedia && !navigator.webkitGetUserMedia &&
      !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
    alert('User Media API not supported.');
    return;
  }

  var constraints = {video: true, audio: true};
  getUserMedia(constraints, function (stream) {
    var mediaControl = document.querySelector('video');

    if ('srcObject' in mediaControl) {
      mediaControl.srcObject = stream;
    } else if (navigator.mozGetUserMedia) {
      mediaControl.mozSrcObject = stream;
    } else {
      mediaControl.src = (window.URL || window.webkitURL).createObjectURL(stream);
    }

    theStream = stream;
    try {
      recorder = new MediaRecorder(stream, {mimeType : "video/webm"});
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      return;
    }
    theRecorder = recorder;
    console.log('MediaRecorder created');
    recorder.ondataavailable = recorderOnDataAvailable;
    recorder.start(100);
  }, function (err) {
    alert('Error: ' + err);
  });
}

function recorderOnDataAvailable(event) {
  if (event.data.size == 0) return;
  recordedChunks.push(event.data);
}

async function download() {
  console.log('video-cache');
  theRecorder.stop();
  theStream.getTracks().forEach(track => track.stop());

  var blob = new Blob(recordedChunks, {type: "video/webm"});
  var cacheName = 'video-cache';
  var url = 'cached-video.webm'; // This URL is a key for the cache entry.

  try {
    // Check if service workers and Cache API are supported.
    if ('serviceWorker' in navigator && 'caches' in window) {
      let cache = await caches.open(cacheName);
      // Here, we create a new Request object manually. The blob needs to be
      // put into the cache via a Response object, which in turn is created from a Blob.
      let response = new Response(blob);
      // Put the generated Response into the cache.
      await cache.put(url, response);
      console.log('Video cached for offline use.');
    } else {
      console.log('Service workers or Cache API not supported');
    }
  } catch (e) {
    console.error('Caching failed with error:', e);
  }
}
async function playCachedVideo() {
  var cacheName = 'video-cache';
  var url = 'cached-video.webm';

  try {
    // Check if the Cache API is available.
    if ('caches' in window) {
      let cache = await caches.open(cacheName);
      let response = await cache.match(url);

      if (response) {
        let blob = await response.blob();
        let videoURL = URL.createObjectURL(blob);

        // Now you can use videoURL as the source for a video element.
        var mediaControl = document.querySelector('video');
        mediaControl.src = videoURL;
        mediaControl.load(); // If needed
        mediaControl.play();
      } else {
        console.error('No cached video found.');
      }
    } else {
      console.error('Cache API not supported');
    }
  } catch (e) {
    console.error('Error fetching cached video:', e);
  }
}