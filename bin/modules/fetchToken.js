/**
 *    Returns a promise that fetches the token and resolves with it if it's found
 *    @dep    {node}    fs
 *    @return {Promise}
 */
"use strict";
const fs = require("fs");
const Path = require("path");
const prompt = require("./prompt");
const Buttercup = require("buttercup");

const err = (message) => {
  return { id: "TOKEN", err: message }
};

module.exports = (rememberedToken) => {
  return new Promise((res, rej) => {
    if (rememberedToken){
      return res(rememberedToken);
    }

    let bcupPath = Path.resolve(__dirname, "../..", ".git-labelmaker.bcup");

    fs.exists(bcupPath, (exists) => {
      if (!exists) {
        rej(err("No token found!"));
      } else {
        prompt([{
          type: "password",
          name: "master_password",
          message: "What is your master password?"
        }])
        .then((answer) => {
          let datasource = new Buttercup.FileDatasource(bcupPath);
          datasource.load(answer.master_password).then((archive) => {
            // This is only guaranteed to work on buttercup 0.14.0, awaiting PR in buttercup
            let groups = archive.getGroups();
            let group = groups.filter((g) => g._remoteObject.title === 'git-labelmaker')[0];
            let token = group.getAttribute('token');
            res(token);
          })
          .catch((e)=>{
            rej(err(e.message));
          })
        })
        .catch((e)=>{
          rej(err(e.message));
        })
      }
    });
  });
};
