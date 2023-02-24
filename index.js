const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 2000;
const express = require('express');
const app = express();
const cors = require('cors');
const bearerToken = require('express-bearer-token')

app.use(cors());
app.use(express.json());
app.use(bearerToken());

app.use(express.static('src/public'))

app.get('/', (req,res) => {
    res.status(200).send('<h1>TEMPLATE EXPRESS SOSMED</h1>')
});

// ROUTING
const userRouter = require('./src/routers/userRouter');
const tweetRouter = require('./src/routers/tweetRouter');
app.use('/user', userRouter);
app.use('/tweet', tweetRouter);

// ERROR-HANDLING
app.use((error, request, response, next) => { // default parameternya ada 4 
    if(error){
        return response.status(500).send(error);
    }
});


app.listen(PORT, () => console.log(`Running API ${PORT}`));