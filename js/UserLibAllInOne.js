/*
  deploy a user defined lib, deploy a contract that uses it.

  usage: $node UserLibAllInOne.js {"test", "local"}

  pre: Zilliqa JS SDK from https://github.com/Zilliqa/Zilliqa-JavaScript-Library/

  see https://scilla.readthedocs.io/en/latest/scilla-in-depth.html#user-defined-libraries

  Notes: Experimental findings TOOD: confirm
    i)    also the lib needs a 'scilla_version 0' at the start of its scilla code
    ii)   only the lib (but not the contract using it) needs the boolean _library entry in the init json
    iii)  the lib can be deployed with the JS SDK as if it was a contract, ie. with 'zilliqa.contracts.new(.)', having above flag set
    iv)   the entry _extlibs in the contract's init JSON needs double parenthesis for the type: 'List ( Pair (String) (ByStr20) )'
    v)    works so far only on testnet

  Deployed Examples on testnet:
  - lib: https://devex.zilliqa.com/address/0xcd766e4cdf627006a60910a6d73e3fd4a88a05f1?network=https://dev-api.zilliqa.com
  - contract: https://devex.zilliqa.com/address/0xfc3fABCe86AbdEC4A6c8204bA59939e7deD06B81?network=https://dev-api.zilliqa.com
*/
'use strict';

const assert = require('assert');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { getAddressFromPrivateKey,
        toBech32Address } = require('@zilliqa-js/crypto');
const { BN, Long, units, bytes } = require('@zilliqa-js/util');
const { deploy_lib_from_file } = require("./blockchain.js");

// utility to query balance of address and convert from QA to ZIL
async function zil_balance_for_address(address, chain, verbose = false)
{
  const balance = await chain.blockchain.getBalance(address);
  let b_zil = new BN(balance.result.balance);
  b_zil = units.fromQa(b_zil, 'zil');
  if (verbose) {
    console.log(`balance of ${address} / ${toBech32Address(address)}: ${b_zil} ZIL`);
  }
  return b_zil;
}

async function run()
{
  let on_testnet = false;
  try {
    //console.log(process.argv)
    const which_env = process.argv.slice(2)[0];
    if (! ["test", "local"].includes(which_env)) {
      throw Error("first argument needs to be test or local as string");
    }
    on_testnet = which_env==="test";
  } catch (err) {
    console.log("Invalid or missing argument: ERROR\n",err);
    process.exit(1);
  }
  console.log(`Testing on ${on_testnet ? 'testnet' : 'locally run isolated server'}`);

  // set up for testnet or ceres local server
  const zilliqa = new Zilliqa(on_testnet ? 'https://dev-api.zilliqa.com' : 'http://localhost:5555');
  const VERSION = bytes.pack(on_testnet ? 333 : 222, 1);
  // an account on testnet and one on ceres
  // address:   zil13kq5k3snl7xru47rqvty5mzw4qevsuy7xspadt // 0x8D814B4613fF8c3E57C303164a6C4Ea832c8709E
  //            zil1my8ju5uvur0cnjp88jknkclvgj3ufmvz5pxyml // 0xd90f2e538ce0df89c8273cad3b63ec44a3c4ed82
  const private_key =
    on_testnet ?
    '2ac3dddc46a2ea900e18ce16eae87f603237fcebbed7a080de569988ebf3abf2' :
    'e53d1c3edaffc7a7bab5418eb836cf75819a82872b4a1a0f1c7fcf5c3e020b89';
  const address = getAddressFromPrivateKey(private_key); // base 16
  console.log(address);

  // query and log balance of account, add account to wallet if balace sufficient
  try {
    const balance = await zil_balance_for_address(address, zilliqa, true);
    assert(balance >= 100, `ZIL balance of account ${address} below 100 ZIL`);
    zilliqa.wallet.addByPrivateKey(private_key);

    // deploy a user defined library: SimpleLib which defines 'one = Uint32 1'
    try {
      const gp = units.toQa('2000', units.Units.Li); // gas price
      const gl = Long.fromNumber(80000); // gas limit: set at highest possible value here...
      const attempts = Long.fromNumber(20);
      const timeout = 500;
      const lib_init = [
        { vname: '_scilla_version', type: 'Uint32', value: '0', },
        // additional entry to declare this as library and not as contract
        { vname : '_library', type : 'Bool',
          value: { constructor: 'True', argtypes: [], arguments: [] }
        }
      ];
      let tx = '';
      let lib = null;
      console.log(` .. deploying library`);

      [tx, lib] = await deploy_lib_from_file('./../scilib/SimplisticLib.scilib');
      console.log(`  > transaction receipt is: ${JSON.stringify(tx.receipt)}`);

      let lib_address = '';
      if (tx.receipt.success) {
        lib_address = `${lib.address.toLowerCase()}`;
        console.log(`  > user_lib deployed @ ${lib_address}`);
        console.log(`  > lib.isDeployed() = ${lib.isDeployed()}, lib.isRejected() = ${lib.isRejected()}`);
      }
      else {
        throw Error(`tx to deploy library not successful with errors ${JSON.stringify(tx.receipt.errors)}`);
      }

      // deploy a simple contract that uses (imports) the above SimpleLib and uses its definition of 'one' in a transition
      try {
        const contract_code =
        `scilla_version 0
         import SimplisticLib
         contract TestUserLib()
         transition Compute()
           result = one; (* from SimpleLib *)
           e = {_eventname : \"Compute\"; res: result };
           event e
         end
        `;
        const contract_init = [
          { vname: '_scilla_version', type: 'Uint32', value: '0', },
          // additional entry for the user defined libraries: their name and address (only one here, but still a list!)
          { vname : '_extlibs', type : 'List ( Pair (String) (ByStr20) )',
            value : [
              { constructor : 'Pair', argtypes : ['String', 'ByStr20'],
                arguments : ['SimplisticLib', lib_address]
              },
            ]
          },
        ];
        const contract = zilliqa.contracts.new(contract_code, contract_init);
        console.log(` .. deploying contract, value[0] of _extlibs entry in init JSON is:`);
        contract_init.forEach((item) => {
          if (item.vname === '_extlibs') {
            console.log(item.value[0]);
          }
        });
        let sc = null;
        [tx, sc] = await contract.deploy(
          { version: VERSION, gasPrice: gp, gasLimit: gl, },
          attempts, timeout, false,
        );
        console.log(`  > transaction receipt is: ${JSON.stringify(tx.receipt)}`);
        if (tx.receipt.success) {
          console.log(`  > contract deployed @ ${sc.address}`);
          console.log(`  > sc.isDeployed() = ${sc.isDeployed()}, sc.isRejected() = ${sc.isRejected()}`);
        }
        else {
          throw Error(`tx to deploy contract not successful with errors ${JSON.stringify(tx.receipt.errors)}`);
        }

        // call transition Compute() that uses 'one' defined in the SimpleLib, and log the event to check results
        try {
          console.log(` .. calling Compute() transition`);
          tx = await sc.call(
            'Compute',
            [],
            { version: VERSION, amount: new BN('0'), gasPrice: gp, gasLimit: gl, },
            attempts, timeout, false,
          );
          console.log(`  > transaction receipt is: ${JSON.stringify(tx.receipt)}`);
          if (tx.receipt.success) {
            console.log(`  > event emitted: ${JSON.stringify(tx.receipt.event_logs[0])}`);
          }
          else {
            throw Error(`tx to call transition not successful with errors ${JSON.stringify(tx.receipt.errors)}`);
          }
        } catch (err) { console.log("Calling Transition: ERROR\n",err); }
      } catch (err) { console.log("Contract deployment: ERROR\n",err); }
    } catch (err) { console.log("Library deployment: ERROR\n", err); }
  } catch (err) { console.log("Account balance: ERROR\n",err); }

}

run();
