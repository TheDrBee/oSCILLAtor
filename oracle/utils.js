'use strict';
//var assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { bytes, units, Long } = require('@zilliqa-js/util');

function read(f) {
  const t = fs.readFileSync(f, 'utf8', (err,txt) => {
    if (err) throw err;
    console.log("file read. length of file = $(text.length)");
  });
  return t;
}
exports.StringFromFile = read;


function read_yaml_to_json(file_path)
{
  const contents = fs.readFileSync(file_path, 'utf8');
  const as_json = yaml.loadAll(contents);
  return (as_json.length===0 ? {} : as_json[0]); // handle existing but empty file case
}
exports.read_yaml_to_json = read_yaml_to_json;

function write_json_to_yaml(file_path, json)
{
  const yaml_string = yaml.dump(json);
  fs.writeFileSync(file_path, yaml_string, 'utf8');
  return yaml_string;
}
exports.write_json_to_yaml = write_json_to_yaml;

const chain = () =>
{
  return {
      zilliqa:    new Zilliqa('https://dev-api.zilliqa.com'),
      VERSION:    bytes.pack(333, 1),
      websocket:  'wss://dev-ws.zilliqa.com',
      txp: {
        "price":    units.toQa('2000', units.Units.Li), // gas price
        "limit":    Long.fromNumber(80000), // gas limit
        "attempts": Long.fromNumber(20), // number of attempts
        "timeout":  1000, // wait n millisecs between attempts
      }
    };
}
exports.chain = chain;
