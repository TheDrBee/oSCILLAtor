# Hints on using the IDE

Hints, tipps and tricks for using the [IDE](https://ide.zilliqa.com/#/) or [staging-IDE](https://stg-ide.zilliqa.com/#/).

## Special Deployment Variables and Transition Parameters
Entering an ADT or complex types like a `List` in the IDE can be tricky. Assume the following transition arguments:

### Boolean
Enter the 'Bool" with a JSON-style entry that gives the constructor `True` or `False`, and empty argument types and values. For example to call a `transition ABool(b: Bool)` with `False` enter 
  `{ "constructor": "False", "argtypes": [], "arguments": [] }`

### Pair
Enter the `Pair` with a JSON-style entry that gives the constructor, the two argument types and the two values of the `Pair`'s entries. For example to call  a `transition APair(pair: Pair Int32 Uint32)` with the argument (-1,5) enter 
  `{"constructor":  "Pair", "argtypes": ["Int32", "Uint32"], "arguments": ["-1", "5"] }`

### Option
Enter the `Option` with a JSON-style entry that gives the constructor (`None` or `Some`), the argument type and for a non-empty Option the argument value (as String). For example to call a `transition AnOption(option: Option Uint32)` enter
- `{ "constructor": "None", "argtypes": ["Uint32"], "arguments": [] }` for an empty `Option`
- `{ "constructor": "Some", "argtypes": ["Uint32"], "arguments": ["12"] }` for an `Option` holding the value 12. 

### List
Enter the list as an array with each of the `List`'s elements as `String`. For example to call a `transition AList(str_list: List String, int_list: List Int32)` with the two lists as arguments {'Oh', 'Hello', 'Joe'} and {1,2} enter 
- `["Oh, "Hello", "Joe"]` (for `str_list`) and 
- `["1", "2"]` (for `int_list`).


