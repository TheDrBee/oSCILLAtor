/* deploy the RemoteRead and the SetGet contracts to
   - set the value field in SetGet
   - read this value from RemoteRead contract and emit  */
const {
  setup,
  deploy_from_file,
  sc_call } = require("./blockchain.js");

async function run()
{
  const value = 123;
  let tx = sc = args = null;
  const init = [ { vname: '_scilla_version', type: 'Uint32', value: '0',}, ];
  try { // deploy the SetGet contract
    [tx, sc] = await deploy_from_file("../contracts/SetGet.scilla", init);
    console.log("contract SetGet deployed @ ", sc.address);
    const set_get_addr = sc.address.toLowerCase(); // Note: need lower case address later for remote state read
    try { // set the value field
      args = [ { vname: 'v', type: 'Uint128',  value: value.toString() },];
      tx = await sc_call(sc, "Set", args);
      const sst = await sc.getSubState("value");
      console.log(`field value in SetGet after call to Set(${value}):`, sst.value);
      try { // deploy RemoteRead contract
        [tx, sc] = await deploy_from_file("../contracts/RemoteRead.scilla", init);
        console.log("contract RemoteRead deployed @ ", sc.address);
        try { // call ReadValueFromSetGet transition to read the value from the SetGet contract
          args = [ { vname: 'c', type: 'ByStr20',  value: set_get_addr },];
          console.log(".. calling ReadValueFromSetGet on RemoteRead contract ..")
          tx = await sc_call(sc, "ReadValueFromSetGet", args);
          console.log("event emitted\n", tx.receipt.event_logs[0]);
          console.log("event's params Object\n", tx.receipt.event_logs[0].params);
        }
        catch (err) {
          console.log("ReadValueFromSetGet(.): ERROR\n", err);
        }
      }
      catch (err) {
        console.log("deploy_from_file(.): ERROR\n",err);
      }
    } catch (err) {
      console.log("Set(.): ERROR\n", err);
    }
  } catch (err) {
    console.log("deploy_from_file(.): ERROR\n",err);
  }
}

run();
