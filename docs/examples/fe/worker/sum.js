
onmessage = function(e) {
  postMessage(e.data.reduce((acc, cur) => acc + cur))
}



