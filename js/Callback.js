/* deploy the Caller and Callee contracts and call - callback   */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc_callee = sc_caller = state = null;
  try { // deploy the callee and then the caller with callee's address
    let init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',},];
    [tx, sc_callee] = await deploy_from_file("../contracts/Callee.scilla", init);
    console.log("contract Callee deployed @ ", sc_callee.address);
    init.push({ vname: 'init_callee', type: 'ByStr20',  value: sc_callee.address });
    [tx, sc_caller] = await deploy_from_file("../contracts/Caller.scilla", init);
    console.log("contract Caller deployed @ ", sc_caller.address);
    try { // call set_value(.) on callee
      const val = 337;
      const args = [{ vname: 'new_value', type: 'Uint128', value: val.toString() }];
      tx = await sc_call(sc_callee, "set_value", args);
      state = await sc_callee.getState();
      console.log(`state of Callee after call to set_value(${val}):`, state);
      try { // cal call_for_value() on Caller and log state
        tx = await sc_call(sc_caller, "call_for_value", []);
        state = await sc_caller.getState();
        console.log(`state of Caller after call to call_for_value(.):\n`, state);
      } catch (err) {
        console.log("call_for_value(.): ERROR\n",err)
      }
    } catch (err) {
      console.log("set_value(): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
