// subscribe to oracle events, write time stamp upon event arrival

'use strict';
var assert = require('assert');
const fs = require('fs');

const { BN } = require('@zilliqa-js/util');

const { StatusType, MessageType } = require('@zilliqa-js/subscriptions');
const { getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');

const utils = require('./utils.js');

async function start()
{
  try {

    const cfg_json = utils.read_yaml_to_json('./config.yaml');
    const address_json = utils.read_yaml_to_json(`./${cfg_json.files.addresses}`);

    const secrets_json = utils.read_yaml_to_json('./secrets.yaml');
    const keys = secrets_json; // private key(s)
    const ch = utils.chain(); // block chain info

    // load oracle contract from chain
    const oracle_addr = address_json.UnixTimeOracle.toLowerCase();
    const oracle = ch.zilliqa.contracts.at(oracle_addr);
    console.log(` .. will work with oracle @ ${oracle.address}`);

    // get key of caller (account to write data to oracle) and add to wallet
    const caller_priv_key = keys.deployer;
    ch.zilliqa.wallet.addByPrivateKey(caller_priv_key);
    const caller_pub_key = getPubKeyFromPrivateKey(caller_priv_key);

    // subscribe to events on contract
    const subscriber = ch.zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
      ch.websocket,
      { addresses: [ oracle_addr ], },
    );

    subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, (event) => {
      // if successful, echo the subscription info
      console.log('get SubscribeEventLog echo : ', event);
    });

    const target_event_name = 'GetUnixTime';
    const transition_name = 'SetUnixTime';

    // listen to events with target _eventname, get unix time stamp, write to oracle contract
    subscriber.emitter.on(MessageType.EVENT_LOG, (event) => {
      console.log('get new event log: ', JSON.stringify(event));
      // check event is the one we want, if so, get unix time and send to oracle contract

      if(event.hasOwnProperty("value")){
        const log = event.value[0].event_logs[0];
        if(log._eventname===target_event_name){
          const requestor = log.params[0].value;
          const request_id = log.params[1].value;
          console.log(` -> event with _eventname = ${target_event_name} received from ${requestor} with request id = ${request_id}!`);
          const uxt = Math.floor(Date.now() / 1000); // current unix time in seconds (not ms) since jan 01 1970 (UTC)
          console.log(` .. current unix time stamp [s]: ${uxt}`);

          // call oracle's setter transition
          oracle.call(
            transition_name,
            [
              { vname: 'uxt', type: 'Uint64', value: uxt.toString() },
              { vname: 'request_id', type: 'Uint32', value: request_id.toString() }
            ],
            {
              version: ch.VERSION, amount: new BN('0'), gasPrice: ch.txp.price, gasLimit: ch.txp.limit,
              pubKey: caller_pub_key
            },
            ch.txp.attempts,
            ch.txp.timeout,
            false
          )
          .then( (tx) => {
            // check the call worked
            if (tx.receipt==null || !tx.receipt.success)
            {
              console.log('tx failure: LOG of tx')
              console.log(tx);
              if (tx.receipt != null)
              {
                console.log(' LOGS of tx.receipt, tx.receipt.errors and tx.receipt.exceptions')
                console.log(tx.receipt);
                console.log(tx.receipt.errors);
                console.log(tx.receipt.exceptions);
              }
              else {
                console.log('tx.receipt is null or undefined')
              }
              throw Error('call to oracle failed');
            }
            else {
              console.log(` ==> Success of request with id ${request_id}: uxt = ${uxt} written to oracle @ ${oracle_addr} and sent to callback of ${requestor}`);
            }
          });
        }
      }
    });

    await subscriber.start();

  } catch (e) {
      console.log(e);
  }
}

start();
