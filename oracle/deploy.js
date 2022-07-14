// Deploy DateTimeOracle and Client contract

'use strict';
var assert = require('assert');
const fs = require('fs');
const { getPubKeyFromPrivateKey } = require('@zilliqa-js/crypto');
const utils = require('./utils.js');

async function deploy_all()
{
  try {

    const cfg_json = utils.read_yaml_to_json('./config.yaml');
    //console.log(cfg_json);

    const output_file_path = `./${cfg_json.files.addresses}`;
    let output_json = {};

    const secrets_json = utils.read_yaml_to_json('./secrets.yaml');
    const keys = secrets_json; // private key(s)
    const ch = utils.chain(); // block chain info

    // get key of deployer and add to wallet
    const deployer_priv_key = keys.deployer;
    ch.zilliqa.wallet.addByPrivateKey(deployer_priv_key);
    const deployer_pub_key = getPubKeyFromPrivateKey(deployer_priv_key);

    async function deploy(file, init, pub_key)
    {
      console.log(` .. deploying contract from file ${file}`);
      const code = utils.StringFromFile(file);
      const contract = ch.zilliqa.contracts.new(code, init);
      let [tx, sc] = await contract.deploy( // Deployment
        { version: ch.VERSION, gasPrice: ch.txp.price, gasLimit: ch.txp.limit,  pubKey: pub_key },
        ch.txp.attempts, ch.txp.timeout, false,
      );
      console.log(` > .. contract from file ${file} deployed @ ${sc.address.toLowerCase()}`);
      return sc;
    }

    let sc = null;
    let sc_addresses = {};

    // deployer to deploy the Oracle contract
    sc = await deploy(
      `./${cfg_json.files.oracle}`,
      [
        { vname: '_scilla_version',     type: 'Uint32',   value: '0' },
      ],
      deployer_pub_key
    );
    sc_addresses['UnixTimeOracle'] = sc.address.toLowerCase();

    // deployer to deploy the Client contract
    sc = await deploy(
      `./${cfg_json.files.client}`,
      [
        { vname: '_scilla_version', type: 'Uint32',   value: '0' },
        { vname: 'oracle',          type: 'ByStr20', value: sc_addresses['UnixTimeOracle'] },
      ],
      deployer_pub_key
    );
    sc_addresses['OracleClient'] = sc.address.toLowerCase();

    // write contract addresses to output in yaml format
    output_json = sc_addresses;
    const yaml_string = utils.write_json_to_yaml(output_file_path, output_json);
    console.log(` > .. output written to ${output_file_path} `);
    console.log(`${yaml_string}`);

  } catch (e) {
      console.log(e);
  }
}

deploy_all();
