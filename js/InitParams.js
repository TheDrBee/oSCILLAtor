/* deploy contract thrice, once with correct init parameters and twice with a wrong one */

const { deploy_from_file, sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc = state = null;
  try {
    let init = [
      { vname: '_scilla_version', type: 'Uint32', value: '0',},
      { vname: 'element', type: 'Uint32', value: '5',}, // value < 10: OK!
      { vname: 'number',  type: 'Int32',  value: '33'}, // value > 0: OK!
    ];
    [tx, sc] = await deploy_from_file("../contracts/InitParams.scilla", init);
    console.log("contract InitParams deployed @ ", sc.address);
    state = await sc.getState();
    console.log('  contract deployed with element = 5 and number = 33');
    console.log('  field list:', state.list);
    console.log(`  field non_negative_integer = ${state.non_negative_integer}`);
    // now deploy with a value that does NOT satisfy element < 10: fails
    init[1] = { vname: 'element', type: 'Uint32', value: '11'}; // value >= 10: NOT OK!
    [tx, sc] = await deploy_from_file("../contracts/InitParams.scilla", init);
    console.log("contract InitParams' address when depolyed with element = 11:", sc.address);
    console.log(`  tx.receipt.success when deployed with element = 11: ${tx.receipt.success}`);
    // now deploy with a value that is ok but with a non-positive number: fails
    init[1] = { vname: 'element', type: 'Uint32', value: '3'}; // value >= 10: NOT OK!
    init[2] = { vname: 'number',  type: 'Int32',  value: '-2'}; // value >= 10: NOT OK!
    [tx, sc] = await deploy_from_file("../contracts/InitParams.scilla", init);
    console.log("contract InitParams' address when depolyed with number = -2:", sc.address);
    console.log(`  tx.receipt.success when deployed with number = -2: ${tx.receipt.success}`);
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
