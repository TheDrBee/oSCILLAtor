/* deploy the AMap contract and interactions   */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc = state = sst = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/AMap.scilla", init);
    console.log("contract deployed @ ", sc.address);
    try { // call SumOfKeys() and log the event to see the result: should be 4+19=23
      console.log("calling SumOfKeys ..");
      tx = await sc_call(sc, "SumOfKeys");
      console.log("event emitted\n", tx.receipt.event_logs[0]);
    } catch (err) {
      console.log("SumOfKeys(): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
