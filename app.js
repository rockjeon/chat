/* 설치한 express 모듈 불러오기 */
const express = require('express')

/* 설치한 socket.io 모듈 불러오기 */
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기 */
const http = require('http')

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require('fs')

/* express 객체 생성 */
const app = express()

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server)

/* web3 모듈 호출 */
const Web3 = require('web3')
const rpcURL = 'https://ropsten.infura.io/v3/f2d6082eec7d47fd9843b71b0651e47d' // Your RCkP URL goes here
//const rpcURL = 'https://rinkeby.infura.io/v3/f2d6082eec7d47fd9843b71b0651e47d' // Your RCkP URL goes here
//const rpcURL = 'http://localhost:8545)'
const web3 = new Web3(rpcURL)
const addressMy = '0x83438A43F40b7f442a55a4C63EC20549ba4AD6ae' // Your account address goes here
//const addressMy = '0x9561eFb35b6250DfECEb8a69919797Cc42fF557C'
//const addressMy = '0x92544353d4d07f71f8b4d1b45c3795b9995c83cd'


app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/index.html', function(err, data) {
    if(err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type':'text/html'})
      response.write(data)
      response.end()
    }
  })
})

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})



io.sockets.on('connection', function(socket) {

  /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')

    /* 소켓에 이름 저장해두기 */
    socket.name = name

    /* 모든 소켓에게 전송 */
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name
    
    console.log(data)

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', data);
  })

  /* 접속 종료 */
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 나가셨습니다.')

    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })

    /* 잔액 조회 메시지 */
    socket.on('balanceCheck', function(data) {
      /* 받은 데이터에 누가 보냈는지 이름을 추가 */
      data.name = socket.name
      
      console.log("message: ", data)
      console.log("account: ", data.account)
      
  

      // 여기부터 잔액 조회 하는 web3 넣기      
      web3.eth.getBalance(data.account.toString(), (err, wei) => { 
        let balance = web3.utils.fromWei(wei, 'ether')
        console.log("balance : " , balance) 
        /* 모든 소켓에게 전송 */
        io.sockets.emit('update', {type: 'balance', name: 'SERVER', message: balance})
      })
      
    })
})



