/* deploy the lib AdtLib, and the RemoteReadAdt and RemoteReadAdtFrom contracts
   - set the the ADT AB in "RemoteReadAdtFrom" contracct
   - read the value in RemoteReadAdt and emit
*/

const {
  setup,
  deploy_from_file,
  deploy_lib_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  let tx = sc_tmp = init = args = null;
  let sc = {};
  try { // deploy the AdtLib.scilib library
    const lib_name = "AdtLib";
    init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',}, ];
    console.log(`  .. deploying library`);
    [tx, lib] = await deploy_lib_from_file(`./../scilib/${lib_name}.scilib`);
    console.log(`    > transaction receipt is: ${JSON.stringify(tx.receipt)}`);

    let lib_address = '';
    if (tx.receipt.success) {
     lib_address = `${lib.address.toLowerCase()}`;
     console.log(`    > user_lib ${lib_name} deployed @ ${lib_address}`);
     console.log(`    > lib.isDeployed() = ${lib.isDeployed()}, lib.isRejected() = ${lib.isRejected()}`);
    }
    else {
      throw Error(`tx to deploy library ${lib_name} not successful with errors ${JSON.stringify(tx.receipt.errors)}`);
    }
    try { // deploy the RemoteReadAdtFrom and RemoteReadAdt contracts (they both import the AdtLib)
      init.push( {  vname : '_extlibs', type : 'List ( Pair (String) (ByStr20) )',
                    value : [
                      { constructor : 'Pair', argtypes : ['String', 'ByStr20'],
                        arguments : [lib_name, lib_address] }, ] });
      for (c of ["RemoteReadAdtFrom", "RemoteReadAdt"]) {
        console.log(`  .. deploying ${c}`);
        [tx, sc_tmp] = await deploy_from_file(`../contracts/${c}.scilla`, init);
        if (!tx.receipt.success) {
          throw Error(`tx to deploy ${c} contract not successful with errors ${JSON.stringify(tx.receipt.errors)}`);
        } else {
          sc[c] = sc_tmp;
          console.log(`    > contract ${c} deployed @ ${sc[c].address}`);
        }
      }
      try { // set the field ab in RemoteReadAdtFrom and then call Read in RemoteReadAdt to read it
        async function set_and_read(n, t)
        {
          let args = [ {vname: 'n', type: 'Uint32', value: n.toString() }];
          console.log(`  .. calling to SetAsT with T=${t} and n=${n}`);
          tx = await sc_call(sc["RemoteReadAdtFrom"], `SetAs${t}`, args);
          const sst = await sc["RemoteReadAdtFrom"].getSubState("ab");
          console.log(`    > field ab is:`)
          console.log(sst);
          args = [ { vname: 'c', type: 'ByStr20',  value: sc["RemoteReadAdtFrom"].address.toLowerCase() },];
          console.log(`  .. calling Read`);
          tx = await sc_call(sc["RemoteReadAdt"], 'Read', args);
          console.log(`    > params in event log: ${JSON.stringify(tx.receipt.event_logs[0].params)}`);

        }
        await set_and_read(10, "A");
        await set_and_read(500, "B");

      } catch (err) {
        console.log("set and read failed: ERROR\n", err);
      }
    } catch (err) {
      console.log("deploy_from_file(.): ERROR\n", err);
    }
  } catch (err) {
    console.log("deploy_lib_from_file(.): ERROR\n", err);
    process.exit(1);
  }
}

run();
