# oSCILLAtor

## Overview
Exampes and Snippets of the [scilla programming language](https://scilla.readthedocs.io/en/latest/).

Contracts are all in folder `contracts/`.

Scripts using the [Zilliqa JS lib](https://github.com/Zilliqa/Zilliqa-JavaScript-Library) that deploy the contracts and interact with them through their transitions are in folder `js/`. They are run in that directory using: `node <ScriptName.js>`.

## Installation
```bash
yarn  # install Zilliqa JS and required dependencies
```
In order to run the JS scripts install [ceres](https://github.com/Zilliqa/ceres/releases) (needs docker), and start the "Isolated server".

## Examples


### AdtMap
How to create a map storing user defined algebraic data types (ADTs):
The [AdtMap smart contract](./contracts/AdtMap.scilla) defines an ADT `Player` which consists of the age and a sport, either Tennis or Run. It has transitions to
- add a Tennis player of a certain age
- add a Runner of a certain age
- change the age of a previously added player (leaving the Sport unchanged)
- remove a previously added player.

Players are indexed by the caller's address (`_sender`).

Note that adding a Player more than once from the same account overwrites a previous entry of this account's address (uniqueness).

Script: [AdtMap.js](./js/AdtMap.js).

### Callback
How to send a message to another smart contract and get a result back:
The [Caller smart contract](./contracts/Caller.scilla) calls The [Callee smart contract](./contracts/Callee.scilla) to retrieve a value:
1) caller sends msg to callee's transition `GetValue` in its transition `CallForValue()`.
2) callee sends msg to caller's callback: transition `ValueCallback(v : Uint128)` with `v` the value stored in its `field value`.
3) the caller receive the value, stores it in its `field value` and emits an event.

Script: [Callback.js](./js/Callback.js).

### Funds
How to send/receive funds (native ZIL in units of QA with 1 ZIL = 10^12 QA) to/from a smart contract:
The [Funds smart contract](./contracts/Funds.scilla) offers transitions to
- send funds to it: `Deposit()`
- withdraw an amount of funds from it: `Withdraw(amount: Uint128)`
- withdraw all funds ("empty it"): `Empty()`.

Script: [Funds.js](./js/Funds.js).

### List
The [List smart contract](./contracts/List.scilla) shows list manipulations and use cases of the library `ListUtils`. It shows application of predicates and curried functions:
- construct a list using `Nil` and `Cons`: `Create123()`
- remove elments from a list that equal a value applying `list_filter`, see `RemoveIfEqualTo(value: Uint32)`
- compare two lists and create a list of booleans applying `list_zip_with`, see `Compare123To321()`

Script: [List.js](./js/List.js).

### Option Type
The [Option smart contract](./contracts/Option.scilla) shows how to
- create the empty option type using `None` constructor
- create an optional Uint32 value using `Some` constructor
- extract the value from the option
- do different things depending on whether the value in the option is set or not.

Script: [Option.js](./js/Option.js).

### Ownership
The [Ownership smart contract](./contracts/Ownership.scilla) shows how a smart contract can have an owner, and how to check if the caller of a transition (the `_sender` of the transaction) is the owner.

Script: [Ownership.js](./js/Ownership.js).

### SetGet
The [SetGet smart contract](./contracts/SetGet.scilla) shows how to modify a state variable through a transition, and how to emit the value of a state variable in an event.

Script: [SetGet.js](./js/SetGet.js).
