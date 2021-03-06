'use strict';

let EventEmitter = require('events');
let LOG          = require('./util/logger');

const SUCCESS          = 0;
const ERROR_MORE_DATA  = 234;
const ERROR_IO_PENDING = 997;


class NIMESocket extends EventEmitter {

  constructor(ref, pipe, server, service) {
    super();
    this.ref     = ref;
    this.data    = "";
    this.msg     = {};
    this.pipe    = pipe;
    this.server  = server;
    this.service = service;
  }

  read() {
    LOG.info('Wait data');
    this.pipe.read(this.ref, (err, data) => {

      switch (err) {

        case SUCCESS:
          this.data += data;
          this.msg = JSON.parse(this.data);
          this.data = "";

          this.emit('data', this.msg);
          this.service.handleRequest(this.msg);
          this.read();
          break;

        case ERROR_MORE_DATA:
          this.data += data;
          this.read();
          break;

        case ERROR_IO_PENDING:
          this.read();
          break;

        default:
          LOG.info('Socket broken');
          this.close();
      }
    });
  }

  write(response) {
    LOG.info(`Write Data: ${JSON.stringify(response)}`);
    this.pipe.write(this.ref, response, (err, len) => {
      this.emit('drain', len);
    });
  }

  close() {
    this.pipe.close(this.ref, (err) => {

      this.service = null;
      this.emit('end', err);
      this.server.deleteConnection(this);
    });
  }
}


module.exports = {
  createSocket(ref, pipe, server, service) {
    return new NIMESocket(ref, pipe, server, service);
  },
  NIMESocket
};
