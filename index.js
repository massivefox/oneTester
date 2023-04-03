const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const Caver = require("caver-js");
const caver = new Caver(`https://api.baobab.klaytn.net:8651`);


app.use(express.json());

app.listen(port, () => {
  console.log("listening...", port);
});
console.log(caver)
app.get("/", (req, res) => {
  res.send("Hello!");
});

// 계정 잔고 확인
app.get("/getbalance", async (req, res) => {
  try{
  console.log(req.query.address)
  const balance = await caver.klay.getBalance(req.query.address);
  console.log(balance)
  const convert = caver.utils.convertFromPeb(balance, "KLAY");
  res.json(`잔고 : ${convert}`);
}catch(e){
  console.log(e)
}
});

// 가장 최근에 생성된 블록 번호 확인
app.get("/getblock", async (req, res) => {
  const block = await caver.klay.getBlockNumber();
  res.json(block);
console.log(res)
});

// EOA로 Klaytn 계정 정보 확인
app.get("/getAccount", async (req, res) => {
  const account = await caver.klay.getAccount(req.query.address);
  res.json(account);
});

// 클레이튼을 다른 주소로 전송
app.get("/transfer", async (req, res) => {
  //   const sender = req.query.sender;
  const receiver = req.query.receiver;
  const amount = req.query.amount;

  let balance = await caver.klay.getBalance(process.env.ADDRESS);
  balance = caver.utils.fromPeb(balance, "KLAY");
  console.log(balance);

  if (balance > amount) {
    const keyring = caver.wallet.keyring.createFromPrivateKey(
      process.env.PRIVATE_KEY
    );
    const valueTransfer = caver.transaction.valueTransfer.create({
      from: keyring.address,
      to: receiver,
      value: caver.utils.toPeb(`${amount}`, "KLAY"),
      gas: 30000,
    });
    // console.log(valueTransfer);

    const signed = await valueTransfer.sign(keyring);
    console.log(`signed: ${signed}`);
    const receipt = await caver.rpc.klay.sendRawTransaction(signed);

    res.send(receipt);
  } else {
    res.status(400).send("transfer fail");
  }
});
