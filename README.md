# scilla examples

Exampes and Snippets of the [scilla programming language](https://scilla.readthedocs.io/en/latest/) 

## Callback
How to send a message to another smart contract and get a result back:
[The caller](./contracts/Caller.scilla) calls [the callee](./contracts/Callee.scilla) to retrieve a value:
1) caller sends msg to callee's transition `get_value` in its transition `call_for_value()`.
2) callee sends msg to caller's callback: transition `value_callback(v : Uint128)` with `v` the value stored in its `field value`.
3) the caller receive the value, stores it in its `field value` and emits an event.

## List
The [List smart contract](./contracts/List.scilla) shows list manipulations and use cases of the library `ListUtils`
- construct a list using `Nil` and `Cons`
- remove elments from a list that equal a value, showing the application of a predicate and a curried function


## Ownership
The [Ownership smart contract](./contracts/Ownership.scilla) shows how a smart contract can have an owner, and how to check if the caller of a transition (the `_sender` of the transaction) is the owner.

## SetGet
Simple [SetGet smart contract](./contracts/SetGet.scilla) showing how to modify a state variable through a transition, and how to emit the value of a state variable in an event.

