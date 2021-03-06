'use strict';

let textService = require('../src/textService');
let nimeSocket  = require('../src/nimeSocket');
let sinon       = require('sinon');

describe('Text Service', () => {

  let service;
  let stubSocket;

  beforeEach(() => {
    stubSocket = sinon.createStubInstance(nimeSocket.NIMESocket);
    service    = textService.createTextService();

    service.setSocket(stubSocket);
  });

  describe('#registerKeyEvent', () => {

    let onSpy;

    beforeEach(() => onSpy = sinon.spy(service, 'on'));

    it('should register key event', () => {

      service.registerKeyEvent();

      assert.equal('filterKeyDown'          , onSpy.getCall(0).args[0]);
      assert.equal('filterKeyUp'            , onSpy.getCall(1).args[0]);
      assert.equal('onKeyDown'              , onSpy.getCall(2).args[0]);
      assert.equal('onKeyUp'                , onSpy.getCall(3).args[0]);
      assert.equal('onPreservedKey'         , onSpy.getCall(4).args[0]);
      assert.equal('onCommand'              , onSpy.getCall(5).args[0]);
      assert.equal('onCompartmentChanged'   , onSpy.getCall(6).args[0]);
      assert.equal('onKeyboardStatusChanged', onSpy.getCall(7).args[0]);
      assert.equal('onCompositionTerminated', onSpy.getCall(8).args[0]);
    });
  });

  describe('#registerLangProfileActivated', () => {

    let onSpy;

    beforeEach(() => onSpy = sinon.spy(service, 'on'));

    it('should register onLangProfileActivated event', () => {
      service.registerLangProfileActivated();

      assert.equal('onLangProfileActivated', onSpy.getCall(0).args[0]);
    });
  });

  describe('#registerLangProfileDeactivated', () => {

    let onSpy;

    beforeEach(() => onSpy = sinon.spy(service, 'on'));

    it('should register onLangProfileDeactivated event', () => {
      service.registerLangProfileDeactivated();

      assert.equal('onLangProfileDeactivated', onSpy.getCall(0).args[0]);
    });
  });

  describe('#registerDeactivate', () => {

    let onSpy;

    beforeEach(() => onSpy = sinon.spy(service, 'on'));

    it('should register onDeactivate event', () => {
      service.registerDeactivate();

      assert.equal('onDeactivate', onSpy.getCall(0).args[0]);
    });
  });

  describe('#registerEndEvent', () => {

    let onSpy;

    beforeEach(() => onSpy = sinon.spy(service, 'on'));

    it('should register end event', () => {
      service.registerEndEvent();

      assert.equal('end', onSpy.getCall(0).args[0]);
    });
  });

  describe('#handleRequest', () => {

    beforeEach(() => {
      service.onActivate();
      service.setting.guid = '{C5F37DA0-274E-4837-9B7C-9BB79FE85D9D}';
    });

    context('when LangProfileActivated with guid match', () => {
      it('should open the service', () => {
        let fakeMsg = {"seqNum": 12841, "method": "onLangProfileActivated", "guid": "{C5F37DA0-274E-4837-9B7C-9BB79FE85D9D}"}

        service.handleRequest(fakeMsg);

        assert.equal(true, service.open);
      });
    });

    context('when LangProfileActivated with guid not match', () => {
      it('should close the service', () => {
        let fakeMsg = {"seqNum": 12841, "method": "onLangProfileActivated", "guid": "{123}"}

        service.handleRequest(fakeMsg);

        assert.equal(false, service.open);
      });
    });

    context('when onActivate', () => {

      let writeSpy;

      beforeEach(() => {
        writeSpy = sinon.spy(service, 'write');
        service.handle = false;
      });

      it('should write the success response', () => {
        let fakeMsg = {"seqNum": 12841, "method": "onActivate"}

        service.handleRequest(fakeMsg);

        let testResp = {"success": true, "seqNum": 12841};

        assert.equal(true, service.handle);
        assert.deepEqual(testResp, writeSpy.getCall(0).args[0]);
      });
    });
  });
});
