/* deploy the List contract and interactions   */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run_remove()
{
  async function remove(val)
  {
    const args = [ { vname: 'value', type: 'Uint32',  value: val.toString() },];
    tx = await sc_call(sc, "RemoveIfEqualtTo", args);
    const l = await sc.getSubState('list');
    console.log(`list in state after call to remove ${val}:`, l);
  }

  let tx = sc = state = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/List.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // call create123(.) and log state
      tx = await sc_call(sc, "Create123");
      state = await sc.getState();
      console.log(`state after call to Create123():`, state);
      try { // compute 2*list[i] and store in a Map as map[l_i] = 2*l_i, l_i = list[i]
        tx = await sc_call(sc, "ComputeDoubles");
        state = await sc.getSubState('doubles');
        console.log(`doubles in state after call to compute twice the values`, state);
      } catch (err) {
        console.log("ComputeDoubles(.): ERROR\n", err);
      }
      try { // remove element with value 2, (non existing) value 0, value 1, value 3
        await remove(2);
        await remove(0);
        await remove(1);
        await remove(3);
      } catch (err) {
        console.log("RemoveIfEqualtTo(.): ERROR\n",err);
      }
      try { // compare [1,2,3] to [3,2,1] --> [False, True, False]
        console.log("calling Compare123To321()...")
        tx = await sc_call(sc, "Compare123To321");
        console.log(` stringified event's params:\n`, JSON.stringify(tx.receipt.event_logs[0].params));
      } catch (err) {
        console.log("Compare123To321(): ERROR\n", err);
      }
    } catch (err) {
      console.log("Create123(): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run_remove();
