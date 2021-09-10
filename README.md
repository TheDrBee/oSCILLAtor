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

### Adt
How to define and use (user defined) algebraic data types (ADTs), and how to call transitions using the JS lib with ADT arguments:

1. The [Adt smart contract](./contracts/Adt.scilla) defines and ADT `Item` which can be a shirt or a barbell. An Item has a weight (a `Uint32`). Then, an
ADT `Parcel` is defined that consists of either one or two Items. The Items must not necessarily be of the same type, so a Parcel can contain a shirt and a barbell, for example. 
Depending on the (total) weight of the contents of a Parcel (the weight of the item(s) it contains) the shipping cost is computed. Finally, the Parcel is stored 
together with its shipping cost in a list. 
This also shows application of the builtin ADT [Pair](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#pair): The list entries are `Pair {Parcel Uint32}`, i.e., pairs (parcel, shipping cost).

2. The [Script Interfacing.js](./js/Interfacing.js) shows how to call transitions that have built in and user defined ADTs as argument, i.e. how to create the 'args' in JS, see [Interfacing below](#interfacing).

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
3) the caller receives the value, stores it in its `field value` and emits an event.

Further, this examples shows the usage of `_origin` which is the user account address that initiated the transaction: Inside the `GetValue()` transition of the callee, `_origin` is not the same as `_sender`, which is the caller contract. See the event `"GetValue"` in `GetValue()`.

Script: [Callback.js](./js/Callback.js).

### Funds
How to send/receive funds (native ZIL in units of QA with 1 ZIL = 10^12 QA) to/from a smart contract:
The [Funds smart contract](./contracts/Funds.scilla) offers transitions to
- send funds to it: `Deposit()`
- withdraw an amount of funds from it: `Withdraw(amount: Uint128)`
- withdraw all funds ("empty it"): `Empty()`.

Script: [Funds.js](./js/Funds.js).

### InitParams
How to initialize a field at deployment with an init parameter given at deployment. 
The [InitParams smart contract](./contracts/InitParams.scilla) shows 
- how to initialize a list not to an empty list (`nil`) but to a list `[element, 1, 2]` where `element` is an init parameter
- how to check init parameters using `with .... =>` by checking if the given `element` is smaller then 10. If not, the deployment fails.

Script: [InitParams](./js/InitParams.js).


### Integers
The [Integer smart contract](./contracts/Integers.scilla) shows operations on integer types:
- how to compare using [IntUtils library](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#intutils)

See also 
- [InitParams smart contract](./contracts/InitParams.scilla) on how to compare integers at deployment.


### Interfacing: Special API calls from JS SDK <a id='interfacing'/>
The [Script Interfacing.js](./js/Interfacing.js) shows how to call transitions that have more complex types (even user defined ADTs) as argument (in the [Interfacing smart contract](./contracts/ADTInterfacing.scilla)):

- A user defined ADT needs to be pre-fixed with the contracts address, see the call to `transition ABTest(v: AB)`.
- A list needs to be an array of the elements, or can be constructed using `Nil` and `Cons`, similar to the way of constructing it in Scilla, see the call to `transition ListTest(list: List String)` which shows this for 2 lists of strings: ["A", "B", "C"] and ["A", "B"]
- An Option needs to be constructed using `Some` constructor and the value in `arguments`, see the call to `transition OptionTest(option: Option Uint32)` which shows this for an Option ADT holding a Uint32 value.
- A Pair needs to be constructed using the `Pair` constructor, both types in `argtypes` and the two values in `arguments`, see the call to transition `PairTest(pair: Pair Uint32 String)` which shows this for an example of a pair (1, "Hello").
 
### List
The [List smart contract](./contracts/List.scilla) shows list manipulations and use cases of the library `ListUtils`. It shows application of predicates and curried functions:
- construct a list using `Nil` and `Cons`: `Create123()`
- get element at position `n` of a list using `list_nth`(0-based indexing): `ElementAtPosition(n: Uint32)`
- remove elments from a list that equal a value applying `list_filter`, see `RemoveIfEqualTo(value: Uint32)`
- compute element wise difference between two lists (r[i] = l1[i] - l2[i] ) applying `list_zip_with`, see `Difference321Minus111()`
- compare two lists and create a list of booleans applying `list_zip_with`, see `Compare123To321()`
- apply a procedure to compute twice the value of each element and store the result in a map (m[l_i] = 2*l_i) applying `forall`, see `ComputeDoubles()`
- compute the sum of all elements in a list applying a left fold (`list_foldl`), see `SumElements112()`

See also 
- [InitParams smart contract](./contracts/InitParams.scilla) on how to initialize a list that is a field using a parameter at deployment.
- [Recursion smart contract](./contracts/Recursion.scilla) on how to build a list [m, m+1, ..., n-1] for parameters `m` and `n`.

Script: [List.js](./js/List.js).

### Nat Type 
The [NatType smart contract](./contracts/NatType.scilla) shows an example for the builtin ADT `Nat`. It implements a counter that can be increased and decreased, but is floored at 0. The 'Nat' type is an implementation of the "Peano numbers" and "Peano Axioms" that lead to the natural numbers 0, 1, 2, ...
The examples show how to 
- get the first Peano number `Zero` by initializing the `field counter` to it
- get the next Peano number using `Succ` (see `transition Increase()`)
- get the previous Peano number using `nat_prev` from `NatUtils` (note that 0 has no precessor), see `transition DecreaseFlooredAtZero()`
- get the natural number (as a `Uint32`) out of a Peano number using `nat_to_int` from `NatUtils`, see `procedure EmitCounterAsNumber()`. Compare the `field counter` in the contract's state to the `counter_value` emitted in the event!

See also the [Recursion smart contract](./contracts/Recursion.scilla) for applications of `nat_fold` to implement recursion using the `Nat` ADT.

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

### Recursion
The [Recursion smart contract](./contracts/Recursion.scilla) shows how to use recursion in Scilla. 
- create a list [m, m+1, ..., n-1] where `m` and `n` are inputs, see `transition CreateList(m : Uint32, n : Uint32)`
- compute the factorial of `n`: n! = 1 if n=0 and else n! = n*(n-1)*...*1, see `transition Factorial(n: Uint32)`

### Remote State Read
The [RemoteRead smart contract](./contracts/RemoteRead.scilla) shows how to read a field from a differnt contract deployed on the chain: The transition `ReadValueFromSetGet(.)` reads the field `value` from the smart contract [SetGet](./contracts/SetGet.scilla), see below. 

Script: [RemoteRead.js](./js/RemoteRead.js).

Note: This is currently not working throught the [IDE](https://ide.zilliqa.com/#/) as it needs to be upgraded to handle address types correctly first. It works, however, when calling the transition using the JS SDK (as in the [script](./js/RemoteRead.js)).


### SetGet
The [SetGet smart contract](./contracts/SetGet.scilla) shows how to modify a state variable through a transition, and how to emit the value of a state variable in an event.

Script: [SetGet.js](./js/SetGet.js).
