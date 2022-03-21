/* Interfacing with transitions taking ADTs as arguments:
     both builtin ADTs and user defined ones */

const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

const { BN, Long, units, bytes } = require('@zilliqa-js/util');

async function run()
{
  try { // deploy
    const init = [ { vname: '_scilla_version',     type: 'Uint32',   value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/Interfacing.scilla", init);
    console.log("contract deployed @ ", sc.address);
    const sc_addr = sc.address.toLowerCase(); // Important: only lower case format works

    // Boolean: call transition BoolTest with a boolean argurment.
    try {
      args = [ { vname: 'bool', type: 'Bool',  value: {constructor: 'True', argtypes: [], arguments: [] }},];
      tx = await sc_call(sc, "BoolTest", args);

      console.log("\n .. BoolTest: tx.receipt.event_logs[0].params.value:\n", tx.receipt.event_logs[0].params[0].value);
    } catch (err) {
      console.log("BoolTest(.): Error\n", err);
    }
    // Options: call transition OptionTest with an Option Uint32 that has a value of 15
    try {
      // Note how to create the argument value for 'option'
      args = [ {vname: 'option', type: 'Option Uint32', value: {constructor: 'Some', argtypes: ['Uint32'], arguments: ['15']}}, ];
      tx = await sc_call(sc, "OptionTest", args);
      console.log("\n  .. OptionTest: tx.receipt.event_logs[0].params.value:\n", tx.receipt.event_logs[0].params[0].value);
    } catch (err) {
      console.log("OptionTest(.): Error\n", err);
    }
    // Pair: call transition PairTest with a Pair Uint32 String that has value (1, "Hello")
    try {
      // Note how to create the argument for the pair and the parenthesis needed aroung the types of its entries (Uint32 and String)
      const p = {constructor: 'Pair', argtypes: ['Uint32', 'String'], arguments: ['1', 'Hello']};
      args = [ {vname: 'pair', type: 'Pair (Uint32) (String)', value: p }, ];
      tx = await sc_call(sc, "PairTest", args);
      console.log("\n .. PairTest: tx.receipt.event_logs[0].params.value:\n", tx.receipt.event_logs[0].params[0].value);
    } catch (err) {
      console.log("PairTest(.): Error\n", err);
    }
    // List:
    try {
      // call ListTest with a 3 element string list ["A", "B", "C"]. The simple way
      // Note that value is an array of strings but not a string itself
      args =  [ { vname: 'list',  type: 'List String', value: ["A", "B", "C"], }, ];
      tx = await sc_call(sc, "ListTest", args);
      console.log("\n  .. ListTest (simple way): tx.receipt.event_logs[0].params:\n", tx.receipt.event_logs[0].params);
      // call ListTest with a 2 element string list ["A", "B"]. The complicated but most general way
      // Note the special way of constructing the list using Nil and Cons (front inserting an element into existing list)
      const nil = { constructor: "Nil",  argtypes: ["String", ], arguments: [] };
      const lB  = { constructor: "Cons", argtypes: ["String"],   arguments: ["B", nil] };
      const lAB = { constructor: "Cons", argtypes: ["String"],   arguments: ["A", lB] };
      args =  [ { vname: 'list',  type: 'List String', value: lAB, }, ];
      tx = await sc_call(sc, "ListTest", args);
      console.log("  .. ListTest (general way): tx.receipt.event_logs[0].params:\n", tx.receipt.event_logs[0].params);
      // call ListOfPairsTest with a 1 element list of a pair [(1,"Hello")
      // Note the parenthesis needed in the type entry of the arguments
      args = [ {
        vname: 'list',
        type: 'List( Pair Uint32 String )',
        value: [ // a list of 2 pairs as value
          { constructor: 'Pair', argtypes: ['Uint32', 'String'], arguments: ['1', 'Hello']},
          { constructor: 'Pair', argtypes: ['Uint32', 'String'], arguments: ['2', 'ByeBye']} ]
        }];
      tx = await sc_call(sc, "ListOfPairsTest", args);
      console.log("\n  .. ListOfPairsTest: tx.receipt.event_logs[0].params:\n", tx.receipt.event_logs[0].params);
      console.log("  .. ListOfPairsTest: tx.receipt.event_logs[0].params[0].value:\n", tx.receipt.event_logs[0].params[0].value);
    } catch (err) {
      console.log("ListTest(.): Error\n", err);
    }
    // User defined ADTs: AB and Point3D
    try { // call transition ABTest
      // Note the special type and value for a user defined ADT (AB here)
      let args = [ {
        vname: "v", type: `${sc_addr}.AB`,
        value: {  constructor: `${sc_addr}.A`, argtypes: [], arguments: [] }
        }];
      tx = await sc_call(sc, "ABTest", args);
      console.log("\n  .. ABTest: tx.receipt.event_logs[0].params:\n", tx.receipt.event_logs[0].params);
    } catch (err) {
      console.log("ABTest(.): ERROR\n",err);
    }
    try { // call Point3DTest with 3 arguments of type Int32
      // note how to give the 3 coordinates to the construcctor as the 'value' entry of the argument
      args = [ {
        vname: 'p', type: `${sc_addr}.Point3D`,
        value: {  constructor: `${sc_addr}.Point3D`,
                  argtypes: [],
                  arguments: ['1', '-2', '5'] }
        }];
      tx = await sc_call(sc, "Point3DTest", args);
      console.log("\n  .. Point3DTest: tx.receipt.event_logs[0].params.value:\n", tx.receipt.event_logs[0].params[0].value);
    } catch (err) {
      console.log("Point3DTest(.): ERROR\n",err);
    }
  }

  catch (err) { console.log("deployment: ERROR\n",err); }
}

run();
