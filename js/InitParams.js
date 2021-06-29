/* deploy contract twice, once with a correct init parameter and once with a wrong one   */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc = sst = null;
  try { 
    let init = [
      { vname: '_scilla_version', type: 'Uint32', value: '0',},
      { vname: 'element', type: 'Uint32', value: '5',}, // value < 10: OK!
    ];
    [tx, sc] = await deploy_from_file("../contracts/InitParams.scilla", init);
    console.log("contract InitParams deployed @ ", sc.address);
    sst = await sc.getSubState('list');
    console.log('field list when deployed with element = 5:', sst.list);
    // now deploy with a value that does NOT satisfy element < 10: fails
    init[1] = { vname: 'element', type: 'Uint32', value: '11'}; // value >= 10: NOT OK!
    [tx, sc] = await deploy_from_file("../contracts/InitParams.scilla", init);
    console.log("contract InitParams' address when depolyed with element = 11 ", sc.address);
    console.log('tx.receipt.success when deployed wit element = 11');
    console.log(tx.receipt.success);
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
