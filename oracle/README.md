# Oracle Example
This is an example of a simple oracle that can be used to get the current [unix timestamp](https://en.wikipedia.org/wiki/Unix_time) on to the Zilliqa blockchain. The current unix time stamp can be seen [here](https://www.unixtimestamp.com/), and it can also be received directly in JS (using `Date.now()` which gives it in ms since Jan 01 1970 UTC). The example uses the unix time in seconds from JS (but can easily be changed to get it from an api), and it runs on testnet.

## Note / Warning
The implementation here is kept simple to show the main concepts but it is __not__ safe: Any account can call the transition to update data on the oracle. Namely, not just an *authorized* account in the listener but also a potentially malicious caller (with, e.g., a wrong time stamp).

## Overview
### Contracts
- [UnixTimeOracle](./UnixTimeOracle.scilla) is the oracle contract. It has transitions to
  - Request a unix time stamp: `transition GetUnixTime()`. A client contract will call this transition to receive the latest unix time stamp. If called, it stores the request under an id and emits an event with `_eventname: GetUnixTime` and having the paramters `from` (who requested this) and the `request_id`.
  - Set unix time and fullfill the request: `transition SetUnixTime(uxt: Uint64, request_id: Uint32)`. It checks if the unix time can be valid and ensures it is not older than a previous time stamp received. If valid, it calls the callback of the requesting contract (identified throught the `request_id`) with the current time stamp: `transition UnixTimeCallback(unix_time: Uint64)`.
- [OracleClient](./OracleClient.scilla) is the client contract to request a unix time stamp (off chain data) from the above oracle contract whose address is one of its deployment parameters (immutable or `init` variables). It has transitions to:
  - Request a time stamp: `transition Request()` which calls the oracle contract's transition `GetUnixTime()`. This starts the on-chain call graph.
  - Receive the unix time stamp from the oracle in a callback: `transition UnixTimeCallback(unix_time: Uint64)` which finishes the call graph.

### Scripts
- [deploy.js](./deploy.js) to deploy both contracts on testnet and store their addresses in an [address file](./addresses.yaml).
- [listener.js](./listener.js) subscibes to the [oracle contracts](./UnixTimeOracle.scilla) (websocket) and listens to its events. It gets the address of the oracle contract to subscribe to from the [address file](./addresses.yaml). If an event to get a unix time stamp is received the current unix time is computed (off-chain) and the oracle contract's transition `SetUnixTime(.)` is called.

## How To

### Pre
You need to add a secrets file with private keys for the account to deploy the contracts (`deployer`) and for the account to write to the oracle contract by calling a transition on it (`oracle_caller`). The file has to be called "secrets.yaml", be placed in the `oracle\` sub directory, and it must have the two entries as follows:
```{yaml}
deployer: 5a08d91...216e
oracle_caller: 5a08d91....a1216e
```
Replace the '5a08...216e' above with your private testnet keys. `deployer` and `oracle_caller` can be the same account, or two different ones. Hence, the file will contain one or two private keys of testnet account(s) that own some testnet ZIL.

### Deployment
`$ node deploy`

This deploys both contracts on testnet and writes the addresses of the contracts to the [address file](./addresses.yaml).

### Use and Test
We use the [IDE](https://ide.zilliqa.com/#/) to trigger the process.
- load the [client contract](./OracleClient.scilla) in the IDE (testnet) with the address found under key `OracleClient` in [addresses.yaml](./addresses.yaml)
- start the [listener](./listener.js) with `$ node listener`
- in the IDE trigger the client contracts `Request` with any of your accounts
- observe the logs of the listener node process and as soon as you see a log similar to` ==> Success: uxt = 1657792495 written to oracle @ 0x... and sent to callback of 0x...` you can check the state of the client contract and find the time stamp in the `field uxt: Uint64`

### Pre-deployed contracts
To start immediately without deploying your own contracts you can use the contracts deployed on testnet on the following addresses:
```{yaml}
UnixTimeOracle: '0x70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8'
OracleClient: '0x262edaf09efb97abf69474ae56485fb46dab86ee'
```

### Sample output
```
$ node listener.js 
 .. will work with oracle @ 0x70b5025C9c7E1D07E0F472C9B19D4382F5FBF2a8
get SubscribeEventLog echo :  {
  query: 'EventLog',
  addresses: [ '0x70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8' ]
}
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog","value":[{"address":"70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8","event_logs":[{"_eventname":"GetUnixTime","params":[{"type":"ByStr20","value":"0x262edaf09efb97abf69474ae56485fb46dab86ee","vname":"from"},{"type":"Uint32","value":"0","vname":"request_id"}]}]}]}
 -> event with _eventname = GetUnixTime received from 0x262edaf09efb97abf69474ae56485fb46dab86ee with request id = 0!
 .. current unix time stamp [s]: 1657795799
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog","value":[{"address":"70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8","event_logs":[{"_eventname":"SetUnixTime","params":[{"type":"Uint64","value":"1657795799","vname":"unix_time"}]}]}]}
 ==> Success of request with id 0: uxt = 1657795799 written to oracle @ 0x70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8 and sent to callback of 0x262edaf09efb97abf69474ae56485fb46dab86ee
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog","value":[{"address":"70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8","event_logs":[{"_eventname":"GetUnixTime","params":[{"type":"ByStr20","value":"0x262edaf09efb97abf69474ae56485fb46dab86ee","vname":"from"},{"type":"Uint32","value":"1","vname":"request_id"}]}]}]}
 -> event with _eventname = GetUnixTime received from 0x262edaf09efb97abf69474ae56485fb46dab86ee with request id = 1!
 .. current unix time stamp [s]: 1657796498
get new event log:  {"query":"EventLog"}
get new event log:  {"query":"EventLog","value":[{"address":"70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8","event_logs":[{"_eventname":"SetUnixTime","params":[{"type":"Uint64","value":"1657796498","vname":"unix_time"}]}]}]}
 ==> Success of request with id 1: uxt = 1657796498 written to oracle @ 0x70b5025c9c7e1d07e0f472c9b19d4382f5fbf2a8 and sent to callback of 0x262edaf09efb97abf69474ae56485fb46dab86ee
get new event log:  {"query":"EventLog"}
...
```
