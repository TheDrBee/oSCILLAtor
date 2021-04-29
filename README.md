# scilla examples

Exampes and Snippets of the [scilla programming language](https://scilla.readthedocs.io/en/latest/).

Contracts are all in folder `contracts/`. 

Scripts using the [Zilliqa JS lib](https://github.com/Zilliqa/Zilliqa-JavaScript-Library) that deploy the contracts and interact with them through their transitions are in folder `js/`. They are run in that directory using: `node <ScriptName.js>`.

## Callback
How to send a message to another smart contract and get a result back:
[The caller](./contracts/Caller.scilla) calls [the callee](./contracts/Callee.scilla) to retrieve a value:
1) caller sends msg to callee's transition `get_value` in its transition `call_for_value()`.
2) callee sends msg to caller's callback: transition `value_callback(v : Uint128)` with `v` the value stored in its `field value`.
3) the caller receive the value, stores it in its `field value` and emits an event.

Script: [Callback.js](./js/Callback.js). 

## Funds
How to send/receive funds (native ZIL in units of QA with 1 ZIL = 10^12 QA) to/from a smart contract:
[The Funds](./contracts/Funds.scilla) has transitions to
- send funds to it: `deposit()`
- withdraw an amount of funds from it: `withdraw(amount: Uint128)`
- withdraw all funds ("empty it"): `empty()`.

Script: [Funds.js](./js/Funds.js).

## List
The [List smart contract](./contracts/List.scilla) shows list manipulations and use cases of the library `ListUtils`
- construct a list using `Nil` and `Cons`
- remove elments from a list that equal a value, showing the application of a predicate and a curried function

Script: [List.js](./js/List.js).

## Ownership
The [Ownership smart contract](./contracts/Ownership.scilla) shows how a smart contract can have an owner, and how to check if the caller of a transition (the `_sender` of the transaction) is the owner.

Script: [Ownership.js](./js/Ownership.js).

## SetGet
The [SetGet smart contract](./contracts/SetGet.scilla) shows how to modify a state variable through a transition, and how to emit the value of a state variable in an event.

Script: [SetGet.js](./js/SetGet.js).
