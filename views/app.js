const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
let joinedRoom = undefined;
const socket = io("http://localhost:3000");
socket.on("connection");
geoFindMe();
const sendMessage = () => {
  const messageInput = document.querySelector("#text");
  const message = messageInput.value;
  if (message !== "") {
    messageInput.value = "";
    appendOwnMessages(document.querySelector(".messages"), message, username);

    socket.emit("message", {
      message: message,
      room_name: joinedRoom,
      nickname: username,
    });
  }
};
socket.on("message", (data) => {
  appendMessages(
    document.querySelector(".messages"),
    data["message"],
    data["nickname"]
  );
  scrollToBottom("messages");
});
socket.on("user-infovar", (data) => {
  for (let x in data) {
    if (Object.keys(data).length == 1 && Object.keys(data)[0] == username) {
      socket.emit("create", username);
      joinedRoom = username;
      break;
    } else {
      if (username == x) {
        //pass
      } else {
        if (
          getDistanceFromLatLonInKm(
            data[username][0],
            data[username][1],
            data[x][0],
            data[x][1]
          ) <= 5
        ) {
          socket.emit("create", x);
          joinedRoom = x;
          break;
        } else {
          socket.emit("create", username);
          joinedRoom = username;
          break;
        }
      }
    }
  }
});
socket.on();
function appendMessages(element, message, usernam) {
  const html = `<div class="mes-container"><div class="nametag">${usernam}</div><div class="message"><p>${message}</p></div></div>`;
  element.innerHTML += html;
}
function appendOwnMessages(element, message, username) {
  const html = `<div class="self-container"><div class="self-nametag">${username}</div><div class="self-message"><p>${message}</p></div></div>`;
  element.innerHTML += html;
}

document.getElementsByClassName("chatAnchor").onclick = function () {
  return false;
};
function geoFindMe() {
  const latLong = [];
  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    latLong.push(latitude, longitude);
    socket.emit("send-info", {
      nickname: username,
      cords: [latitude, longitude],
    });
  }
  function error() {
    return "Unable to retrieve your location";
  }
  if (!navigator.geolocation) {
    return "Geolocation is not supported by your browser";
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // degree to radian
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function scrollToBottom(id) {
  var div = document.getElementById(id);
  div.scrollTop = div.scrollHeight - div.clientHeight;
}

var input = document.getElementById("text");
input.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    event.preventDefault();
    document.getElementById("myBtn").click();
  }
});
