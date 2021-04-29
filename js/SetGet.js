/* deploy the SetGet contract and basic interactions   */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/SetGet.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // call set(.) and log state
      const val = 16;
      const args = [ { vname: 'v', type: 'Uint128',  value: val.toString() },];
      tx = await sc_call(sc, "set", args);
      const state = await sc.getState();
      console.log(`state after call to set(${val}):`, state);
      try { // call emit() and log event emitted
        tx = await sc_call(sc, "emit");
        console.log(`event_logs[0] after call to emit():`, tx.receipt.event_logs[0]);
      } catch (err) {
        console.log("emit(): ERROR\n",err);
      }
    } catch (err) {
      console.log("set(.): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
