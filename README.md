# oSCILLAtor

## Overview
Examples and Snippets of the [scilla programming language](https://scilla.readthedocs.io/en/latest/) and the [Zilliqa JS lib](https://github.com/Zilliqa/Zilliqa-JavaScript-Library).

Contracts are all in folder `contracts/`. The subdirectory `templates` containts scilla contracts that are "ready to use" implementations of best practices (see [Templates](#templates)).

Scripts using the [Zilliqa JS lib](https://github.com/Zilliqa/Zilliqa-JavaScript-Library) that deploy the contracts and interact with them through their transitions are in folder `js/`. They are run in that directory using: `node <ScriptName.js>`.

We also collect some tipps and tricks for using the IDE [here](./IDE-HINTS.md).

## Installation
```bash
yarn  # install Zilliqa JS and required dependencies
```
In order to run the JS scripts install [ceres](https://github.com/Zilliqa/ceres/releases) (needs docker), and start the "Isolated server".

## Templates 
Ready-to-use implementations to start building.

### Ownership Template

The [OwnershipTemplate smart contract](./contracts/templates/OwnershipTemplate.scilla) implemenents the concept of (single) ownership: a special account (address) is "owning" the contract. It can be used to limit (or exclude) access to certain transitions to this account only. It implements the best practice for a safe transfer of ownership, ie. change to a new owner (see [Scilla Documentation](https://scilla.readthedocs.io/en/latest/scilla-tips-and-tricks.html#transfer-contract-ownership)):

  1. The current owner proposes (stages) a new owner: `transition RequestOwnershipTransfer(new_owner : ByStr20)`

  2. The proposed new owner accepts the owner ship: `transition ConfirmOwnershipTransfer()`

Furthermore, the owner can also cancel a pending ownership transfer: `transition CancelOwnershipTransfer()`


## Examples 

### Adt
How to define and use (user defined) algebraic data types (ADTs), and how to call transitions using the JS lib with ADT arguments:

1. The [Adt smart contract](./contracts/Adt.scilla) defines and ADT `Item` which can be a shirt or a barbell. An Item has a weight (a `Uint32`). Then, an
ADT `Parcel` is defined that consists of either one or two Items. The Items must not necessarily be of the same type, so a Parcel can contain a shirt and a barbell, for example.
Depending on the (total) weight of the contents of a Parcel (the weight of the item(s) it contains) the shipping cost is computed. Finally, the Parcel is stored
together with its shipping cost in a list.
This also shows application of the builtin ADT [Pair](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#pair): The list entries are `Pair {Parcel Uint32}`, i.e., pairs (parcel, shipping cost).

2. The [Script Interfacing.js](./js/Interfacing.js) shows how to call transitions that have built in and user defined ADTs as argument, i.e. how to create the 'args' in JS, see [Interfacing below](#interfacing).

See also the [AdtMap smart contract](./contracts/AdtMap.scilla) for another example of a user defined ADT.

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

Various functions that show how to use the JS lib to transfer funds (native ZIL in units of QA with 1 ZIL = 10^12 QA), see the
script [Funds.js](./js/Funds.js).

1) Check balances
How to check the balance of an address and convert the units ('QA') to ZIL (using `units.fromQA(.`)), see the function `chk_zil_balances()`.

2) Between (user) accounts
How to send funds between two addresses using a 'Transaction'. This is particularly useful to transfer funds between user accounts, see the `function funds_transfer_between_accounts()`.

3) To and From Contract
How to send/receive funds to/from a smart contract: The [Funds smart contract](./contracts/Funds.scilla) offers transitions to

   - send funds to it: `Deposit()`
   - withdraw an amount of funds from it: `Withdraw(amount: Uint128)`
   - withdraw all funds ("empty it"): `Empty()`.

    See the function `funds_to_and_from_contract()`.



### InitParams
How to initialize a field at deployment with an init parameter given at deployment.
The [InitParams smart contract](./contracts/InitParams.scilla) shows
- how to initialize

  i) a simple number with a parameter given at deployment, and

  ii) a list not to an empty list (`nil`) but to a list `[element, 1, 2]` where `element` is an init parameter
- how to check init parameters using `with .... =>` by checking if the given `element` is smaller then 10, and if an `Int32 number` is positive. If not, the deployment fails.

Script: [InitParams.js](./js/InitParams.js).


### Integers
The [Integer smart contract](./contracts/Integers.scilla) shows operations on integer types:
- how to compare using [IntUtils library](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#intutils)

See also
- [InitParams smart contract](./contracts/InitParams.scilla) on how to compare integers at deployment.


### Interfacing: Special API calls from JS SDK <a id='interfacing'/>
The [Script Interfacing.js](./js/Interfacing.js) shows how to call transitions that have more complex types (even user defined ADTs) as argument (in the [Interfacing smart contract](./contracts/Interfacing.scilla)):

- A Bool needs to be constructed using the `True` or `False` constructor (with empty `arguments`), see the call to transition `BoolTest(bool: Bool)` which shows this for `True`.

- An Option needs to be constructed using `Some` constructor and the value in `arguments`, see the call to `transition OptionTest(option: Option Uint32)` which shows this for an Option ADT holding a Uint32 value.

- A Pair needs to be constructed using the `Pair` constructor, both types in `argtypes` and the two values in `arguments`, see the call to transition `PairTest(pair: Pair Uint32 String)` which shows this for an example of a pair (1, "Hello").

- A list needs to be an array of the elements, or can be constructed using `Nil` and `Cons`, similar to the way of constructing it in Scilla, see the call to `transition ListTest(list: List String)` which shows this for 2 lists of strings: ["A", "B", "C"] and ["A", "B"]. We also show how to construct the arguments to call a transition that has an argument that is a list of pairs, i.e., [(1,"Hello"), (2, "ByeBye")], see the call to `transition ListOfPairsTest`.

- The `type` of a user defined ADT needs to be pre-fixed with the contracts address, see the calls to `transition ABTest(v: AB)` and `transition Point3DTest(p: Point3D)`.
The `value` entry of the argument needs the 3 entries `constructor`, `argtypes` and `arguments`. See the call to `ABTest(v: AB)` for an example where only the `constructor` is non-empty, and the call to `Point3DTest(p: Point3D)` for an example where the 3 arguments represent the 3 (integer) coordinates.


### List
The [List smart contract](./contracts/List.scilla) shows list manipulations and use cases of the library `ListUtils`. It shows application of predicates and curried functions:
- construct a list using `Nil` and `Cons`: `Create123()`
- get element at position `n` of a list using `list_nth`(0-based indexing): `ElementAtPosition(n: Uint32)`
- remove elments from a list that equal a value applying `list_filter`, see `RemoveIfEqualTo(value: Uint32)`
- compute element wise difference between two lists (r[i] = l1[i] - l2[i] ) applying `list_zip_with`, see `Difference321Minus111()`
- compare two lists and create a list of booleans applying `list_zip_with`, see `Compare123To321()`
- apply a procedure to compute twice the value of each element and store the result in a map (m[l_i] = 2*l_i) applying `forall`, see `ComputeDoubles()`
- compute the sum of all elements in a list applying a left fold (`list_foldl`), see `SumElements112()`
- check if two lists are disjunct, i.e. have no common element(s): This applies `list_forall` twice, by checking for each element in the first list if it is different to all values in a second list, see `are_lists_disjunct` and the transition `AreListsDisjunct()` which tests this for a few lists.
- count the number of occurences of a value in a list: This applies a left fold `list_foldl` to a list where the accumulator is increased by one if an element of the list matches a given value (and remains equal if not). See `count_in_list` and the tranition `Count(.)` which tests this by counting how many 1's there are in a few lists.
- check if a list is "unique" in the sense that each element of it is unique (i.e., it's only once in the list). This applies above `count_in_list` using a `list_for_all` to each element of the same list (and checks the result of each count against 1). See `is_unique` and the transition `CheckUniqueness` which tests this for a few lists.


See also
- [InitParams smart contract](./contracts/InitParams.scilla) on how to initialize a list that is a field using a parameter at deployment.
- [Recursion smart contract](./contracts/Recursion.scilla) on how to build a list [m, m+1, ..., n-1] for parameters `m` and `n`.
- [AMap smart contract](./contracts/AMap.scilla) on how to use `@list_foldl` to sum up elements in a list.

Script: [List.js](./js/List.js).

### Map
The [AMap smart contract](./contracts/AMap.scilla) shows operations that are less known on `Map' type.
- How to work with a map that is not a field by using [Functional Map Operations](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#functional-map-operations) to build it using `builtin put`
- How to convert a `Map` to a `List` of key-value-pairs and then use list operations. The example shows how to sum all the integer type keys of a map, see the `transition SumOfKeys()`.

Script: [AMap.js](./js/AMap.js).


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
The [Ownership smart contract](./contracts/Ownership.scilla) shows how a smart contract can have an owner, and how to check if the caller of a transition (the `_origin` of the transaction) is the owner.

It shows three ways of how to change the owner of the contract:

- `transition ChangeOwner(new_owner : ByStr20)`: here everybody can change the owner to any address, which is very dangerous and **should not be done**
- `transition ChangeOwnerByOwnerOnly(new_owner : ByStr20)`: here only the onwer can change the ownership. This is better, yet **still problematic** as the `new_owner` might be wrong (a typo is enough...), and thus the contract will have either a wrong owner, or even worse a non-existing owner.
- The suggested way of transfering ownership, see [Scilla Documentation](https://scilla.readthedocs.io/en/latest/scilla-tips-and-tricks.html#transfer-contract-ownership) -- **use this in practice**, see the 'Ownership Template' in [Templates](#templates):

  1. The current owner proposes (stages) a new owner: `transition RequestOwnershipTransfer(new_owner : ByStr20)`

  2. The proposed new owner accepts the owner ship: `transition ConfirmOwnershipTransfer()`

Script: [Ownership.js](./js/Ownership.js).

### Recursion
The [Recursion smart contract](./contracts/Recursion.scilla) shows how to use recursion in Scilla.
- create a list [m, m+1, ..., n-1] where `m` and `n` are inputs, see `transition CreateList(m : Uint32, n : Uint32)`
- compute the factorial of `n`: n! = 1 if n=0 and else n! = n*(n-1)*...*1, see `transition Factorial(n: Uint32)`

### Remote State Read
1. Reading built-in types:

    The [RemoteRead smart contract](./contracts/RemoteRead.scilla) shows how to read a field from a diffrent contract deployed on the chain:
    - The transition `ReadValueFromSetGet(.)` reads the field `value` from the smart contract [SetGet](./contracts/SetGet.scilla), see below. It defines the transition parameter `c` (the contract's address) as an address with a type of a contract with a field "value" of type "Uint128": `transition ReadValueFromSetGet(c: ByStr20 with contract field value: Uint128 end)`
    - The transition `ReadValueFromSetGet2(.)` uses a different approach to achieve the same purpose: instead of defining the transition parameter as a typed address, it does an address type cast inside the transition using the keyword `as` to be able to then read a field from that address: `contract_opt <- &addr as ByStr20 with contract field value: Uint128 end;`

    Script: [RemoteRead.js](./js/RemoteRead.js).

    **Notes**:
    The first approach is currently not working when using the [IDE](https://ide.zilliqa.com/#/) as the IDE needs to be upgraded to handle address types correctly first. It works, however, when calling the transition using the JS SDK (as in the [script](./js/RemoteRead.js)). The second approach on the other hand works on the IDE but not yet on ceres local server, because ceres still needs to be upgraded to support address type casts.
2. Reading a user defined ADT `AB`. Note that in this case the ADT needs to be defined in a user defined library (see [AdtLib.scilib](./scilib/AdtLib.scilib)) and both contracts 
    - the one defining the field from which it is then read, see [RemoteReadAdtFrom.scilla](./contracts/RemoteReadAdtFrom.scilla)
    - the one reading the lib (and thus the definition), see [RemoteReadAdt.scilla](./contracts/RemoteReadAdt.scilla)
  
    must import the user defined library using `import AdtLib`, i.e. the type `AB` is the same common one.

    Script: [RemoteReadAdt.js](js/RemoteReadAdt.js)


### Set and Get
The [SetGet smart contract](./contracts/SetGet.scilla) shows how to modify a state variable through a transition, and how to emit the value of a state variable in an event.

Script: [SetGet.js](./js/SetGet.js).

### Type function
The [TypeFunction smart contract](./contracts/TypeFunction.scilla) shows examples how to define type function with 1 or 2 arguments, and how to use them for concrete types, see `tfun: 'T => expr` in the [Scilla documentation](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#expressions).
- `fst` is copied from PairUtils: it extracts the first element of a Pair holding values of two arbitrary types `'A` and `'B` (the parametric types). The transition `StringUint32Pair(.)` shows how to apply it for a Pair holding a first element of type `String` and a second one of type `Uint32` (it returns the `String` element).
- `list_from_option` constructs a list out of an Option holding one or no value of an arbitrary type. If the option holds a value (of type `'A`, the parametric type), a one element list is returned with this value (of type `'A`). This is shown with an Option holding a `Uint32`. If the option does not hold a value (still of type `'A`, but constructed using `None`), the list returned is empty (but defined to hold elements of type `'A` nevertheless).


### User defined Library
The script [UserLibAllInOne.js](./js/UserLibAllInOne.js) uses the JS SDK to show how to
- define and deploy a library (only having pure expressions, no contract at all)
- deploy a contract that imports and uses it.

Note: This currently only works on isolated server (also: locally run using ceres) and test-net.

See also [RemoteReadAdt.js](js/RemoteReadAdt.js) where a user defined library defining a user defined ADT `AB` is deployed, namely [AdtLib.scilib](./scilib/AdtLib.scilib).
