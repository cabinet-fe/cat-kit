onmessage = function(e) {

  postMessage({
    event: 'end',
    data: e.data.reduce((acc, cur) => acc + cur)
  })
}