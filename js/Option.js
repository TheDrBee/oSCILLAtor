/* deploy the Option contract, set/remove its value, interact  */
const {
  deploy_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  async function log_opt()
  {
    const o = await sc.getSubState('opt');
    console.log(` stringified field opt:\n`, JSON.stringify(o));
  }

  async function emit()
  {
    console.log('Emit() ...');
    tx = await sc_call(sc, 'Emit');
    console.log(` stringified event:\n`, JSON.stringify(tx.receipt.event_logs[0]));
  }

  let tx = sc = null;
  try { // deploy the contract
    const init = [ { vname: '_scilla_version',     type: 'Uint32',   value: '0',}, ];
    [tx, sc] = await deploy_from_file("../contracts/Option.scilla", init);
    console.log("contract deployed @ ", sc.address);
    await log_opt();
    try { // set value to 10
      const value = 10;
      const args = [ { vname: 'v', type: 'Uint32',  value: value.toString() },];
      console.log(`SetTo(${value}) ...`);
      tx = await sc_call(sc, 'SetTo', args);
      await log_opt();
      try { // emit: EmitValue with value 10
        await emit();
        try { // clear the option (make "empty")
          console.log("Clear() ...")
          tx = await sc_call(sc, 'Clear');
          await log_opt();
          try { // emit: EmitNone
            await emit();
          } catch (err) {
            console.log("Emit(): ERROR\n",err)
          }
        } catch (err) {
          console.log("Clear(): ERROR\n",err)
        }
      } catch (err) {
        console.log("Emit(): ERROR\n",err);
      }
    } catch (err) {
      console.log("SetTo(.): ERROR\n",err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
