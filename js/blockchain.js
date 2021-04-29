const { Zilliqa } = require('@zilliqa-js/zilliqa');
const fs = require('fs');
const { BN, Long, units, bytes } = require('@zilliqa-js/util');
const {
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');

// chain setup on ceres locally run isolated server, see https://dev.zilliqa.com/docs/dev/dev-tools-ceres/. Keys and wallet setup
const setup = () =>
{
  let s = {
    "zilliqa": new Zilliqa('http://localhost:5555'),
    "VERSION": bytes.pack(222, 1),
    "priv_keys": [
            // b028055ea3bc78d759d10663da40d171dec992aa
            'e7f59a4beb997a02a13e0d5e025b39a6f0adc64d37bb1e6a849a4863b4680411',
            // f6dad9e193fa2959a849b81caf9cb6ecde466771":
            '589417286a3213dceb37f8f89bd164c3505a4cec9200c61f7c6db13a30a71b45', ],
  };
  s["addresses"] = [];
  s["pub_keys"] = [];
  s.priv_keys.forEach( item => {
    s.zilliqa.wallet.addByPrivateKey(item);// add key to wallet
    s.addresses.push(getAddressFromPrivateKey(item)); // compute and store address
    s.pub_keys.push(getPubKeyFromPrivateKey(item));
  });
  return s;
}

const tx_settings = {
  "gas_price": units.toQa('2000', units.Units.Li),
  "gas_limit": Long.fromNumber(50000),
  "attempts": Long.fromNumber(10),
  "timeout": 1000,
};
exports.setup = setup;
/* ---------------------------------------------------------------------------------------------------------------------------
utility functions
--------------------------------------------------------------------------------------------------------------------------- */
// read a file and return contents as a string
function read(f)
{
  t = fs.readFileSync(f, 'utf8', (err,txt) => {
    if (err) throw err;
  });
  return t;
}

// deploy a smart contract whose code is in a file with given init arguments
async function deploy_from_file(file, init)
{
  const code = read(path);
  const contract = setup.zilliqa.contracts.new(code, init);
  const [tx, sc] = await contract.deploy(
    { version: setup.VERSION, gasPrice: tx_settings.gas_price, gasLimit: tx_settings.gas_limit, },
    tx_settings.attempts, tx_settings.timeoute, false
  );
  return [tx, sc];
}

// call a smart contract's transition with given args and an amount to send from a given public key
async function sc_call(sc, transition, args, amt = new BN(0), caller_pub_key = getPubKeyFromPrivateKey(setup.keys[0]))
{
  const tx = await sc.call(
    transition,
    args,
    { version: setup.VERSION, amount: amt, gasPrice: tx_settings.gas_price,
      gasLimit: tx_settings.gas_limit, pubKey: caller_pub_key, },
    tx_settings.attempts, 1000, true,
  );
  return tx;
}

exports.deploy_from_file = deploy_from_file;
exports.sc_call = sc_call;
