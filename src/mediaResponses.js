const fs = require('fs');
const path = require('path');

const loadFile = (request, response, fileName, fileType) => {
  const file = path.resolve(__dirname, fileName);
  // provides stats about the file
  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let {
      range,
    } = request.headers;
    // if not, assume starting at beginning of file
    if (!range) {
      range = 'bytes=0-';
    }

    // split/parse the range header
    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);
    // total file size in bytes
    const total = stats.size;
    // check if there's an end position from the client
    // if not, set to the end of the file
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (start > end) {
      start = end - 1;
    }

    // determine how big of a chunk we are sending back to browser
    const chunksize = (end - start) + 1;
    response.writeHead(206, {
      // how much we are sending out of the total
      'Content-Range': `bytes ${start}-${end}/${total}`,
      // what type of data to expect the range in. only options are 'bytes' and 'none'
      'Accept-Ranges': 'bytes',
      // how big the chunk is in bytes
      'Content-Length': chunksize,
      // browser encoding type so reassambling byte goes smoothly
      'Content-Type': fileType,
    });

    // create a file stream
    const stream = fs.createReadStream(file, {
      start,
      end,
    });
    stream.on('open', () => {
      stream.pipe(response);
    });
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });
    return stream;
  });
};

const getParty = (request, response) => {
  loadFile(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;
