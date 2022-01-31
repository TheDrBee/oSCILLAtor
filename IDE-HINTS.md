# Hints on using the IDE

Hints, tipps and tricks for using [IDE](https://ide.zilliqa.com/#/) or [staging-IDE](https://stg-ide.zilliqa.com/#/).

## Special Deployment Variables and Transition Parameters
Entering an ADT or complex types like a `List` in the IDE can be tricky. Assume the following transition arguments

### Boolean
Enter the 'Bool" with JSDON-style entry that tives the constructor `True` or `False`, and empty argument types and values. For example to call `transition ABool(b: Bool)` with `False` enter `{ "constructor": "False", "argtypes": [], "arguments": [] }`

### Pair
Enter the `Pair` with a JSON-style entry that gives constructor, the 2 argument types and the 2 values. For example to call  a `transition APair(pair: Pair Int32 Uint32)` with the argument (-1,5) enter 
  `{"constructor":  "Pair", "argtypes": ["Int32", "Uint32"], "arguments": ["-1", "5"] }`


### List
Enter the list as an array with each of the elements as `String`. For example to call a 
`transition AList(str_list: List String, int_list: List Int32)` with the two list as arguments {'Oh', 'Hello', 'Joe'} and {1,2} enter `["Oh, "Hello", "Joe"]` (for `str_list`) and `["1", "2"]` (for `int_list`).


